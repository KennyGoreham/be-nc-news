const db = require("../db/connection.js");
const format = require("pg-format");

exports.selectCommentsByArticleId = (sortBy = 'created_at', order = 'desc', article_id) => {
    
    if(!['comment_id', 'votes', 'created_at', 'author', 'body', 'article_id'].includes(sortBy)) {
        return Promise.reject({ status: 400, msg: "Bad request."});
    }

    if(!['asc', 'desc'].includes(order)) {
        return Promise.reject({ status:400, msg: "Bad request." });
    }

    return db
    .query(`SELECT * FROM comments WHERE article_id = $1 ORDER BY ${sortBy} ${order};`, [article_id])
    .then(({ rows, rowCount }) => {
        if(rowCount === 0) {
            return Promise.reject({ status: 404, msg: "Resource not found."});
        }
        return rows;
    })
}