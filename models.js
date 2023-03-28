const db = require("./db/connection");
const format = require("pg-format");

exports.fetchCategories = () => {
  return db.query(`SELECT * FROM categories;`).then((result) => {
    return result.rows;
  });
};

exports.fetchReview = (reviewID, next) => {
  const queryString = `
	SELECT * FROM reviews WHERE reviews.review_id = $1;
	`;
  return db.query(queryString, [reviewID]).then((response) => {
    if (response.rows.length === 0) {
      return Promise.reject({ status: 404, message: "review ID not found" });
    }
    return response.rows;
  });
};

exports.fetchReviews = () => {
  return db
    .query(
      `
    SELECT reviews.review_id, title, designer, owner, review_img_url, category, reviews.created_at, reviews.votes, COUNT(comments.review_id) AS comment_count
FROM reviews
LEFT JOIN comments ON reviews.review_id = comments.review_id
GROUP BY reviews.review_id
ORDER BY reviews.created_at DESC;
    `
    )
    .then((response) => {
      return response.rows;
    });
};

exports.fetchComments = (reviewID) => {
  const queryString = `
    SELECT * FROM comments WHERE comments.review_id = $1
    ORDER BY comments.created_at DESC;
    `;
  return db.query(queryString, [reviewID]).then((response) => {
    return response.rows;
  });
};

exports.checkExists = (table, column, value) => {
  const queryString = format(`SELECT * FROM %I WHERE %I = $1;`, table, column);
  return db.query(queryString, [value]).then((response) => {
    if (response.rows.length === 0) {
      return Promise.reject({ status: 404, message: "review ID not found" });
    }
  });
};

exports.addComment = (username, comment, reviewID) => {
  const queryString = `
    INSERT INTO comments
    (author, body, review_id)
    VALUES
    ($1, $2, $3)
    RETURNING *;
    `;
  return db
    .query(queryString, [username, comment, +reviewID])
    .then((response) => {
      return response.rows[0];
    });
};

exports.updateReview = (incVotes, reviewID) => {
  const queryString = `
    UPDATE reviews
    SET votes = votes + $1
    WHERE review_id = $2
    RETURNING *;
    `;
  return db.query(queryString, [incVotes, reviewID]).then((response) => {
    return response.rows[0];
  });
};
