exports.handlePsqlErrors = (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ message: "invalid input type" });
  } else if (err.code === "23502") {
    res.status(400).send({ message: "object missing required keys" });
  } else if (err.code === "23503") {
    res.status(400).send({ message: "object contains invalid values" });
  } else next(err);
};

exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status === 404 || err.status === 400) {
    res.status(err.status).send({ message: err.message });
  } else next(err);
};

exports.handleRouteErrors = (req, res) => {
  res.status(404).send({ message: "not found" });
};
