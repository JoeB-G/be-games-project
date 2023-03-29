const express = require("express");
const {
  getCategories,
  getReview,
  getReviews,
  getComments,
  postComment,
  patchReview,
  deleteComment,
  getUsers
} = require("./controllers");
const {
  handleCustomErrors,
  handleRouteErrors,
  handlePsqlErrors,
} = require("./errorMiddleware");
const app = express();

app.use(express.json());

app.get(`/api/categories`, getCategories);

app.get(`/api/reviews/:review_id`, getReview);

app.get("/api/reviews", getReviews);

app.get("/api/reviews/:review_id/comments", getComments);

app.post("/api/reviews/:review_id/comments", postComment);

app.patch("/api/reviews/:review_id", patchReview);

app.delete("/api/comments/:comment_id", deleteComment)

app.get("/api/users", getUsers)

app.use(handlePsqlErrors);

app.use(handleCustomErrors);

app.use(`/*`, handleRouteErrors);

module.exports = app;
