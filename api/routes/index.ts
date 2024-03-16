import { Router } from 'express'
import { expressjwt, } from "express-jwt"

// Middlewares
const auth = expressjwt({ secret: process.env.JWT_SECRET!, algorithms: ['HS256'] })

import * as botController from '../controllers/bot.js'
import * as documentController from '../controllers/document.js'
import * as testController from '../controllers/test.js'

const router = Router()

router.post("/bot", botController.generateBotMessage as any)
router.post("/doc", documentController.saveDocument as any)

router.get("/test", testController.test)

export default router