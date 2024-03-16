import './config/config.js'
console.log('USER: ', process.env.DB_USER)
import cors from 'cors'
import express from 'express'
import bodyParser from 'body-parser'
import fileUpload from 'express-fileupload'
import apiRouter from './routes/index.js'
import { connectMongoDb } from './models/mongo.js'
import mongoose from 'mongoose'

const app = express()

app.use(cors({ origin: '*', credentials: true }))
app.use(fileUpload({ limits: { fileSize: 300 * 1024 * 1024 } })) // Adjust the size limit
app.use(bodyParser.json({ limit: '300mb' }))
app.use(bodyParser.urlencoded({ limit: '300mb', extended: true }))

app.use('/api', apiRouter)

app.use((err: any, req: any, res: any, next: any) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401)
        res.json({ status: 'ERROR', message: 'Unauthorized user' })
    } else if (err.type === 'entity.too.large') {
        res.status(413)
        res.json({ status: 'ERROR', message: 'Payload is too large' })
    }
})


const port = process.env.PORT || 3000

connectMongoDb().then(() => {
    app.listen(port, () => {
        console.log(`HTTP Server running on port ${port}`)
    })

    // Graceful shutdown and error handling
    process.on('SIGINT', async () => {
        await mongoose.connection.close()
        console.log('MongoDB connection closed')
        process.exit(0)
    })

    process.on('uncaughtException', async (error) => {
        console.error('Uncaught Exception: ', error)
        await mongoose.connection.close()
        process.exit(1) // Exit with a failure code
    })

    process.on('unhandledRejection', async (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason)
        await mongoose.connection.close()
        process.exit(1)
    })

}).catch((err: any) => {
    console.error('Failed to connect to MongoDB', err)
})


export default app


