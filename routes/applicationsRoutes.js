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

    const col = db.collection('requests')

    const apps = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data/apps.json')))

    let applications = []
    let total = 0

    if (search) {
        applications = apps
            .filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
            .slice(skip, skip + limit)

        total = apps.filter(i => i.name.toLowerCase().includes(search.toLowerCase())).length
    }
    else {
        applications = apps.slice(skip, skip + limit)
        total = apps.length
    }

    const joinPromises = applications.map(async item => {
        const promise = new Promise(async resolve => {
            const count = await col.countDocuments({ app: item.id, confirmed: true })
            resolve({ ...item, confirmed_requests: count })
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

    const apps = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data/apps.json')))

    const application = apps.find(i => i.id === id)

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
            const code = fs.readFileSync(path.resolve(__dirname, `functions/${item}`)).toString()
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