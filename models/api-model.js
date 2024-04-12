const fs = require("fs/promises");

exports.selectApiDocs = () => {

  return fs.readFile(`${__dirname}/../endpoints.json`, "utf-8")
    .then((fileContents) => {
      return JSON.parse(fileContents);
    });
};
