import mongoose from "mongoose"
const { Schema } = mongoose

export const VectorSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, auto: true },
    embedding: { type: [Number], required: true },
    content: { type: String, required: true },
    source: { type: String, required: false }
}, {
    _id: false,
    timestamps: true,
})

export default mongoose.models.Vector || mongoose.model("Vector", VectorSchema)