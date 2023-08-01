import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'

import applicationsRoutes from './routes/applicationsRoutes.js'
import requestRoutes from './routes/requestsRoutes.js'

import { initBreeInstance } from './jobs/index.js'

const app = express()

app.use(express.json())
app.use(helmet())
app.use(cors())
app.disable('x-powered-by')

app.use('/api/v1/applications', applicationsRoutes)
app.use('/api/v1/requests', requestRoutes)

app.get("/api/v1", (req, res) => {
    res.status(200).json({ message: "Muon Explorer V1" });
});

initBreeInstance()

morgan('combined', {
    skip: function (req, res) { return res.statusCode < 400 }
})

// custom 404
app.use((req, res, next) => {
    res.status(404).send("Not found")
})

// custom error handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Internal server error')
})

const PORT = process.env.PORT || 8004

app.listen(PORT, () => {
    console.log("Server is running on port: ", PORT)
})