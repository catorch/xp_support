import Image from "next/image";
import { Inter } from "next/font/google";
import { useState } from "react";
import TextareaAutosize from 'react-textarea-autosize'
import { Rings } from 'react-loader-spinner'
import { marked } from 'marked'
import DOMPurify from "isomorphic-dompurify"
import chalk from 'chalk'
import { ReactNotifications, Store } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'
const inter = Inter({ subsets: ["latin"] })
const renderer = new marked.Renderer()
renderer.link = (href, title, text) => {
  return `<a target="_blank" rel="noopener noreferrer" href="${href}" title="${title}">${text}</a>`;
}

export default function Home() {

  const [inputMsg, setInputMsg] = useState('')
  const [responseMsg, setResponseMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMsg = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    const systemPromptMsg = `You are a helpful AI designed by Xperiencify, whose role is to be a customer support agent. Your main task is to answer any questions related to the Xperiencify platform, its services and features, as well as help customers solve their questions and problems. Use the provided documentation to help the user find a solution to the problem. If you don't know something, you indicate it instead of making up content. Add all relevant references and sources at the end of your message.`
    const outputInstructionsMsg = `Reply to user's message. IMPORTANT: Return a valida JSON object with the following structure: {"text":"<STRING>"}`
    const params = {
      inputMsg,
      systemPromptMsg,
      outputInstructionsMsg,
    }
    try {

      if (!inputMsg) {
        throw Error("Missing input message")
      }

      const url = `${process.env.NEXT_PUBLIC_API_BASE}/api/bot`
      setIsLoading(true)
      // const url = "http://localhost:5000/api/bot"
      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })
        .then((res) => res.json())
      console.log(chalk.green(JSON.stringify(response)))
      setIsLoading(false)

      if (response?.status !== 'OK') {
        throw new Error(response?.message)
      }

      setResponseMsg(response?.payload ?? '')

    } catch (e: any) {
      console.error(e)
      setIsLoading(false)
      setResponseMsg('')
      Store.addNotification({
        title: "Error",
        message: e?.message ?? 'An error occurred!',
        type: "danger",
        insert: "top",
        container: "top-right",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
          duration: 5000,
          onScreen: true
        }
      })
    }
  }
  const safeHtml = typeof responseMsg === 'string' ? DOMPurify.sanitize(marked.parse(responseMsg.replace(/\n/g, '<br />'), { renderer }) as string) : ''

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between sm:p-24 ${inter.className}`}
    >
      <ReactNotifications />
      <div className="flex flex-col gap-y-4 w-full max-w-xl px-6 py-8 rounded-lg shadow-md bg-white">
        <h1 className="text-black/80 font-semibold text-lg">XP Support Bot</h1>

        <TextareaAutosize
          onChange={(e) => setInputMsg(e.target.value)}
          className="rounded-[3px] p-2 text-black/80 border border-gray-200 focus:border-[#36c86c] focus:ring-1 focus:ring-[#36c86c] focus:outline-none min-h-[40px]"
          placeholder="Enter your message here..."
          required
        />


        {
          !isLoading
            ? <button
              onClick={sendMsg}
              className="bg-[#36c86c] rounded-[3px] py-3 px-2">Send</button>
            : <div className="flex justify-center mt-2">
              <Rings
                visible={true}
                height="80"
                width="80"
                color="#36c86c"
                ariaLabel="rings-loading"
                wrapperStyle={{}}
                wrapperClass=""
              />
            </div>
        }

        <hr className="my-2" />

        <div
          className="text-black/70 font-semibold"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />

      </div>
    </main>
  );
}
