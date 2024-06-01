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
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    // await client.connect();
    const foodCollection = client.db("restaurant-server").collection("foods");
    const orderCollection = client.db("restaurant-server").collection("orders");
    const userCollection = client.db("restaurant-server").collection("users");

    // jwt related api
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    // middlewares
    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "forbidden access" });
      }
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
        if (error) {
          return res.status(401).send({ message: "forbidden access" });
        }
        req.decoded = decoded;
        next();
      });
    };

    //create user
    app.post("/users", verifyToken, async (req, res) => {
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
    //get users
    app.get("/users", verifyToken, async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

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

    // Get single food
    app.get("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const food = await foodCollection.findOne(query);
      res.send(food);
    });

    // Add a new food
    app.post("/foods", verifyToken, async (req, res) => {
      const food = req.body;
      const result = await foodCollection.insertOne(food);
      res.send(result);
    });

    // Update a food
    app.patch("/foods/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const food = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: food,
      };
      const result = await foodCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // Delete a food
    app.delete("/foods/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.deleteOne(query);
      res.send(result);
    });

    // Add an order
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    // Get all orders
    app.get("/orders", verifyToken, async (req, res) => {
      const orders = await orderCollection.find().toArray();
      res.send(orders);
    });

    // Get orders by email
    app.get("/orders/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const orders = await orderCollection.find(query).toArray();
      res.send(orders);
    });

    // Delete an order
    app.delete("/orders/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
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
