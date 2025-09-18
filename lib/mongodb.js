import { MongoClient, ServerApiVersion } from 'mongodb';

const DEFAULT_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://derek:derek@cluster0.uvuc0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

if (!DEFAULT_URI) {
  throw new Error('Missing MongoDB connection string. Set MONGODB_URI in your environment variables.');
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(DEFAULT_URI, options);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export const getDb = async () => {
  const mongoClient = await clientPromise;
  const dbName = process.env.MONGODB_DB || 'foodchain';
  return mongoClient.db(dbName);
};

export default clientPromise;
