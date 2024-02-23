const db = require("../db/connection.js");

exports.deleteCommentByCommentId = (commentId) => {

    return db
    .query(`DELETE FROM comments WHERE comment_id=$1 RETURNING *;`, [commentId])
    .then(({ rowCount }) => {

        if(!rowCount) {
            return Promise.reject({ status: 404, msg: 'Resource not found.'});
        }
    });
}

exports.updateCommentByCommentId = (commentId, votes) => {

    return db
    .query(`UPDATE comments SET votes=votes + $1 WHERE comment_id=$2 RETURNING *;`, [votes, commentId])
    .then(({ rows, rowCount }) => {

        return rowCount === 0
        ? Promise.reject({ status: 404, msg: "Resource not found."})
        : rows[0];
    });
}