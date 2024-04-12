const {selectApiDocs} = require("../models/api-model.js");

exports.getApi = (req, res) => {

  selectApiDocs()
    .then((endpoints) => {
      res.status(200).send({endpoints});
    });
};
