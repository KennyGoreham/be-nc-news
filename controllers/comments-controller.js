const { deleteCommentByCommentId } = require('../models/comments-model.js');

exports.removeCommentByCommentId = (req, res, next) => {

    const { params: { comment_id } } = req;
    
    deleteCommentByCommentId(comment_id)
    .then(() => {
        res.status(204).send({});
    })
    .catch((err) => {
        next(err);
    })
}