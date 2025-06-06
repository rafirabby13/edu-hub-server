const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { default: axios } = require("axios");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded())



// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bbiovs6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7ufsi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// console.log(uri)

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
    const paymentCollection = client.db("eduHub").collection("paymentCollection");

   app.post("/create-ss-payment", async (req, res) => {
     const trxid = new ObjectId().toString()
     const pass = "rafi12345??"
   
     const payment = req.body;
     payment.transactionId = trxid
     const initiate = {
       store_id: `${process.env.store_id}`,
       store_passwd: `${process.env.store_passwd}`,
       total_amount: payment.price,
       currency: 'BDT',
       tran_id: trxid, // use unique tran_id for each api call
       success_url: 'http://localhost:5000/success-payment',
       fail_url: 'http://localhost:5173/fail',
       cancel_url: 'http://localhost:5173/cancel',
       ipn_url: 'http://localhost:5000/ipn-success-payment',
       shipping_method: 'Courier',
       product_name: 'Computer.',
       product_category: 'Electronic',
       product_profile: 'general',
       cus_name: 'Customer Name',
       cus_email: `${payment.email}`,
       cus_add1: 'Dhaka',
       cus_add2: 'Dhaka',
       cus_city: 'Dhaka',
       cus_state: 'Dhaka',
       cus_postcode: '1000',
       cus_country: 'Bangladesh',
       cus_phone: '01711111111',
       cus_fax: '01711111111',
       ship_name: 'Customer Name',
       ship_add1: 'Dhaka',
       ship_add2: 'Dhaka',
       ship_city: 'Dhaka',
       ship_state: 'Dhaka',
       ship_postcode: 1000,
       ship_country: 'Bangladesh',
     }
   
     const iniResponse = await axios({
       url: "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
       method: "POST",
       data: initiate,
       headers: {
         "Content-Type": "application/x-www-form-urlencoded"
       }
     })

     const saveData = await paymentCollection.insertOne(payment)


     
     const getwayURL = iniResponse?.data?. GatewayPageURL
     res.send({getwayURL})
     console.log(getwayURL)
   })


   app.post("/success-payment", async (req, res)=>{

    const paymentSuccess = req.body;
    // console.log("paymentSuccess", paymentSuccess)

    const {data} = await axios.get(`https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${paymentSuccess.val_id}&store_id=${process.env.store_id}&store_passwd=${process.env.store_passwd}&formate=json`)

    if(data.status !== "VALID") {
      return res.send({message: "Invalid Payment"})
    }

    //update the payment

    const updatePayment = await paymentCollection.updateOne({transactionId: data.tran_id},
      {
        $set: {
          status: "success",
        },
      }
    )

    res.redirect('https://edu-hub-c2c83.web.app/upload');

    const payment = await paymentCollection.findOne({transactionId: data.tran_id})

    console.log("payment info", payment)

    const query = {
      _id: {
        $in: payment.cartIds.map((id)=> new ObjectId(id))
      }
    }


    // const deleteResult = await 

    console.log(updatePayment)
   })

app.get("/user/:email", async (req, res)=>{
  const email = req.params
  console.log(email)

  const response = await paymentCollection.findOne(email)
  res.send(response)
})

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
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
