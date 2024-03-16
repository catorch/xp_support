export interface IVectorDoc {
    content: string
    embedding: number[]
    source?: string
}

export interface IChatMsg {
    role: "user" | "system" | "assistant",
    content: string
}