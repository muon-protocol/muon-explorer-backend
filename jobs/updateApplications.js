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

    let apps = await db.collection('applications').find().toArray()

    if (staticApps.length !== apps.length) {
        const appsToAdd = staticApps.map(i => ({ ...i, data: {} }))
        await db.collection('applications').insertMany(appsToAdd)
        apps = await db.collection('applications').find().toArray()
    }

    const promises = apps.map(async app => {
        const promise = new Promise(async resolve => {
            try {
                const { data } = await axios.get(`https://alice.muon.net/v1/?app=explorer&method=app&params[appName]=${app.id}`)
                if (data?.success) {
                    await db.collection('applications').findOneAndUpdate({ id: app.id }, { '$set': { data: data.result } })
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

    await Promise.all(promises)

    if (parentPort) parentPort.postMessage('done');
    else process.exit(0);
})()