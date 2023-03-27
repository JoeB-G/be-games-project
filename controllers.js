const { fetchCategories, fetchReview } = require("./models");

exports.getCategories = (req, res) => {
  fetchCategories().then((response) => {
    res.status(200).send({ categories: response });
  });
};

exports.getReview = (req, res, next) => {
  const { review_id } = req.params;
  fetchReview(review_id)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch((err) => {
      next(err);
    });
};
