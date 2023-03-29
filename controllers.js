const { response } = require("./app");
const {
  fetchCategories,
  fetchReview,
  fetchReviews,
  fetchComments,
  checkExists,
  addComment,
  updateReview,
  removeComment,
  fetchUsers,
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

exports.getReviews = (req, res, next) => {
  const { sort_by, order, category } = req.query;

  const getPromises = [fetchReviews(sort_by, order, category)];

  if (category) {
    getPromises.push(checkExists("categories", "slug", category));
  }
  
  Promise.all(getPromises)
    .then((response) => {
      res.status(200).send({ reviews: response[0] });
    })
    .catch((err) => {
      next(err);
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

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  removeComment(comment_id)
    .then((response) => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};

exports.getUsers = (req, res) => {
  fetchUsers().then((users) => {
    res.status(200).send({ users });
  });
};
