const { selectCommentsByArticleId } = require('../models/comments-model.js');

exports.getCommentsByArticleId = (req, res, next) => {
    const { article_id } = req.params;
    const { sort_by, order } = req.query;
    selectCommentsByArticleId(sort_by, order, article_id)
    .then((comments) => {
        res.status(200).send({ comments });
    })
    .catch((err) => {
        next(err);
    })
}