const express = require('express');
const app = express();
const { handleServerErrors } = require('./errors');
const { getTopics } = require('./controllers/topics-controller.js');

app.get('/api/topics', getTopics);

app.all('/*', (req, res, next) => {
    res.status(404).send({ msg: "Path not found." });
})

app.use(handleServerErrors);

module.exports = app;