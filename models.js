const db = require("./db/connection");

exports.fetchCategories = () => {
  return db.query(`SELECT * FROM categories;`).then((result) => {
    return result.rows;
  });
};

exports.fetchReview = (reviewID) => {
  const queryString = `
	SELECT * FROM reviews WHERE reviews.review_id = $1;
	`;
  return db.query(queryString, [reviewID]).then((response) => {
    if (!response.rows[0]){
        return Promise.reject( {status: 404, message: "review ID not found"})
    }
    return response.rows;
  });
};
