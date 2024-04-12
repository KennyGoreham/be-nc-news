exports.handleNonExistentEndpoints = (req, res, next) => {
  res.status(404).send({msg: "Path not found."});
};

exports.handlePSQLErrors = (err, req, res, next) => {

  switch(err.code) {
  case "22P02":
  case "23502":
  case "23505":
    res.status(400).send({msg: "Bad request."});
    break;
  case "23503":
    res.status(404).send({msg: "Resource not found."});
    break;
  default:
    next(err);
  }
};

exports.handleCustomErrors = (err, req, res, next) => {

  if(err.status && err.msg) {
    res.status(err.status).send({msg: err.msg});
  } else {
    next(err);
  }
};

exports.handleServerErrors = (err, req, res, next) => {
  res.status(500).send("Internal server error.");
};
