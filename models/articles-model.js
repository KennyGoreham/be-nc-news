const db = require("../db/connection.js");

exports.selectArticleByArticleId = (articleId) => {

    let queryStr = `SELECT articles.author, articles.title, articles.article_id, articles.body, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments) AS comment_count 
    FROM articles 
    LEFT JOIN comments ON articles.article_id = comments.article_id 
    WHERE articles.article_id=$1 GROUP BY articles.article_id;`;

    return db
    .query(queryStr, [articleId])
    .then(({ rows, rowCount }) => {
        
        if(rowCount !== 0) {
            rows[0].comment_count = Number(rows[0].comment_count);
        }

        return rowCount === 0 
        ? Promise.reject({ status: 404, msg: "Resource not found." })
        : rows[0];
    })
}

exports.selectArticles = (topic, sortBy = 'created_at', order = 'desc') => {

    if(!['created_at', 'author', 'title', 'article_id', 'topic', 'votes', 'article_img_url', 'comment_count'].includes(sortBy)) {
        return Promise.reject({ status: 400, msg: "Bad request."});
    }

    if(!['asc', 'desc'].includes(order)) {
        return Promise.reject({ status: 400, msg: "Bad request."});
    }

    let queryStr = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments) AS comment_count 
    FROM articles 
    LEFT JOIN comments ON articles.article_id = comments.article_id`; 

    const queryValues = [];

    if(topic) {
        queryStr += ` WHERE topic=$1`;
        queryValues.push(topic);
    }

    queryStr += ` GROUP BY articles.article_id ORDER BY ${sortBy} ${order}`;

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