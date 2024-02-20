const { selectCommentsByArticleId, insertCommentByArticleId } = require('../models/comments-model.js');
const { selectArticleById } = require('../models/articles-model.js');

exports.getCommentsByArticleId = (req, res, next) => {

    const { article_id } = req.params;
    const { sort_by, order } = req.query;

    const promises = [selectCommentsByArticleId(sort_by, order, article_id), selectArticleById(article_id)];
    
    return Promise.all(promises)
    .then((promiseResolutions) => {

        if(promiseResolutions[0].length === 0) {
            res.status(204).send( {} );
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