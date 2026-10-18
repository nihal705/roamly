export function notFound(req, res) {
  res
    .status(404)
    .json({ message: `No route for ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  console.error(err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Something went wrong" });
}
