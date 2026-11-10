const AppError = require("./AppError");

// Turns "5" into 5, throws a 400 error if it is not a valid id
module.exports = function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw new AppError("Invalid id", 400);
  return id;
};
