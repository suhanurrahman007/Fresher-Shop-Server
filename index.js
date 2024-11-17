const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.FT_DB_USER}:${process.env.FT_DB_PASS}@cluster0.33tct4k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const usersCollection = client.db("superShop").collection("users");
    const productsCollection = client.db("superShop").collection("products");
    const postsCollection = client.db("superShop").collection("posts");
    const commentsCollection = client.db("superShop").collection("comments");
    const paymentCollection = client.db("superShop").collection("payment");
    // ============================== ADMIN =================================

    // Admin
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;

      if (email !== req.decoded.email) {
        return res.status(403).send({
          message: "forbidden access",
        });
      }

      const query = {
        email: email,
      };
      const user = await usersCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === "admin";
      }
      res.send({
        admin,
      });
    });

    // patch method for user to make admin
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // ============================= USER ================================

    // Users related api
    app.get("/users", async (req, res) => {
      const user = req.query.email;
      const query = {};
      if (user) {
        query.email = user;
      }

      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      // const query = {
      //   email: user?.email,
      // };
      // const existingUser = await usersCollection.findOne(query);
      // if (existingUser) {
      //   return res.send({
      //     message: "user already exist",
      //     insertedId: null,
      //   });
      // }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // ============================== Product Shop =================================

    app.get("/products", async (req, res) => {
      const page = Number(req.query.page);
      const size = Number(req.query.size);

      const options = {
        sort: {
          time: -1,
        },
      };
      const result = await productsCollection
        .find({}, options)
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const product = req.body;
      const query = {
        _id: new ObjectId(id),
      };
      const options = {
        upsert: true,
      };
      const updateProduct = {
        $set: {
          name: product.name,
          brandName: product.brandName,
          productType: product.productType,
          price: product.price,
          rating: product.rating,
          productImageURL: product.productImageURL,
          detailedDescription: product.detailedDescription,
        },
      };

      const result = await productsCollection.updateOne(
        query,
        updateProduct,
        options
      );
      res.send(result);
    });

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      // const product = req.body
      const query = {
        _id: new ObjectId(id),
      };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    // =========================== Posts ==============================

    // post method for posts
    app.post("/posts", async (req, res) => {
      const posts = req.body;
      posts.time = new Date();
      const result = await postsCollection.insertOne(posts);
      res.send(result);
    });

    // get method for posts
    app.get("/posts", async (req, res) => {
      const page = Number(req.query.page);
      const size = Number(req.query.size);

      const options = {
        sort: {
          time: -1,
        },
      };

      const result = await postsCollection
        .find({}, options)
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    });

    app.get("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await postsCollection.findOne(query);
      res.send(result);
    });

    // =========================== Comments ==============================

    // post method for posts
    app.post("/comments", async (req, res) => {
      const comments = req.body;
      comments.time = new Date();
      const result = await commentsCollection.insertOne(comments);
      res.send(result);
    });

    // get method for posts
    app.get("/comments", async (req, res) => {
      const result = await commentsCollection.find().toArray();
      res.send(result);
    });

    app.get("/comments/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await commentsCollection.findOne(query);
      res.send(result);
    });

    // ========================== PAYMENT ==============================
    //payment api here
    app.post("/create-payment-intent", async (req, res) => {
      try {
        const { amount } = req.body;

        const totalAmount = parseFloat(amount * 100);
        // console.log(totalAmount);
        const paymentIntent = await stripe.paymentIntents.create({
          amount: totalAmount,
          currency: "usd",
          payment_method_types: ["card"],
        });

        res.send({
          clientSecret: paymentIntent.client_secret,
        });
      } catch (error) {
        console.log(error.message);
      }
    });

    app.post("/payment", async (req, res) => {
      const payment = req.body;
      const result = await paymentCollection.insertOne(payment);
      res.send(result);
    });

    app.get("/payment", async (req, res) => {
      const user = req.query.email;
      const query = {};
      if (user) {
        query.email = user;
      }
      const result = await paymentCollection.find(query).toArray();
      res.send(result);
    });

    // +++++++++++++++++++++++++++ THE END ++++++++++++++++++++++++++++

    // Send a ping to confirm a successful connection
    await client.db("admin").command({
      ping: 1,
    });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Fresher Shop Server is running.....");
});

app.listen(port, () => {
  console.log(`Fresher Shop Server running Port is ${port}`);
});
