const db = require("../db/connection.js");

exports.selectUsers = () => {

  return db
    .query("SELECT * FROM users;")
    .then(({rows}) => {
      return rows;
    });
};

exports.selectUsersByUsername = (username) => {

  return db
    .query(`SELECT * FROM users 
    WHERE username=$1;`, [username])
    .then(({rows, rowCount}) => {

      return rowCount === 0
        ? Promise.reject({status: 404, msg: "Resource not found."})
        : rows[0];
    });
};

exports.selectCommentsByUsername = (username) => {

  return db
    .query(`SELECT * FROM comments
    WHERE author=$1
    ORDER BY created_at DESC`, [username])
    .then(({rows}) => {
      return rows;
    });
};
