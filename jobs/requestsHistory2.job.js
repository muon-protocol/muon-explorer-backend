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

    // ======================================================================================
    // TOTAL REQUESTS HISTORY
    // ======================================================================================

    const lastHistoryList = await db.collection('requests_history')
        .find({ app: '', temp: true })
        .sort({ datetime: -1 })
        .limit(1)
        .toArray();
    const lastHistory = lastHistoryList[0]

    const lastHistoryBasicTime = getBasicTime(lastHistory?.datetime || Date.now())
    const nowBasicTime = getBasicTime(Date.now())

    const count = await db.collection('requests').countDocuments({ startedAt: { $gt: nowBasicTime }, app: '' });

    if (lastHistory && lastHistoryBasicTime === nowBasicTime) {
        await db.collection('requests_history').findOneAndUpdate({ _id: lastHistory._id }, { $set: { count } })
    }
    else {
        await db.collection('requests_history').deleteOne({ app: '', temp: true })
        await db.collection('requests_history').insertOne({ datetime: nowBasicTime, count, app: '', temp: true })
    }

    // ======================================================================================
    // APPS REQUESTS HISTORY
    // ======================================================================================

    const apps = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data/apps.json')))

    const appPromises = apps.map(async app => {
        const promise = new Promise(async resolve => {

            const lastAppHistoryList = await db.collection('requests_history')
                .find({ app: app.id, temp: true })
                .sort({ datetime: -1 })
                .limit(1)
                .toArray();
            const lastAppHistory = lastAppHistoryList[0]

            const lastAppHistoryBasicTime = getBasicTime(lastAppHistory?.datetime || Date.now())
            const nowAppBasicTime = getBasicTime(Date.now())

            const count = await db.collection('requests').countDocuments({ startedAt: { $gt: nowAppBasicTime }, app: app.id });

            if (lastAppHistory && lastAppHistoryBasicTime === nowAppBasicTime) {
                await db.collection('requests_history').findOneAndUpdate({ id: lastAppHistory._id }, { $set: { count } })
            }
            else {
                await db.collection('requests_history').deleteOne({ app: app.id, temp: true })
                await db.collection('requests_history').insertOne({ datetime: nowAppBasicTime, count, app: app.id, temp: true })
            }

            resolve()
        })
        return promise
    })

    await Promise.all(appPromises)

    if (parentPort) parentPort.postMessage('done');
    else process.exit(0);
})()