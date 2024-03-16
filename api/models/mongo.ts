import mongoose from 'mongoose'

// MongoDB Connection URL
const dbConnectionUrl = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority&maxPoolSize=49`

// Singleton MongoDB Connection
const connectMongoDb = async () => {
    // Check if we're already connected or connecting (readyState 1 or 2)
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
        console.log('Reusing existing database connection')
        return mongoose.connection
    } else {
        try {
            // Attempt new connection
            await mongoose.connect(dbConnectionUrl)
            console.log('Connected to MongoDB!')
        } catch (error) {
            console.error('Connection error', error)
            throw error
        }
    }
}

export { connectMongoDb }
