// Simple proxy server to forward MongoDB queries
// Usage: run this on a machine that can reach MongoDB Atlas
//        then point your local backend at it.

const express = require('express');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const atlasUri = process.env.MONGO_URI; // should be Atlas connection string
if (!atlasUri) {
  console.error('MONGO_URI not defined in environment');
  process.exit(1);
}

const client = new MongoClient(atlasUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();
app.use(express.json());

// Example proxy endpoint for users collection; you can add others as needed
app.post('/proxy/users/find', async (req, res) => {
  try {
    const filter = req.body.filter || {};
    await client.connect();
    const db = client.db();
    const users = await db.collection('users').find(filter).toArray();
    res.json(users);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).send(err.message);
  }
});

app.listen(3001, () => {
  console.log('MongoDB proxy listening on port 3001');
});
