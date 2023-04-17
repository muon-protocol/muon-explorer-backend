import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'

import applicationsRoutes from './routes/applicationsRoutes.js'
import requestRoutes from './routes/requestsRoutes.js'
// import nodesRoutes from './routes/nodesRoutes.js'

import { initBreeInstance } from './jobs/index.js'

const whitelist = ['http://localhost:3004']
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) {//for bypassing postman req with no origin
            return callback(null, true);
        }
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        }
        else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const app = express()

app.use(express.json())
app.use(helmet())
app.use(cors(corsOptions))
morgan('combined', {
    skip: function (req, res) { return res.statusCode < 400 }
})

app.use('/applications', applicationsRoutes)
app.use('/requests', requestRoutes)
// app.use('/nodes', nodesRoutes)

initBreeInstance()

app.get("/", (req, res) => {
    res.status(200).json({ message: "Muon Explorer V1" });
});

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
    console.log("Server is running on port", PORT)
})

// process.on('uncaughtException', err => {
//     console.log(`Error: ${err.stack}`);
//     console.log('Shutting down due to uncaught exception');
//     process.exit(1)
// })

// process.on('unhandledRejection', err => {
//     console.log(`Error: ${err.stack}`)
//     console.log(`Shutting down the server due to unhandled Promise rejection`)
//     server.close(() => {
//         process.exit(1)
//     })
// })