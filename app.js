const createError = require("http-errors");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();

const indexRouter = require("./routes/index");

const app = express();
const port = 4000;

app.use(express.json());
app.use(cookieParser());
mongoose.set("strictQuery", false);

const mongoDB = process.env.MONGODB_URI;

main().catch((err) => console.log(err));
async function main() {
    await mongoose.connect(mongoDB);
}

app.use(cors({credentials: true, origin: "http://localhost:3000"}));
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  const message = err.message;
  const error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ message, error });
});

app.listen(port, () => console.log(`Server is up and running on port ${port}`));
