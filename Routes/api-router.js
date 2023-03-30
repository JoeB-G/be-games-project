const apiRouter = require("express").Router();
const {
  reviewsRouter,
  commentsRouter,
  usersRouter,
  categoriesRouter,
} = require("./subRoutes/index");
const { getApi } = require("../controllers");

apiRouter.use("/reviews", reviewsRouter);

apiRouter.use("/comments", commentsRouter);

apiRouter.use("/users", usersRouter);

apiRouter.use("/categories", categoriesRouter);

apiRouter.use("/", getApi);

module.exports = apiRouter;
