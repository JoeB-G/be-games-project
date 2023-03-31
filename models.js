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

exports.fetchReviews = (
  sort_by = "created_at",
  order = "DESC",
  category,
  limit = 10,
  page
) => {
  let queryString = `
    SELECT reviews.category, reviews.created_at, reviews.designer, reviews.owner, reviews.review_id, reviews.review_img_url, reviews.title, reviews.votes, COUNT(comments.review_id) AS comment_count, COUNT(*) OVER() AS total_count 
    FROM 
    reviews 
    LEFT JOIN comments ON reviews.review_id=comments.review_id
    `;

  const queryValues = [limit];

  if (category) {
    queryValues.push(category);
    queryString += ` WHERE category = $2 `;
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

  queryString += ` GROUP BY reviews.review_id 
    ORDER BY ${sort_by} ${order} LIMIT $1`;

  if (page) {
    const offset = (page - 1) * limit;
    queryValues.push(offset);
    if (category) {
      queryString += `OFFSET $3`;
    } else {
      queryString += `OFFSET $2`;
    }
  }
  return db.query(queryString, queryValues).then((response) => {
    return response.rows;
  });
};

exports.fetchComments = (reviewID, limit = 10, page) => {
  const queryValues = [reviewID, limit];
  let queryString = `
    SELECT * FROM comments WHERE comments.review_id = $1
    ORDER BY comments.created_at DESC
    LIMIT $2
    `;
  if (page) {
    const offset = (page - 1) * limit;
    queryValues.push(offset);
    queryString += ` OFFSET $3`;
  }
  return db.query(queryString, queryValues).then((response) => {
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
  return db
    .query(
      `
  SELECT * FROM users WHERE username = $1;
  `,
      [username]
    )
    .then((response) => {
      if (response.rows.length === 0) {
        return Promise.reject({ status: 404, message: "username not found" });
      }
      return response.rows[0];
    });
};

exports.updateComment = (commentID, incVotes) => {
  const queryString = `
    UPDATE comments
    SET votes = votes + $2
    WHERE comment_id = $1
    RETURNING *;
    `;
  return db.query(queryString, [commentID, incVotes]).then((response) => {
    if (response.rows.length === 0) {
      return Promise.reject({ status: 404, message: "comment_id not found" });
    }
    return response.rows[0];
  });
};

exports.addReview = (reviewToAdd) => {
  const queryString = `
  INSERT INTO reviews
  (owner, title, review_body, designer, category, review_img_url)
  VALUES
  ($1, $2, $3, $4, $5, $6)
  RETURNING reviews.*, (
  SELECT COUNT(comments.review_id) AS comment_count
  FROM comments
  WHERE comments.review_id = reviews.review_id
  );
  `;
  return db.query(queryString, reviewToAdd).then((response) => {
    return response.rows[0];
  });
};

exports.addCategory = (slug, description) => {
  if (!description) {
    return Promise.reject({
      status: 400,
      message: "object missing required keys",
    });
  }
  const queryString = `
  INSERT INTO categories
  (slug, description)
  VALUES
  ($1, $2)
  RETURNING *;
  `;
  return db.query(queryString, [slug, description]).then((response) => {
    return response.rows[0];
  });
};

exports.removeReview = (reviewID) => {
  const queryString = `
  DELETE FROM reviews
  WHERE review_id = $1
  RETURNING *;
  `;
  return db.query(queryString, [reviewID]).then((response) => {
    if (response.rows.length === 0) {
      return Promise.reject({ status: 404, message: "review_id not found" });
    }
    return response;
  });
};
