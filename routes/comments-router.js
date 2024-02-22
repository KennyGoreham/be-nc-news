const commentsRouter = require('express').Router();
const { removeCommentByCommentId, patchCommentByCommentId } = require('../controllers/comments-controller.js');

commentsRouter.delete('/:comment_id', removeCommentByCommentId);

commentsRouter.patch('/:comment_id', patchCommentByCommentId);

module.exports = commentsRouter;