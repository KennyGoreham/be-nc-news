const db = require("../db/connection.js");
const format = require("pg-format");

exports.selectCommentsByArticleId = (article_id) => {
    
    return db
    .query(`SELECT * FROM comments WHERE article_id=$1 ORDER BY created_at DESC;`, [article_id])
    .then(({ rows }) => {
        return rows;
    })
}

exports.insertCommentByArticleId = (comment, article_id) => {

    return db
    .query(`INSERT INTO comments (body, author, article_id, votes, created_at) VALUES ($1, $2, $3, DEFAULT, DEFAULT) RETURNING *;`, [comment.body, comment.username, article_id])
    .then(({ rows }) => {
        return rows[0];
    })
}

exports.deleteCommentByCommentId = (comment_id) => {

    return db
    .query(`DELETE FROM comments WHERE comment_id=$1 RETURNING *;`, [comment_id])
    .then(({ rowCount }) => {
        if(!rowCount) {
            return Promise.reject({ status: 404, msg: 'Resource not found.'});
        }
    })
}