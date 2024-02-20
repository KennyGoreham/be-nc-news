const { selectArticleById, selectArticles, updateArticlesById } = require('../models/articles-model.js');

exports.getArticleById = (req, res, next) => {
    const { article_id } = req.params;
    selectArticleById(article_id)
    .then((article) => {
        res.status(200).send({ article });
    })
    .catch((err) => {
        next(err);
    })
}

exports.getArticles = (req, res, next) => {
    const { sort_by, order } = req.query;
    selectArticles(sort_by, order)
    .then((articles) => {
        res.status(200).send({ articles });
    })
    .catch((err) => {
        next(err);
    })
}

exports.patchArticlesById = (req, res, next) => {
    const { params: { article_id }, body: { inc_votes } } = req;
    updateArticlesById(inc_votes, article_id)
    .then((article) => {
        res.status(200).send({ article });
    })
    .catch((err) => {
        next(err);
    })
}