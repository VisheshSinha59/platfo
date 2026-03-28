import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Please add MONGODB_URI to .env.local");

const options = {
  maxPoolSize: 10,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
};

let clientPromise;

if (!global._mongoClientPromise) {
  const client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect()
    .then((client) => {
      console.log("MongoDB connected!");
      return client;
    })
    .catch((err) => {
      console.error("MongoDB error:", err.message);
      global._mongoClientPromise = null;
      throw err;
    });
}

clientPromise = global._mongoClientPromise;
export default clientPromise;

