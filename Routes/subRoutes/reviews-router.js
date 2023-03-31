const reviewsRouter = require("express").Router();
const {
  getReview,
  getReviews,
  getComments,
  postComment,
  patchReview,
  postReview,
} = require("../../controllers");

reviewsRouter.route("/").get(getReviews).post(postReview);

reviewsRouter.route("/:review_id").get(getReview).patch(patchReview);

reviewsRouter.route("/:review_id/comments").get(getComments).post(postComment);

module.exports = reviewsRouter;
