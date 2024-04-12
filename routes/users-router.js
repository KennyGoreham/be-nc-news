const usersRouter = require("express").Router();
const {getUsers, getUsersByUsername, getCommentsByUsername} = require("../controllers/users-controller.js");

usersRouter.get("/", getUsers);
usersRouter.get("/:username", getUsersByUsername);
usersRouter.get("/:username/comments", getCommentsByUsername);

module.exports = usersRouter;
