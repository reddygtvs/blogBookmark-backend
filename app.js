const config = require("./utils/config");

const express = require("express");
require("express-async-errors");
const app = express();
const cors = require("cors");

const blogsRouter = require("./controllers/blogs");
const middleware = require("./utils/middleware");
const logger = require("./utils/logger");
const userRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");

const mongoose = require("mongoose");

const mongoUrl = config.MONGODB_URI;
mongoose.connect(mongoUrl);
app.use(cors());
app.use(express.json());
app.use(express.static("build"));
app.use(middleware.tokenExtractor);
// app.use(middleware.userExtractor);
app.use("/api/blogs", middleware.userExtractor, blogsRouter);
app.use("/api/users", userRouter);
app.use("/api/login", loginRouter);

if (process.env.NODE_ENV === "test") {
  const testingRouter = require("./controllers/testing");
  app.use("/api/testing", testingRouter);
}

app.use(middleware.requestLogger);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
