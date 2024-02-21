const db = require("../db/connection.js");

exports.selectArticleByArticleId = (articleId) => {

    return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [articleId])
    .then(({ rows, rowCount }) => {
        if(rowCount === 0){
            return Promise.reject({ status: 404, msg: "Resource not found." });
        }
        return rows[0];
    })
}

exports.selectArticles = (sortBy = 'created_at', order = 'desc') => {

    if(!['desc', 'asc'].includes(order)) {
        return Promise.reject({ status: 400, msg: "Bad request."});
    }

    if(!['author', 'title', 'article_id', 'topic', 'created_at', 'votes', 'article_img_url', 'comment_count'].includes(sortBy)) {
        return Promise.reject({ status: 400, msg: "Bad request."});
    }

    let queryStr = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments) AS comment_count 
    FROM articles 
    LEFT JOIN comments ON articles.article_id = comments.article_id 
    GROUP BY articles.article_id`;

    queryStr += ` ORDER BY ${sortBy} ${order}`;

    return db
    .query(queryStr)
    .then(({ rows }) => {
        return rows;
    })
}

exports.updateArticlesByArticleId = (votes, article_id) => {

    return db
    .query(`UPDATE articles SET votes=votes + $1 WHERE article_id=$2 RETURNING *`, [votes, article_id])
    .then(({ rows }) => {
        return rows[0];
    })
}