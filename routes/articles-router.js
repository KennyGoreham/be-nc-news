const articlesRouter = require('express').Router();
const { getArticleByArticleId, getArticles, patchArticlesByArticleId, getCommentsByArticleId, postCommentByArticleId, postArticle } = require('../controllers/articles-controller.js');

articlesRouter.get('/', getArticles);
articlesRouter.post('/', postArticle);

articlesRouter.get('/:article_id', getArticleByArticleId);
articlesRouter.patch('/:article_id', patchArticlesByArticleId);

articlesRouter.get('/:article_id/comments', getCommentsByArticleId);
articlesRouter.post('/:article_id/comments', postCommentByArticleId);


module.exports = articlesRouter;