// import { ExpressJwtRequest as Request } from "express-jwt"
import { Request, Response } from 'express'
import { sendJSONresponse } from '../utils/index.js'

export async function test(req: Request, res: Response) {
    try {
        sendJSONresponse(res, 200, { 'status': 'OK', message: "Hello World!", payload: process.env.NODE_ENV })
        return
    } catch (e) {
        console.error(e)
        sendJSONresponse(res, 400, { status: 'Internal server error' })
        return
    }
}