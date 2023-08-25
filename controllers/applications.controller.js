import { db } from '../utils/db.js'
import fs from 'fs'
import path from 'path'
import catchAsync from '../utils/catchAsync.js'

const __dirname = process.cwd()

export const getAllApplications = catchAsync(async (req, res) => {
    let { page = 1, limit = 10, search = '' } = req.query

    page = parseInt(page) || 1
    limit = parseInt(limit) || 10
    limit = limit > 50 ? 50 : limit
    const skip = limit * (page - 1);

    const query = { $or: [{ id: { $regex: search.toLowerCase() } }] }

    let applications = []
    let total = 0

    applications = await db
        .collection('applications')
        .find(search ? query : {})
        .limit(limit)
        .skip(skip)
        .toArray()

    total = await db.collection('applications').countDocuments(search ? query : {})

    res.status(200).send({
        status: 200,
        total,
        applications,
    })
})

export const getSingleApplication = catchAsync(async (req, res) => {

    let { id } = req.params

    const application = await db.collection('applications').findOne({ id })

    if (!application) {
        res.status(404).send({
            status: 404,
            message: 'app not found'
        })
        return
    }

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