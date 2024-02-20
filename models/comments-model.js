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