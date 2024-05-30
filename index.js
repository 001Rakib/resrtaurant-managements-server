const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8wqvy9o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    // await client.connect();
    const foodCollection = client.db("restaurant-server").collection("foods");
    const orderCollection = client.db("restaurant-server").collection("orders");
    const userCollection = client.db("restaurant-server").collection("users");

    // Get all foods
    app.get("/foods", async (req, res) => {
      const email = req.query.email;

      if (email) {
        const result = foodCollection.find({ email: email });
        const foods = await result.toArray();
        res.send(foods);
      } else {
        const cursor = foodCollection.find();
        const foods = await cursor.toArray();
        res.send(foods);
      }
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Restaurant server running");
});

app.listen(port, () => {
  console.log(`Restaurant server listening on port ${port}`);
});
