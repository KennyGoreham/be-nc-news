const commentsRouter = require('express').Router();
const { removeCommentByCommentId } = require('../controllers/comments-controller.js');

commentsRouter.delete('/:comment_id', removeCommentByCommentId);

module.exports = commentsRouter;