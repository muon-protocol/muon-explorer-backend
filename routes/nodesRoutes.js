import express from 'express'
import { db } from '../utils/db.js'

const router = express.Router()

router.get('/', async (req, res) => {
    res.status(200).send('success')
})

export default router