import express from 'express'
import cookieParser from 'cookie-parser';
import cors from 'cors'
import userRouter from './routes/user.routes.js';
const app = express();

// Setting cros origin for * all ips or api request
app.use(cors({
    origin:process.env.CORS_ORIGIN, credentials:true
}))

app.use(express.json({limit:"16Kb"})) //Body parser

//URL-Encoder
app.use(express.urlencoded({extended:true, limit:"16Kb"}))

//Public asset file accessing
app.use(express.static("public"))

//CookieParser
app.use(cookieParser())

//Routers
app.use('/api/v1/users',userRouter)

export { app }