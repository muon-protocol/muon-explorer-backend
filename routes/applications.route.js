import express from 'express'
import { getAllApplications, getSingleApplication } from '../controllers/index.js'

const applicationsRouter = express.Router()

applicationsRouter.get('/', getAllApplications)
applicationsRouter.get('/:id', getSingleApplication)

export default applicationsRouter