import dotenv from 'dotenv'
dotenv.config()

import { MongoClient } from "mongodb";

const connectionString = process.env.MONGODB_URI || "";

const mongoClient = new MongoClient(connectionString);

let client;

try {
    client = await mongoClient.connect();
}
catch (e) {
    console.error(e);
}

const dbName = process.env.MONGODB_DB_NAME

const db = client.db(dbName);

export { db };