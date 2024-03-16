import { Response } from "express";

export function sendJSONresponse(res: any, status: number, content: { status: string; message?: string; payload?: string | undefined; }) {
    res.status(status)
    res.json(content)
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
