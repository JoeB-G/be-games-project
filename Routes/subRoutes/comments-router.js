const commentsRouter = require("express").Router();
const { deleteComment } = require("../../controllers");

commentsRouter.route("/:comment_id").delete(deleteComment);

module.exports = commentsRouter;
