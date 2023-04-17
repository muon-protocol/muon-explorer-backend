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

    const totalHistories = await db.collection('requests_history')
        .find({ app: '' })
        .sort({ first_date: -1 })
        .limit(1)
        .toArray()

    if (!totalHistories.length) {

        let first_date = null
        let last_date = null
        let count = 0
        let historyToSave = []

        await db.collection('requests')
            .find()
            .sort({ startedAt: 1 })
            .project({ startedAt: 1, _id: 0 })
            .forEach(item => {
                if (!first_date) {
                    first_date = item.startedAt
                }
                const diff = ((new Date(item.startedAt).getTime() * 1000) - (new Date(first_date).getTime() * 1000)) / 36e5
                if (diff < 1) {
                    last_date = item.startedAt
                    count += 1
                }
                else {
                    historyToSave.push({ count, first_date, last_date, app: '' })
                    first_date = item.startedAt
                    last_date = item.startedAt
                    count = 1
                }
            })

        if (count > 0) {
            historyToSave.push({ count, first_date, last_date, app: '' })
        }

        if (historyToSave.length) {
            await db.collection('requests_history').insertMany(historyToSave)
        }
    }
    else {
        const lastHistory = totalHistories[0]

        const remainingRequests = await db.collection('requests')
            .find({ startedAt: { $gt: lastHistory.last_date } })
            .sort({ startedAt: 1 })
            .project({ startedAt: 1, _id: 0 })
            .toArray()

        if (remainingRequests.length) {

            const mainDiff = ((new Date().getTime()) - (new Date(lastHistory.first_date).getTime() * 1000)) / 36e5

            if (mainDiff < 1) {
                let count = 0

                remainingRequests.forEach(() => {
                    count += 1
                })

                await db.collection('requests_history').findOneAndUpdate(
                    { app: '', first_date: lastHistory.first_date },
                    { $inc: { count } }
                )
            }
            else {
                let first_date = null
                let last_date = null
                let count = 0
                let historyToSave = []

                remainingRequests.forEach(item => {
                    if (!first_date) {
                        first_date = item.startedAt
                    }
                    const diff = ((new Date(item.startedAt).getTime() * 1000) - (new Date(first_date).getTime() * 1000)) / 36e5
                    if (diff < 1) {
                        last_date = item.startedAt
                        count += 1
                    }
                    else {
                        historyToSave.push({ count, first_date, last_date, app: '' })
                        first_date = item.startedAt
                        last_date = item.startedAt
                        count = 1
                    }
                })

                if (count > 0) {
                    historyToSave.push({ count, first_date, last_date, app: '' })
                }

                if (historyToSave.length) {
                    await db.collection('requests_history').insertMany(historyToSave)
                }
            }
        }
    }

    const apps = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data/apps.json')))

    const promises = apps.map(async app => {
        const promise = new Promise(async resolve => {
            const appHistories = await db.collection('requests_history')
                .find({ app: app.id })
                .sort({ first_date: -1 })
                .limit(1)
                .toArray()

            if (!appHistories.length) {

                let first_date = null
                let last_date = null
                let count = 0
                let historyToSave = []

                await db.collection('requests')
                    .find({ app: app.id })
                    .sort({ startedAt: 1 })
                    .project({ startedAt: 1, _id: 0 })
                    .forEach(item => {
                        if (!first_date) {
                            first_date = item.startedAt
                        }
                        const diff = ((new Date(item.startedAt).getTime() * 1000) - (new Date(first_date).getTime() * 1000)) / 36e5
                        if (diff < 1) {
                            last_date = item.startedAt
                            count += 1
                        }
                        else {
                            historyToSave.push({ count, first_date, last_date, app: app.id })
                            first_date = item.startedAt
                            last_date = item.startedAt
                            count = 1
                        }
                    })

                if (count > 0) {
                    historyToSave.push({ count, first_date, last_date, app: app.id })
                }

                if (historyToSave.length) {
                    await db.collection('requests_history').insertMany(historyToSave)
                }
            }
            else {
                const lastHistory = appHistories[0]

                const remainingRequests = await db.collection('requests')
                    .find({ app: app.id, startedAt: { $gt: lastHistory.last_date } })
                    .sort({ startedAt: 1 })
                    .project({ startedAt: 1, _id: 0 })
                    .toArray()

                if (remainingRequests.length) {

                    const mainDiff = ((new Date().getTime()) - (new Date(lastHistory.first_date).getTime() * 1000)) / 36e5

                    if (mainDiff < 1) {
                        let count = 0

                        remainingRequests.forEach(() => {
                            count += 1
                        })

                        await db.collection('requests_history').findOneAndUpdate(
                            { app: app.id, first_date: lastHistory.first_date },
                            { $inc: { count } }
                        )
                    }
                    else {
                        let first_date = null
                        let last_date = null
                        let count = 0
                        let historyToSave = []

                        remainingRequests.forEach(item => {
                            if (!first_date) {
                                first_date = item.startedAt
                            }
                            const diff = ((new Date(item.startedAt).getTime() * 1000) - (new Date(first_date).getTime() * 1000)) / 36e5
                            if (diff < 1) {
                                last_date = item.startedAt
                                count += 1
                            }
                            else {
                                historyToSave.push({ count, first_date, last_date, app: app.id })
                                first_date = item.startedAt
                                last_date = item.startedAt
                                count = 1
                            }
                        })

                        if (count > 0) {
                            historyToSave.push({ count, first_date, last_date, app: app.id })
                        }

                        if (historyToSave.length) {
                            await db.collection('requests_history').insertMany(historyToSave)
                        }
                    }
                }
            }

            resolve()
        })
        return promise
    });

    await Promise.all(promises)

    if (parentPort) parentPort.postMessage('done');
    else process.exit(0);
})()