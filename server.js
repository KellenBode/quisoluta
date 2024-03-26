const express = require('express');
require('dotenv').config()
const app = express();
const port = 3000;
const {web3api, configureWeb3} = require("./middleware");

configureWeb3(process.env.SIGN_PRIVATEKEY,"http://localhost:5001")

app.get('/',web3api({isPrivate: true}),(req, res) => {
  res.status(200).send(`Hello from ${req.hostname}`);
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});