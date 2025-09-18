// scripts/seed-mongodb.js
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

const uri = process.env.MONGODB_URI ||
  'mongodb+srv://derek:derek@cluster0.uvuc0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = process.env.MONGODB_DB || 'foodchain';

const loadJson = (file) => JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', file), 'utf8'));

const addLowercaseAddress = (records) =>
  records.map((doc) => ({ ...doc, addressLower: doc.address?.toLowerCase() }));

(async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);

    const users = addLowercaseAddress(loadJson('users.json').users || []);
    const merchants = addLowercaseAddress(loadJson('merchants.json').merchants || []);

    if (users.length) {
      await db.collection('users').deleteMany({});
      await db.collection('users').insertMany(users);
      console.log(`Inserted ${users.length} users`);
    }

    if (merchants.length) {
      await db.collection('merchants').deleteMany({});
      await db.collection('merchants').insertMany(merchants);
      console.log(`Inserted ${merchants.length} merchants`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
})();
