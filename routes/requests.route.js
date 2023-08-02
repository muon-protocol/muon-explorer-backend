import express from 'express'
import { getAllRequests, getRequestsHistory, getSingleRequest } from '../controllers/index.js'

const requestsRouter = express.Router()

requestsRouter.get('/', getAllRequests)
requestsRouter.get('/history', getRequestsHistory)
requestsRouter.get('/:id', getSingleRequest)

export default requestsRouter