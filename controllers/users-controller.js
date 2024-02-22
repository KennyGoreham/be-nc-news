const { selectUsers, selectUsersByUsername } = require('../models/users-model.js');

exports.getUsers = (req, res, next) => {

    selectUsers()
    .then((users) => {
        res.status(200).send({ users });
    })
    .catch((err) => {
        next(err);
    })
}

exports.getUsersByUsername = (req, res, next) => {

    const { username } = req.params;

    selectUsersByUsername(username)
    .then((user) => {
        res.status(200).send({ user });
    })
    .catch((err) => {
        next(err);
    })
}