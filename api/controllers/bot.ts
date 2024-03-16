import { jsonrepair } from "jsonrepair"
import MongoVector from "../classes/MongoVector.js"
import OpenAIHandler from "../classes/OpenAIHandler.js"
import { IChatMsg, IVectorDoc } from "../types/index.js"
import { sendJSONresponse } from "../utils/index.js"
import chalk from "chalk"

interface IGenerateBotMessageRequest {
    inputMsg?: string
    systemPromptMsg?: string
    outputInstructionsMsg?: string
}

export async function generateBotMessage(req: Request, res: Response) {

    const { inputMsg, systemPromptMsg, outputInstructionsMsg } = req.body as IGenerateBotMessageRequest

    if (!inputMsg) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Missing input message' })
        return
    }

    if (!systemPromptMsg) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Missing system prompt' })
        return
    }

    if (!outputInstructionsMsg) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Missing output instructions' })
        return
    }

    let chatMsgs: IChatMsg[] = []

    try {
        const mongoVector = new MongoVector()

        const vectorResults: IVectorDoc[] = await mongoVector.findDocumentsFromCollection({
            queryText: inputMsg,
            nResults: 10,
        })

        console.log(chalk.green("Vector store results: ", vectorResults?.length ?? 0))

        if (vectorResults && vectorResults?.length > 0) {
            for (let result of vectorResults) {
                chatMsgs.push({ role: "system", content: `Documentation: "${result?.content}". ${result?.source ? `Source: ${result?.source}` : ''}` })
            }
        }

    } catch (e: any) {
        console.error(e)
        sendJSONresponse(res, 500, { status: 'ERROR', message: 'Failed to generate bot\'s response' })
        return
    }

    // Add input message
    chatMsgs.push({ role: "user", content: inputMsg })

    try {
        const agent = new OpenAIHandler({ stream: false })

        const rawResponse = await agent.executePrompt(systemPromptMsg, outputInstructionsMsg, chatMsgs)
        console.log(rawResponse?.choices?.[0]?.message?.content)
        // const response = JSON.parse(jsonrepair(agent.extractResponse(rawResponse?.choices?.[0]?.message?.content?.trim())))
        sendJSONresponse(res, 200, { status: 'OK', payload: rawResponse?.choices?.[0]?.message?.content?.trim() })
        return
    } catch (e) {
        console.error(e)
        sendJSONresponse(res, 500, { status: 'ERROR', message: 'Error fetching agent\'s response' })
        return
    }
}