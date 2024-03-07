const { selectApiDocs } = require('../models/api-model.js');

exports.getApi = (req, res, next) => {

    selectApiDocs()
    .then((endpoints) => {
        res.status(200).send({ endpoints });
    });
}