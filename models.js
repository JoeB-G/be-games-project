const db = require("./db/connection");

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
