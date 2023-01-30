require("dotenv").config();
const mongoose = require("mongoose");

// useNewUrlParser: true,
// useUnifiedTopology: true,
// useFindandModify: true,
// useCreateIndex: true,

const connectDB = async () => {
  try {
    const connect = await // mongoose.set("strictQuery", false)
    mongoose.connect(process.env.DB_URL, { useNewUrlParser: true });

    console.log("MongoDB connected: ", connect.connection.host);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = connectDB;
