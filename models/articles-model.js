const db = require("../db/connection.js");

exports.selectArticleById = (articleId) => {

    return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [articleId])
    .then(({ rows, rowCount }) => {
        
        if(rowCount === 0){
            return Promise.reject({ status: 404, msg: "Resource not found." });
        }
        return rows[0];
    })
}