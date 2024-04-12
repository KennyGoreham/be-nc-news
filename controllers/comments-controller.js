const {deleteCommentByCommentId, updateCommentByCommentId} = require("../models/comments-model.js");

exports.removeCommentByCommentId = (req, res, next) => {

  const {params: {comment_id}} = req;

  deleteCommentByCommentId(comment_id)
    .then(() => {
      res.status(204).send({});
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchCommentByCommentId = (req, res, next) => {

  const {params: {comment_id}, body: {inc_votes}} = req;

  updateCommentByCommentId(comment_id, inc_votes)
    .then((comment) => {
      res.status(200).send({comment});
    })
    .catch((err) => {
      next(err);
    });
};
