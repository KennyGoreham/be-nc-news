const commentsRouter = require("express").Router();
const {removeCommentByCommentId, patchCommentByCommentId} = require("../controllers/comments-controller.js");

commentsRouter.patch("/:comment_id", patchCommentByCommentId);
commentsRouter.delete("/:comment_id", removeCommentByCommentId);

module.exports = commentsRouter;
