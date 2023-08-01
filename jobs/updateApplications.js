import { db } from '../utils/db.js'
import { parentPort } from 'worker_threads'
import fs from 'fs'
import path from 'path'
import axios from 'axios'

const __dirname = process.cwd()

let isCancelled = false;

if (parentPort) {
    parentPort.once('message', message => {
        if (message === 'cancel') isCancelled = true;
    });
}

(async () => {
    if (isCancelled) return

    const staticApps = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data/apps.json')))

    const appsToAdd = staticApps.map(i => ({ ...i, data: {} }))
    const createPromises = appsToAdd.map(async app => {
        const promise = new Promise(async resolve => {
            await db.collection('applications').findOneAndReplace({ id: app.id }, app, { upsert: true })
            resolve()
        })
        return promise
    })

    await Promise.all(createPromises)

    const apps = await db.collection('applications').find().toArray()

    if (apps.length !== appsToAdd.length) {
        let ids = []
        apps.forEach(item => {
            const found = appsToAdd.find(i => i.id === item.id)
            if (!found) {
                ids.push(item.id)
            }
        })
        const deletePromises = ids.map(async id => {
            const promise = new Promise(async resolve => {
                await db.collection('applications').deleteOne({ id })
                resolve()
            })
            return promise
        })
        await Promise.all(deletePromises)
    }

    const correctApps = await db.collection('applications').find().toArray()

    const updatePromises = correctApps.map(async app => {
        const promise = new Promise(async resolve => {
            try {
                const { data } = await axios.get(`https://alice.muon.net/v1/?app=explorer&method=app&params[appName]=${app.id}`)
                if (data?.success) {
                    const { contexts, ...other } = data.result
                    const lastContext = contexts?.at(-1)
                    const values = { ...other, context: lastContext }
                    await db.collection('applications').findOneAndUpdate({ id: app.id }, { '$set': { data: values } })
                    resolve()
                }
            }
            catch (err) {
                console.log('update apps failed');
                resolve()
            }
        })
        return promise
    })

    await Promise.all(updatePromises)

    if (parentPort) parentPort.postMessage('done');
    else process.exit(0);
})()