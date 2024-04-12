const express = require("express");
const app = express();
const cors = require("cors");
const apiRouter = require("./routes/api-router.js");
const {handlePSQLErrors, handleCustomErrors, handleServerErrors, handleNonExistentEndpoints} = require("./controllers/errors-controller.js");

app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.all("/*", handleNonExistentEndpoints);

app.use(handlePSQLErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;
