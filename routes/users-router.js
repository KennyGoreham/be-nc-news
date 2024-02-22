const usersRouter = require('express').Router();
const { getUsers, getUsersByUsername } = require('../controllers/users-controller.js');

usersRouter.get('/', getUsers);
usersRouter.get('/:username', getUsersByUsername);

module.exports = usersRouter;