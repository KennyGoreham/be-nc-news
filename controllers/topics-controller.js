const {selectTopics,insertTopic} = require("../models/topics-model.js");

exports.getTopics = (req, res, next) => {

  selectTopics()
    .then((topics) => {
      res.status(200).send({topics});
    })
    .catch((err) => {
      next(err);
    });
};

exports.postTopics = (req, res, next) => {

  const {slug, description} = req.body;

  insertTopic(slug, description)
    .then((topic) => {
      res.status(201).send({topic});
    })
    .catch((err) => {
      next(err);
    });
};
