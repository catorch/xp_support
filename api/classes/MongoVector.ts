import OpenAI from 'openai'
import chalk from 'chalk'
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import Vector from '../models/vector.js'
import { IVectorDoc } from '../types/index.js'

class MongoVector {

    openai

    constructor(apiKey?: string) {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? apiKey })
    }

    async generateEmbedding(input: string): Promise<any> {
        return await this.openai.embeddings.create({
            model: "text-embedding-ada-002",
            input,
        })
    }

    async createDocuments({ text, chunkSize = 500, chunkOverlap = 0, source }
        : { text: string, chunkSize: number, chunkOverlap: number, source?: string }): Promise<IVectorDoc[]> {

        const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap })
        const texts = await textSplitter.splitText(text)

        const embeddingPromises = texts.map((text: string) => {
            return this.generateEmbedding(text)
        })

        const embeddings = await Promise.all(embeddingPromises)

        const documents = texts.map((text: string, index: number) => {
            return {
                content: text,
                embedding: embeddings[index]?.data[0]?.embedding,
                source,
            }
        })

        return documents
    }

    async saveDocuments({ docs }: { docs: IVectorDoc[] }) {
        for (let doc of docs) {
            const vectorDoc = new Vector({
                content: doc.content,
                embedding: doc.embedding,
                source: doc?.source,
            })
            await vectorDoc.save()
        }
        console.log(chalk.green("Vector store documents saved"))
        return true
    }

    async findDocumentsFromCollection({ queryText, collectionId, nResults = 5 }
        : { queryText: string, collectionId?: string, nResults?: number }) {

        const queryEmbedding = (await this.generateEmbedding(queryText))?.data[0]?.embedding

        const searchQuery = {
            index: "vector_index",
            queryVector: queryEmbedding,
            path: "embedding",
            numCandidates: 100,
            limit: nResults,
        }

        const docs = await Vector.aggregate([
            //@ts-ignore
            { "$vectorSearch": searchQuery }
        ])

        return docs
    }
}


export default MongoVector