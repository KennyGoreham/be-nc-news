const db = require("../db/connection.js");

exports.selectArticleByArticleId = (articleId) => {

    let queryStr = `SELECT articles.author, articles.title, articles.article_id, articles.body, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments) AS comment_count 
    FROM articles 
    LEFT JOIN comments ON articles.article_id = comments.article_id 
    WHERE articles.article_id=$1 GROUP BY articles.article_id;`;

    return db
    .query(queryStr, [articleId])
    .then(({ rows, rowCount }) => {
        if(rowCount === 0){
            return Promise.reject({ status: 404, msg: "Resource not found." });
        }
        return rows[0];
    })
}

exports.selectArticles = (query) => {

    let queryStr = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments) AS comment_count 
    FROM articles 
    LEFT JOIN comments ON articles.article_id = comments.article_id`; 

    const queryValues = [];

    if(query) {
        queryStr += ` WHERE topic=$1`;
        queryValues.push(query);
    }

    queryStr += ` GROUP BY articles.article_id ORDER BY articles.created_at DESC`;

    return db
    .query(queryStr, queryValues)
    .then(({ rows }) => {
        rows.forEach((row) => {
            row.comment_count = Number(row.comment_count);
        })
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