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
  fetchUser,
  updateComment,
  addReview,
  addCategory
} = require("./models");
const fs = require("fs/promises");

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
  const { sort_by, order, category, limit, page } = req.query;

  const getPromises = [fetchReviews(sort_by, order, category, limit, page)];

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
  const { limit, page } = req.query;
  const { review_id } = req.params;

  const getPromises = [
    fetchComments(review_id, limit, page),
    checkExists("reviews", "review_id", review_id),
  ];

  Promise.all(getPromises)
    .then((responses) => {
      res.status(200).send({ comments: responses[0] });
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

exports.getApi = (req, res) => {
  fs.readFile(`${__dirname}/endpoints.json`, `utf-8`).then((data) => {
    const endpoints = JSON.parse(data);
    res.status(200).send({ endpoints });
  });
};

exports.getUser = (req, res, next) => {
  const { username } = req.params;
  fetchUser(username)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchComment = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;

  updateComment(comment_id, inc_votes)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postReview = (req, res, next) => {
  const { owner, title, review_body, designer, category, review_img_url } =
    req.body;

  const inputArray = [
    owner,
    title,
    review_body,
    designer,
    category,
    review_img_url,
  ];

  addReview(inputArray)
    .then((review) => {
      res.status(201).send({ review });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postCategory = (req, res, next) => {
  const { slug, description } = req.body;
  addCategory(slug, description).then((category) => {
    res.status(201).send({ category });
  })
  .catch((err) => {
    console.log(err)
    next(err)
  })
};
