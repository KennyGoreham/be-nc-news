const { selectCommentsByArticleId, insertCommentByArticleId, deleteCommentByCommentId } = require('../models/comments-model.js');
const { selectArticleByArticleId } = require('../models/articles-model.js');

exports.getCommentsByArticleId = (req, res, next) => {

    const { article_id } = req.params;

    const promises = [selectCommentsByArticleId(article_id), selectArticleByArticleId(article_id)];
    
    return Promise.all(promises)
    .then((promiseResolutions) => {
        if(promiseResolutions[0].length === 0) {
            res.status(200).send({ comments: [] });
        } else {
            res.status(200).send({ comments: promiseResolutions[0] });
        }
    })
    .catch((err) => {
        next(err);
    })
}

exports.postCommentByArticleId = (req, res, next) => {

    const { body, params: { article_id } } = req;

    insertCommentByArticleId(body, article_id)
    .then((comment) => {
        res.status(201).send({ comment });
    })
    .catch((err) => {
        next(err);
    })
}

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