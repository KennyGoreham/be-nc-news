const express = require('express');
const app = express();
const { handleServerErrors } = require('./errors');
const { getTopics } = require('./controllers/topics-controller.js');
const { getApi } = require('./controllers/api-controller.js');

app.get('/api', getApi);

app.get('/api/topics', getTopics);

app.all('/*', (req, res, next) => {
    res.status(404).send({ msg: "Path not found." });
})

app.use(handleServerErrors);

module.exports = app;