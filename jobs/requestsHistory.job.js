import { db } from '../utils/db.js'
import { parentPort } from 'worker_threads'
import fs from 'fs'
import path from 'path'

const __dirname = process.cwd()

let isCancelled = false;

if (parentPort) {
    parentPort.once('message', message => {
        if (message === 'cancel') isCancelled = true;
    });
}

(async () => {
    if (isCancelled) return

    // ======================================================================================
    // FUNCTIONS
    // ======================================================================================

    const getBasicTime = (value) => {
        const date = String(value).length === 13 ? value : value * 1000
        const converted = new Date(new Date(date).setMinutes(0)).setSeconds(0)
        return Math.floor(converted / 1000)
    }

    const getNextBasicTime = (value) => {
        let date = String(value).length === 13 ? value : value * 1000
        const converted = new Date(date).setHours(new Date(date).getHours() + 1)
        return Math.floor(converted / 1000)
    }

    const handleUpdateHistory = async (start, app = '') => {
        let historyToSave = []

        let startTime = getBasicTime(start)
        let endTime = getNextBasicTime(startTime)

        let promises = []

        while (endTime <= getBasicTime(Date.now())) {

            const promise = new Promise(async (resolve) => {
                let datetime = startTime
                let appQuery = app ? { app } : {}
                const count = await db.collection('requests')
                    .countDocuments({ startedAt: { $gt: startTime, $lt: endTime }, ...appQuery });

                historyToSave.push({ datetime, count, app })
                resolve()
            })
            promises.push(promise)

            startTime = endTime
            endTime = getNextBasicTime(endTime)
        }

        await Promise.all(promises)

        const sortedHistoryToSave = [...historyToSave].sort((a, b) => a.datetime - b.datetime)

        if (historyToSave.length) {
            await db.collection('requests_history').insertMany(sortedHistoryToSave)
        }
    }

    // ======================================================================================
    // TOTAL REQUESTS HISTORY
    // ======================================================================================

    const lastHistoryList = await db.collection('requests_history')
        .find({ app: '' })
        .sort({ datetime: -1 })
        .limit(1)
        .toArray();
    const lastHistory = lastHistoryList[0]

    const firstRequestList = await db.collection('requests')
        .find()
        .sort({ startedAt: 1 })
        .limit(1)
        .toArray();
    const firstRequest = firstRequestList[0]

    let start = null

    if (!lastHistory) {
        start = firstRequest.startedAt
    }
    else {
        start = getNextBasicTime(lastHistory.datetime)
    }

    await handleUpdateHistory(start)

    // ======================================================================================
    // APPS REQUESTS HISTORY
    // ======================================================================================

    const apps = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data/apps.json')))

    const appPromises = apps.map(async app => {
        const promise = new Promise(async resolve => {

            const lastAppHistoryList = await db.collection('requests_history')
                .find({ app: app.id })
                .sort({ datetime: -1 })
                .limit(1)
                .toArray();
            const lastAppHistory = lastAppHistoryList[0]

            const firstAppRequestList = await db.collection('requests')
                .find({ app: app.id })
                .sort({ startedAt: 1 })
                .limit(1)
                .toArray();
            const firstAppRequest = firstAppRequestList[0]

            if (!lastAppHistory) {
                await handleUpdateHistory(firstAppRequest.startedAt, app.id)
            }
            else {
                const start = getNextBasicTime(lastAppHistory.datetime)
                await handleUpdateHistory(start, app.id)
            }

            resolve()
        })
        return promise
    })

    await Promise.all(appPromises)

    if (parentPort) parentPort.postMessage('done');
    else process.exit(0);
})()