const topicsRouter = require('express').Router();
const { getTopics, postTopics } = require('../controllers/topics-controller.js');

topicsRouter.get('/', getTopics);
topicsRouter.post('/', postTopics);

module.exports = topicsRouter;