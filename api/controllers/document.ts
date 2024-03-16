import MongoVector from "../classes/MongoVector.js"
import { sendJSONresponse } from "../utils/index.js"

interface ISaveDocumentRequest {
    content?: string
    source?: string
}

export async function saveDocument(req: Request, res: Response) {

    const { content, source } = req.body as ISaveDocumentRequest

    if (!content) {
        sendJSONresponse(res, 422, { status: 'ERROR', message: 'Missing document content' })
        return
    }

    try {
        const mongoVector = new MongoVector()
        const docs = await mongoVector.createDocuments({
            text: content,
            chunkSize: 500,
            chunkOverlap: 100,
            source,
        })
        await mongoVector.saveDocuments({ docs })
        sendJSONresponse(res, 200, { status: 'OK', message: 'Document saved!' })
        return
    } catch (e: any) {
        console.error(e)
        sendJSONresponse(res, 500, { status: 'ERROR', message: 'Failed to save document' })
        return
    }
}