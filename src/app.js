import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import config from './config/config.js'

const app = express()
app.use(cors({
    origin: config.cors_origin,
    credentials: true
}))

app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true, limit: "1mb" }))
app.use(cookieParser())



// Route Imports
import userRoute from './routes/user.route.js'
import userManagementRoute from './routes/userAccountManagement.route.js'
import videoRoute from './routes/video.route.js'

// Route declaration
app.use('/v1/api/auth', userRoute)
app.use("/v1/api/user", userManagementRoute)
app.use("/v1/api/video", videoRoute)


export { app }