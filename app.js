const express = require('express');
const app = express();
const { handlePSQLErrors, handleCustomErrors, handleServerErrors, handleNonExistentEndpoints } = require('./controllers/errors-controller.js');
const { getTopics } = require('./controllers/topics-controller.js');
const { getApi } = require('./controllers/api-controller.js');
const { getArticleByArticleId, getArticles, patchArticlesByArticleId } = require('./controllers/articles-controller.js');
const { getCommentsByArticleId, postCommentByArticleId, removeCommentByCommentId } = require('./controllers/comments-controller.js');

app.use(express.json());

app.get('/api', getApi);

app.get('/api/topics', getTopics);

app.get('/api/articles', getArticles);

app.get('/api/articles/:article_id', getArticleByArticleId);
app.patch('/api/articles/:article_id', patchArticlesByArticleId);

app.get('/api/articles/:article_id/comments', getCommentsByArticleId);
app.post('/api/articles/:article_id/comments', postCommentByArticleId);

app.delete('/api/comments/:comment_id', removeCommentByCommentId);

app.all('/*', handleNonExistentEndpoints);

app.use(handlePSQLErrors);

app.use(handleCustomErrors);

app.use(handleServerErrors);

module.exports = app;