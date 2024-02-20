const express = require('express');
const app = express();
const { handlePSQLErrors, handleCustomErrors, handleServerErrors } = require('./controllers/errors-controller.js');
const { getTopics } = require('./controllers/topics-controller.js');
const { getApi } = require('./controllers/api-controller.js');
const { getArticleById, getArticles } = require('./controllers/articles-controller.js');
const { getCommentsByArticleId } = require('./controllers/comments-controller.js');

app.get('/api', getApi);

app.get('/api/topics', getTopics);

app.get('/api/articles', getArticles);
app.get('/api/articles/:article_id', getArticleById);
app.get('/api/articles/:article_id/comments', getCommentsByArticleId);

app.all('/*', (req, res, next) => {
    res.status(404).send({ msg: "Path not found." });
})

app.use(handlePSQLErrors);

app.use(handleCustomErrors);

app.use(handleServerErrors);

module.exports = app;