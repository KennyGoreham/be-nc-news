const { selectApiDocs } = require('../models/api-model.js');

exports.getApi = (req, res, next) => {
    selectApiDocs()
    .then((apiDocs) => {
        res.status(200).send({ apiDocs });
    })
}