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

exports.selectArticles = (sortBy = 'created_at') => {

    if(!['created_at', 'topic'].includes(sortBy)) {
        return Promise.reject({ status: 400, msg: "Bad request."});
    }

    let queryStr = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments) AS comment_count 
    FROM articles 
    LEFT JOIN comments ON articles.article_id = comments.article_id 
    GROUP BY articles.article_id`;

    queryStr += ` ORDER BY ${sortBy} DESC`;

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