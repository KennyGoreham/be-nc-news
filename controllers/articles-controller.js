const { selectArticleByArticleId, selectArticles, updateArticlesByArticleId } = require('../models/articles-model.js');

exports.getArticleByArticleId = (req, res, next) => {

    const { article_id } = req.params;
    
    selectArticleByArticleId(article_id)
    .then((article) => {
        res.status(200).send({ article });
    })
    .catch((err) => {
        next(err);
    })
}

exports.getArticles = (req, res, next) => {

    const { sort_by } = req.query;

    selectArticles(sort_by)
    .then((articles) => {
        res.status(200).send({ articles });
    })
    .catch((err) => {
        next(err);
    })
}

exports.patchArticlesByArticleId = (req, res, next) => {

    const { params: { article_id }, body: { inc_votes } } = req;
    const promises = [updateArticlesByArticleId(inc_votes, article_id), selectArticleByArticleId(article_id)];

    return Promise.all(promises)
    .then((promiseResolutions) => {
        res.status(200).send({ article: promiseResolutions[0] });
    })
    .catch((err) => {
        next(err);
    })
}