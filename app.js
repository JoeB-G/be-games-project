const express = require("express");
const {
  handleCustomErrors,
  handleRouteErrors,
  handlePsqlErrors,
} = require("./errorMiddleware");
const app = express();
const apiRouter = require("./Routes/api-router");
const cors = require('cors');

app.use(cors());

app.use(express.json());

app.use("/api", apiRouter);

app.use(handlePsqlErrors);

app.use(handleCustomErrors);

app.use(`/*`, handleRouteErrors);

module.exports = app;
