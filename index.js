var express = require("express");
var cors = require("cors");
require("dotenv").config();
var app = express();
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const { MongoClient, ObjectId } = require("mongodb");

const port = process.env.PORT || 8000;

const dbURL = `mongodb+srv://ayan:${process.env.DB_PASSWORD}@cluster0.tcz9h.mongodb.net/SagarWash?retryWrites=true&w=majority`;

app.use(express.json());
app.use(cors());

const client = new MongoClient(dbURL);

async function run() {
  try {
    await client
      .connect()
      .then(() => console.log("database connected"))
      .catch((err) => console.log(err));

    const database = client.db("SagarWash");
    const Services = database.collection("service");
    const Orders = database.collection("orders");
    const Users = database.collection("users");

    // All the API endpoints

    app.post("/create-payment-intent", async (req, res) => {
      try {
        const { price } = req.body;
        const amount = price * 100;
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: "usd",
          payment_method_types: ["card"],
        });

        res.status(200).json({
          status: "success",
          clientSecret: paymentIntent.client_secret,
        });
      } catch (err) {
        console.log(err);
        res.status(500).json({
          status: "fail",
          error: err.message,
        });
      }
    });

    // create services
    // app.post("/api/v1/services", async (req, res) => {
    //   try {
    //     const services = await Services.insertMany(serviceData);

    //     console.log(services);
    //     res.status(201).json({
    //       status: "success",
    //       services,
    //     });
    //   } catch (err) {
    //     res.status(500).json({
    //       status: "fail",
    //       error: err.message,
    //     });
    //   }
    // });

    // get all services

    app.get("/api/v1/services", async (req, res) => {
      try {
        const services = await Services.find({}).toArray();
        res.status(201).json({
          status: "success",
          services,
        });
      } catch (err) {
        res.status(500).json({
          status: "fail",
          error: err.message,
        });
      }
    });

    // get a service
    app.get("/api/v1/services/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const newID = ObjectId(id);
        const service = await Services.findOne({ _id: newID });
        res.status(200).json({
          status: "success",
          service,
        });
      } catch (err) {
        res.status(500).json({
          status: "fail",
          error: err.message,
        });
      }
    });

    // some
    // create user
    app.patch("/api/v1/users", async (req, res) => {
      try {
        const user = req.body;
        const createdUser = await Users.updateOne(
          { uid: user.uid },
          { $set: user },
          {
            upsert: true,
          }
        );
        console.log(createdUser);
        res.status(200).json({
          status: "success",
          createdUser,
        });
      } catch (err) {
        console.log(err);
        res.status(500).json({
          status: "fail",
          error: err.message,
        });
      }
    });

    // get admin
    app.get("/api/v1/admin/:userUid", async (req, res) => {
      try {
        const { userUid } = req.params;
        const adminUser = await Users.findOne({ uid: userUid });
        console.log(adminUser);
        res.status(200).json({
          status: "success",
          isAdmin: adminUser,
        });
      } catch (err) {
        res.status(500).json({
          status: "fail",
          error: err.message,
        });
      }
    });

    app.get("/", (req, res) => {
      res.send("Hello wrold");
    });

    // create order
    app.post("/api/v1/orders", async (req, res) => {
      try {
        const order = await Orders.insertOne(req.body);
        res.status(201).json({
          status: "success",
        });
      } catch (err) {
        res.status(500).json({
          status: "fail",
          error: err.message,
        });
      }
    });

    // get All orders
    app.get("/api/v1/orders", async (req, res) => {
      try {
        const orders = await Orders.find({}).toArray();
        res.status(200).json({
          status: "success",
          orders,
        });
      } catch (err) {
        res.status(500).json({
          status: "fail",
          error: err.message,
        });
      }
    });

    // get orders by user
    app.get("/api/v1/orders/:userID", async (req, res) => {
      try {
        const { userID } = req.params;
        const orders = await Orders.find({ userUid: userID }).toArray();
        res.status(200).json({
          status: "success",
          orders,
        });
      } catch (err) {
        res.status(500).json({
          status: "fail",
          error: err.message,
        });
      }
    });

    // get single order

    app.get("/api/v1/order/:orderId", async (req, res) => {
      try {
        const { orderId } = req.params;
        const id = ObjectId(orderId);
        const order = await Orders.findOne({ _id: id });

        res.status(200).json({
          status: "success",
          order,
        });
      } catch (err) {
        res.status(500).json({
          status: "fail",
          error: err.message,
        });
      }
    });

    // delete an order
    app.delete("/api/v1/order/:orderId", async (req, res) => {
      try {
        const { orderId } = req.params;
        const id = ObjectId(orderId);
        const order = await Orders.deleteOne({ _id: id });

        console.log(order, "delted");
        res.status(204).json({
          status: "success",
        });
      } catch (err) {
        res.status(500).json({
          status: "fail",
          error: err.message,
        });
      }
    });

    // get orders by user and id
    app.get("/api/v1/order/:orderId", async (req, res) => {
      try {
        const { orderId } = req.params;
        const id = ObjectId(orderId);
        const order = await Orders.findOne({ _id: id });
        res.status(200).json({
          status: "success",
          order,
        });
      } catch (err) {
        res.status(500).json({
          status: "fail",
          error: err.message,
        });
      }
    });

    // update order
    app.put("/api/v1/update-order/:orderId", async (req, res) => {
      try {
        const { orderId } = req.params;
        const id = ObjectId(orderId);
        console.log(id);
        const update = await Orders.updateOne(
          { _id: id },
          { $set: { isPaid: true } }
        );
        console.log(update);
        res.status(200).json({
          status: "success",
        });
      } catch (err) {
        console.log(err);
        res.status(500).json({
          status: "fail",
          error: err.message,
        });
      }
    });
  } finally {
    // await client.close();
  }
}

// calling mongodb function
run().catch(console.dir());

app.listen(port, () => {
  console.log("Your server listening on PORT", port);
});
