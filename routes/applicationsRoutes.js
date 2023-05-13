import express from 'express'
import { db } from '../utils/db.js'
import fs from 'fs'
import path from 'path'

const __dirname = process.cwd()

const router = express.Router()

router.get('/', async (req, res) => {
    let { page = 1, limit = 10, search = '' } = req.query

    page = parseInt(page) || 1
    limit = parseInt(limit) || 10
    const skip = limit * (page - 1);

    const col = db.collection('applications')

    const projections = { data: 0 }

    const query = { $or: [{ id: { $regex: search.toLowerCase() } }] }

    let applications = []
    let total = 0

    applications = await col
        .find(search ? query : {})
        .limit(limit)
        .skip(skip)
        .project(projections)
        .toArray()

    total = await col.countDocuments(search ? query : {})

    const joinPromises = applications.map(async app => {
        const promise = new Promise(async resolve => {
            const count = await db.collection('requests').countDocuments({ app: app.id, confirmed: true })
            resolve({ ...app, confirmed_requests: count })
        })
        return promise
    });

    const allRes = await Promise.all(joinPromises)

    applications = allRes

    res.status(200).send({
        status: 200,
        total,
        applications,
    })
})

router.get('/:id', async (req, res) => {

    let { id } = req.params

    const application = await db.collection('applications').findOne({ id })

    if (!application) {
        res.status(404).send({
            status: 404,
            message: 'app not found'
        })
        return
    }

    const count = await db.collection('requests').countDocuments({ app: application.id, confirmed: true })

    application.confirmed_requests = count

    let codes = []

    try {
        application.fnames.forEach(item => {
            let directory = ''
            const exist1 = fs.existsSync(path.resolve(__dirname, `apps/general/${item}`)) ? 'general' : ''
            const exist2 = fs.existsSync(path.resolve(__dirname, `apps/general_test/${item}`)) ? 'general_test' : ''
            const exist3 = fs.existsSync(path.resolve(__dirname, `apps/custom/${item}`)) ? 'custom' : ''
            directory = exist1 || exist2 || exist3
            const code = fs.readFileSync(path.resolve(__dirname, `apps/${directory}/${item}`)).toString()
            codes.push({ name: item, code })
        })
    }
    catch (err) {
        console.log(err)
    }

    application.codes = codes

    res.status(200).send({
        status: 200,
        application
    })
})

export default router