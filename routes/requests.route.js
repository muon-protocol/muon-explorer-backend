import express from 'express'
import { getAllRequests, getRequestsHistory, getSpenderRequests, getSingleRequest } from '../controllers/index.js'

const requestsRouter = express.Router()

requestsRouter.get('/', getAllRequests)
requestsRouter.get('/history', getRequestsHistory)
requestsRouter.get('/spender', getSpenderRequests)
requestsRouter.get('/:id', getSingleRequest)

export default requestsRouter