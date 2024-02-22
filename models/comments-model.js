const db = require("../db/connection.js");

exports.deleteCommentByCommentId = (comment_id) => {

    return db
    .query(`DELETE FROM comments WHERE comment_id=$1 RETURNING *;`, [comment_id])
    .then(({ rowCount }) => {
        if(!rowCount) {
            return Promise.reject({ status: 404, msg: 'Resource not found.'});
        }
    })
}