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

    //create user
    app.post("/users", async (req, res) => {
      const user = req.body;
      // insert user email if the the user does not exists
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }

      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // Get all foods
    app.get("/foods", async (req, res) => {
      const email = req.query.email;
      const name = req.query.name;

      if (name) {
        const regEx = new RegExp(name, "i");
        const result = foodCollection.find({ name: name });
        const foods = await result.toArray();
        res.send(foods);
      }

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

    // Get single food
    app.get("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const food = await foodCollection.findOne(query);
      res.send(food);
    });

    // Add a new food
    app.post("/foods", async (req, res) => {
      const food = req.body;
      const result = await foodCollection.insertOne(food);
      res.send(result);
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
