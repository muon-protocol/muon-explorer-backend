import express from 'express'
import { db } from '../utils/db.js'

const router = express.Router()

router.get('/', async (req, res) => {
    let { page = 1, limit = 10, search = '', app = '' } = req.query

    page = parseInt(page) || 1
    limit = parseInt(limit) || 10
    const skip = limit * (page - 1);

    const col = db.collection('requests')

    const projections = {
        _id: 1,
        reqId: 1,
        app: 1,
        method: 1,
        gwAddress: 1,
        signatures: 1,
        startedAt: 1,
        confirmedAt: 1
    }

    const query = { $or: [{ reqId: { $regex: search } }, { gwAddress: { $regex: search } }] }
    const queryWithAppId = { app, ...query }

    let requests = []
    let total = 0

    if (search) {
        requests = await col
            .find(app ? queryWithAppId : query)
            .sort({ 'startedAt': -1 })
            .limit(limit)
            .skip(skip)
            .project(projections)
            .toArray()

        total = await col.countDocuments(app ? queryWithAppId : query)
    }
    else {
        requests = await col
            .find(app ? { app } : {})
            .sort({ 'startedAt': -1 })
            .limit(limit)
            .skip(skip)
            .project(projections)
            .toArray()
        total = await col.countDocuments(app ? { app } : {})
    }

    res.status(200).send({
        status: 200,
        total,
        requests,
    })
})

router.get('/history', async (req, res) => {

    let { range = 21, app = '' } = req.query

    range = parseInt(range) || 21

    let history = []

    history = await db.collection('requests_history')
        .find({ app })
        .sort({ 'first_date': -1 })
        .limit(range * 24)
        .project({ count: 1, _id: 0 })
        .map(i => i.count)
        .toArray()

    let filledHistory = history

    if (filledHistory.length < (range * 24)) {
        const remaining = (range * 24) - filledHistory.length
        Array(remaining).fill(0).forEach(item => {
            filledHistory.push(item)
        })
    }

    const reversedHistory = [...filledHistory].reverse()

    res.status(200).send({
        status: 200,
        history: reversedHistory,
    })
})

router.get('/:id', async (req, res) => {

    let { id } = req.params

    const requestFound = await db.collection('requests').findOne({ _id: id })

    if (!requestFound) {
        res.status(404).send({
            status: 404,
            message: 'request not found'
        })
        return
    }

    res.status(200).send({
        status: 200,
        request: requestFound
    })
})

export default router