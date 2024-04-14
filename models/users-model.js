const db = require("../db/connection.js");
const {handlePagination} = require("./utils-model.js");

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

exports.selectCommentsByUsername = (username, limit = 10, p = 1) => {

  if(isNaN(limit) || isNaN(p)) {
    return Promise.reject({status: 400, msg: "Bad request."});
  }

  return db
    .query(`SELECT * FROM comments
    WHERE author=$1
    ORDER BY created_at DESC`, [username])
    .then(({rows, rowCount}) => {

      const totalPages = Math.ceil(rowCount / limit);
      const paginatedRows = handlePagination(rows, limit, p);

      return {
        paginatedRows,
        totalPages,
      };
    });
};
