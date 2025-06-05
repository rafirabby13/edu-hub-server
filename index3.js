const express = require('express')
const app = express()
const cors = require('cors')
const { default: axios } = require('axios')
require('dotenv').config()
const port = 3000

app.use(cors())
app.use(express.json())

// Merchant Panel URL: https://sandbox.sslcommerz.com/manage/ (Credential as you inputted in the time of registration)



// Store name: testrafiam4mp
// Registered URL: www.payment-gateway.com
// Session API to generate transaction: https://sandbox.sslcommerz.com/gwprocess/v3/api.php
// Validation API: https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?wsdl
// Validation API (Web Service) name: https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php

// You may check our plugins available for multiple carts and libraries: https://github.com/sslcommerz



// step-1: payment initiate


app.post("/create-ss-payment", async (req, res) => {
  // const trxid = new Object
  const pass = "rafi12345??"

  const payment = req.body;
  const initiate = {
    store_id: 'rafia67cdbfb68bb67',
    store_passwd: "rafia67cdbfb68bb67@ssl",
    total_amount: payment.price,
    currency: 'BDT',
    tran_id: 'REF123', // use unique tran_id for each api call
    success_url: 'http://localhost:3000/success-payment',
    fail_url: 'http://localhost:5173/fail',
    cancel_url: 'http://localhost:5173/cancel',
    ipn_url: 'http://localhost:3030/ipn-success-payment',
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

  const getwayURL = iniResponse?.data?. GatewayPageURL
  console.log(getwayURL)
})


app.post("/generate", async (req, res) => {
  const userPrompt = req.body.prompt;

  if (!userPrompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "user", content: userPrompt }
        ]
      }),
    });

    const data = await response.json();
    res.send(data);
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
