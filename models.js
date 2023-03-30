const db = require("./db/connection");
const format = require("pg-format");

exports.fetchCategories = () => {
  return db.query(`SELECT * FROM categories;`).then((result) => {
    return result.rows;
  });
};

exports.fetchReview = (reviewID) => {
  const queryString = `
	SELECT reviews.* , COUNT(comments.review_id) AS comment_count 
    FROM 
    reviews
    JOIN comments ON reviews.review_id = comments.review_id 
    WHERE 
    reviews.review_id = $1
    GROUP BY reviews.review_id;
	`;
  return db.query(queryString, [reviewID]).then((response) => {
    if (response.rows.length === 0) {
      return Promise.reject({ status: 404, message: "review_id not found" });
    }
    return response.rows;
  });
};

exports.fetchReviews = (sort_by = "created_at", order = "DESC", category) => {
  let queryString = `
    SELECT reviews.review_id, title, designer, owner, review_img_url, category, reviews.created_at, reviews.votes, COUNT(comments.review_id) AS comment_count
    FROM reviews
    LEFT JOIN comments ON reviews.review_id = comments.review_id
    `;

  const queryValues = [];

  if (category) {
    queryValues.push(category);
    queryString += `WHERE category = $1 `;
  }

  if (!["ASC", "DESC"].includes(order)) {
    return Promise.reject({ status: 400, message: "invalid sort order" });
  }

  if (
    ![
      "review_id",
      "owner",
      "title",
      "category",
      "review_img_url",
      "created_at",
      "votes",
      "designer",
      "comment_count",
    ].includes(sort_by)
  ) {
    return Promise.reject({ status: 400, message: "invalid sort query" });
  }

  queryString += `GROUP BY reviews.review_id
    ORDER BY ${sort_by} ${order};`;

  return db.query(queryString, queryValues).then((response) => {
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
      return Promise.reject({
        status: 404,
        message: `${table} ${column} not found`,
      });
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

exports.removeComment = (commentID) => {
  const queryString = `
    DELETE FROM comments
    WHERE comment_id = $1
    RETURNING *;
`;
  return db.query(queryString, [commentID]).then((response) => {
    if (response.rows.length === 0) {
      return Promise.reject({ status: 404, message: "comment_id not found" });
    }
    return response;
  });
};

exports.fetchUsers = () => {
  const queryString = `
    SELECT * FROM users;
    `;
  return db.query(queryString).then((response) => {
    return response.rows;
  });
};

exports.fetchUser = (username) => {
  return db.query(`
  SELECT * FROM users WHERE username = $1;
  `, [username]).then((response) => {
    if (response.rows.length === 0) {
      return Promise.reject({ status: 404, message: "username not found" })
    }
    return response.rows[0]
  });
};
