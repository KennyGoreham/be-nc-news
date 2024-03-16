const { selectUsers, selectUsersByUsername, selectCommentsByUsername } = require('../models/users-model.js');

exports.getUsers = (req, res, next) => {

    selectUsers()
    .then((users) => {
        res.status(200).send({ users });
    })
    .catch((err) => {
        next(err);
    });
}

exports.getUsersByUsername = (req, res, next) => {

    const { username } = req.params;

    selectUsersByUsername(username)
    .then((user) => {
        res.status(200).send({ user });
    })
    .catch((err) => {
        next(err);
    });
}

exports.getCommentsByUsername = (req, res, next) => {
    
    const { username } = req.params;
    const promises = [selectCommentsByUsername(username), selectUsersByUsername(username)];

    return Promise.all(promises)
    .then((promiseResolutions) => {

        promiseResolutions[0].length === 0 && promiseResolutions[1] === undefined
        ? res.status(404).send({ msg: "Resource not found." })
        : res.status(200).send({ comments: promiseResolutions[0] });
    })
    .catch((err) => {
        next(err);
    });
}