const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const app = express();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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
    const ratingsCollection = client.db("superShop").collection("ratings");
    const cartsCollection = client.db("superShop").collection("carts");
    const brandsCollection = client.db("superShop").collection("brand");
    const paymentCollection = client.db("superShop").collection("payment");
    const orderCollection = client.db("superShop").collection("order");
    const jobCollection = client.db("superShop").collection("job");
    const returnCollection = client.db("superShop").collection("return");


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
      const query = {
        email: user?.email,
      };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({
          message: "user already exist",
          insertedId: null,
        });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // patch method for user to make admin
    app.patch("/users/:id", async (req, res) => {
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

    // patch method for user to make admin
    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "delivery boy",
        },
      };
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.delete("/users/:id", async (req, res) => {
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
          date: -1,
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
      product.date = new Date();
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
          product_name: product?.product_name,
          brand: product?.brand,
          price: product?.price,
          discount_price: product?.discount_price,
          product_type: product?.product_type,
          description: product?.description,
          category: product?.category,
          image: product?.image,
          status: product?.status,
          date: new Date(),
        },
      };

      console.log(updateProduct);

      const result = await productsCollection.updateOne(
        query,
        updateProduct,
        options
      );
      res.send(result);
    });

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
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

    app.put("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const post = req.body;
      const query = {
        _id: new ObjectId(id),
      };
      const options = {
        upsert: true,
      };
      const updatePost = {
        $set: {
          name: post?.name,
          userImg: post?.userImg,
          title: post?.title,
          description: post?.description,
          category: post?.category,
          status: post?.status,
          image: post?.image,
          tag: post.tag,
          date: new Date(),
        },
      };

      console.log(updatePost);

      const result = await postsCollection.updateOne(
        query,
        updatePost,
        options
      );
      res.send(result);
    });

    app.delete("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await postsCollection.deleteOne(query);
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

    app.delete("/comments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await commentsCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/comments/:id", async (req, res) => {
      const id = req.params.id;
      const { updatedLike } = req.body; // Destructure the correct field from the body

      const filter = { _id: new ObjectId(id) };
      const likeUpdate = {
        $set: {
          like: updatedLike, // Correctly use the updated like count
        },
      };

      try {
        const result = await commentsCollection.updateOne(filter, likeUpdate);
        res.send(result);
      } catch (error) {
        console.error("Error updating like:", error);
        res.status(500).send({ error: "Failed to update like" });
      }
    });

    // =========================== ratings ==============================

    // post method for posts
    app.post("/ratings", async (req, res) => {
      const ratings = req.body;
      ratings.time = new Date();
      const result = await ratingsCollection.insertOne(ratings);
      res.send(result);
    });

    // get method for posts
    app.get("/ratings", async (req, res) => {
      const result = await ratingsCollection.find().toArray();
      res.send(result);
    });

    app.get("/ratings/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await ratingsCollection.findOne(query);
      res.send(result);
    });

    app.delete("/ratings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ratingsCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/ratings/:id", async (req, res) => {
      const id = req.params.id;
      const { updatedLike } = req.body; // Destructure the correct field from the body

      const filter = { _id: new ObjectId(id) };
      const likeUpdate = {
        $set: {
          like: updatedLike, // Correctly use the updated like count
        },
      };

      try {
        const result = await ratingsCollection.updateOne(filter, likeUpdate);
        res.send(result);
      } catch (error) {
        console.error("Error updating like:", error);
        res.status(500).send({ error: "Failed to update like" });
      }
    });

    // =========================== brands ==============================

    // post method for posts
    app.post("/brands", async (req, res) => {
      const brands = req.body;
      brands.time = new Date();
      const result = await brandsCollection.insertOne(brands);
      res.send(result);
    });

    // get method for posts
    app.get("/brands", async (req, res) => {
      const result = await brandsCollection.find().toArray();
      res.send(result);
    });

    app.get("/brands/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await brandsCollection.findOne(query);
      res.send(result);
    });

    // =========================== carts ==============================

    // post method for posts
    app.post("/carts", async (req, res) => {
      const carts = req.body;
      carts.time = new Date();
      const result = await cartsCollection.insertOne(carts);
      res.send(result);
    });

    // get method for posts
    app.get("/carts", async (req, res) => {
      const result = await cartsCollection.find().toArray();
      res.send(result);
    });

    app.get("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await cartsCollection.findOne(query);
      res.send(result);
    });

    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartsCollection.deleteOne(query);
      res.send(result);
    });

    // =========================== Order PARCEL ===================================

    //order collection updated
    app.get("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await orderCollection.findOne(query);
      res.send(result);
    });

    // Order collection
    app.get("/order", async (req, res) => {
      const user = req.query.email;
      const query = {};
      if (user) {
        query.email = user;
      }

      const result = await orderCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/order", async (req, res) => {
      const order = req.body;
      order.time = new Date();
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    // Order update
    app.put("/order/:id", async (req, res) => {
      const id = req.params.id;
      const paymentStatus = req.body;
      const filter = { _id: new ObjectId(id) };
      const payment = {
        $set: {
          payment: paymentStatus?.payment,
        },
      };

      const result = await orderCollection.updateOne(filter, payment);
      res.send(result);
    });

    app.patch("/order/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body;

      const filter = {
        _id: new ObjectId(id),
      };

      const statusUpdate = {
        $set: {
          status: status?.status,
        },
      };

      const result = await orderCollection.updateOne(filter, statusUpdate);
      res.send(result);
    });

    // Delete order
    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });

    // ========================== job ==============================

    app.post("/job", async (req, res) => {
      const job = req.body;
      job.time = new Date();
      const result = await jobCollection.insertOne(job);
      res.send(result);
    });

    app.get("/job", async (req, res) => {
      const result = await jobCollection.find().toArray();
      res.send(result);
    });

    app.get("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await jobCollection.findOne(query);
      res.send(result);
    });

    app.patch("/job/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "delivery boy",
        },
      };
      const result = await jobCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.delete("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.deleteOne(query);
      res.send(result);
    });

    // =========================== Return Product ==============================

    // post method for posts
    app.post("/return", async (req, res) => {
      const product = req.body;
      product.time = new Date();
      const result = await returnCollection.insertOne(product);
      res.send(result);
    });

    // get method for posts
    app.get("/return", async (req, res) => {
      const result = await returnCollection.find().toArray();
      res.send(result);
    });

    app.get("/return/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await returnCollection.findOne(query);
      res.send(result);
    });

    app.patch("/return/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body;

      const filter = {
        _id: new ObjectId(id)
      };

      const statusUpdate = {
        $set: {
          status: status?.status,
        },
      };

      const result = await returnCollection.updateOne(filter, statusUpdate)
      res.send(result)
    });

    app.delete("/return/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await returnCollection.deleteOne(query);
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

    // Delete payment
    app.delete("/payment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await paymentCollection.deleteOne(query);
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
