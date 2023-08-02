import { db } from '../utils/db.js'
import catchAsync from '../utils/catchAsync.js'

export const getAllRequests = catchAsync(async (req, res) => {
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

export const getRequestsHistory = catchAsync(async (req, res) => {

    let { range = 21, app = '' } = req.query

    range = parseInt(range) || 21

    let history = []
    let limit = 24

    if (range > 1) {
        const todayHours = new Date().getHours()
        const days = range - 1
        limit = (days * 24) + todayHours
    }

    history = await db.collection('requests_history')
        .find({ app })
        .sort({ 'datetime': -1 })
        .limit(limit)
        .project({ _id: 0, count: 1 })
        .toArray()

    let newHistory = []

    history.forEach(item => {
        newHistory.push(item.count)
    })

    if (newHistory.length < limit) {
        const remaining = limit - newHistory.length
        Array(remaining).fill(0).forEach(() => {
            newHistory.push(0)
        })
    }

    let fixedLengthHistory = []

    if (range > 1) {
        const todayHours = new Date().getHours()
        const todayArray = newHistory.slice(0, todayHours)
        const otherDaysArray = newHistory.slice(todayHours, -1)

        let array = []

        const todayStats = todayArray.reduce((a, b) => a + b, 0)
        array.push(todayStats)

        for (let i = 0; i < range - 1; i++) {
            const sum = otherDaysArray.slice(i * 24, (i * 24) + 24).reduce((a, b) => a + b, 0)
            array.push(sum)
        }
        fixedLengthHistory = array.reverse()
    }
    else {
        fixedLengthHistory = newHistory.reverse()
    }

    res.status(200).send({
        status: 200,
        history: fixedLengthHistory,
    })
})

export const getSingleRequest = catchAsync(async (req, res) => {

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