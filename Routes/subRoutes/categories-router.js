const categoriesRouter = require("express").Router();
const { getCategories, postCategory } = require("../../controllers");

categoriesRouter.route("/").get(getCategories).post(postCategory);

module.exports = categoriesRouter;
