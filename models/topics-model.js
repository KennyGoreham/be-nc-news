const db = require('../db/connection.js');

exports.selectTopics = () => {
    
    return db
    .query(`SELECT * FROM topics;`)
    .then(({ rows }) => {
        return rows;
    })
}

exports.selectTopicsByTopic = (topic) => {

    return db
    .query(`SELECT * FROM topics where slug=$1`, [topic])
    .then(({ rows,rowCount }) => {
        if(rowCount === 0) {
            return Promise.reject({ status: 404, msg: "Resource not found." });
        }
        return rows;
    })
}