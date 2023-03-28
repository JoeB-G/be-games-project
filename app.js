const express = require("express");
const { getCategories, getReview, getReviews } = require("./controllers");
const {
  handleCustomErrors,
  handleRouteErrors,
  handlePsqlErrors,
} = require("./errorMiddleware");
const app = express();

app.get(`/api/categories`, getCategories);

app.get(`/api/reviews/:review_id`, getReview);

app.get("/api/reviews", getReviews);

app.use(handlePsqlErrors);

app.use(handleCustomErrors);

app.use(`/*`, handleRouteErrors);

module.exports = app;
