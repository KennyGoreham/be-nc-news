const articlesRouter = require('express').Router();
const { getArticleByArticleId, getArticles, patchArticlesByArticleId, getCommentsByArticleId, postCommentByArticleId } = require('../controllers/articles-controller.js');

articlesRouter.get('/', getArticles);
articlesRouter.get('/:article_id', getArticleByArticleId);
articlesRouter.get('/:article_id/comments', getCommentsByArticleId);

articlesRouter.post('/:article_id/comments', postCommentByArticleId);

articlesRouter.patch('/:article_id', patchArticlesByArticleId);

module.exports = articlesRouter;