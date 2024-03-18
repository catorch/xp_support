import OpenAI from 'openai'
import { IChatMsg } from '../types/index.js'

const FORMAT_INSTRUCTIONS = `Return the response as a valid JSON object e.g. {"text":"Final response"}`


class OpenAIHandler {

    openai: any
    modelName: string
    temperature: number
    stream: boolean = true

    constructor({
        modelName, stream = true, temperature = 1.0
    }: { modelName?: string, stream?: boolean, temperature?: number }) {
        this.modelName = modelName ?? 'gpt-4-0125-preview'
        this.stream = stream
        this.temperature = temperature ?? 1.0
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
    }

    async executePrompt(systemPromptMsg: string, outputInstructionsMsg: string, chatMsgs: IChatMsg[]) {

        const messages = [
            { role: 'system', content: systemPromptMsg },
            ...chatMsgs,
            { role: 'system', content: outputInstructionsMsg },
            { role: 'system', content: FORMAT_INSTRUCTIONS }
        ]

        console.log(messages)

        const stream = await this.openai.chat.completions.create({
            model: this.modelName,
            messages,
            stream: this.stream,
            temperature: this.temperature,
        })

        return stream
    }

    extractResponse = (inputString: string): string => {
        const regex = /```json\s*([\s\S]*?)\s*```/
        const matches = inputString.match(regex)

        if (matches && matches[1]) {
            // Found JSON content
            return matches[1].trim()
        }

        // If no JSON block is found, return original string
        return inputString
    }
}

export default OpenAIHandler