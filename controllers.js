const { response } = require("./app");
const {
  fetchCategories,
  fetchReview,
  fetchReviews,
  fetchComments,
  checkExists,
  addComment,
  updateReview,
} = require("./models");

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

exports.getReviews = (req, res) => {
  fetchReviews().then((response) => {
    res.status(200).send({ reviews: response });
  });
};

exports.getComments = (req, res, next) => {
  const { review_id } = req.params;
  checkExists("reviews", "review_id", review_id)
    .then(() => {
      fetchComments(review_id).then((comments) => {
        res.status(200).send({ comments });
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postComment = (req, res, next) => {
  const { review_id } = req.params;
  const { username, body } = req.body;

  const postPromises = [
    checkExists("reviews", "review_id", review_id),
    addComment(username, body, review_id),
  ];

  Promise.all(postPromises)
    .then((responses) => {
      res.status(201).send({ comment: responses[1] });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchReview = (req, res, next) => {
  const { review_id } = req.params;
  const { inc_votes } = req.body;

  const patchPromises = [
    checkExists("reviews", "review_id", review_id),
    updateReview(inc_votes, review_id),
  ];

  Promise.all(patchPromises)
    .then((responses) => {
      res.status(201).send({ review: responses[1] });
    })
    .catch((err) => {
      next(err);
    });
};
