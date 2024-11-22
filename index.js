require('dotenv').config();
const express = require('express');
const routes = require("./routes")
const { connectToMongo } = require('./db');

connectToMongo();

const app = express();

app.use(express.json());

app.use('/api/v3/app/events',routes);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});