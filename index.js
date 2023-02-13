const express = require("express");
const app = express();
const connectDB = require("./migrations/index.js");
const cors = require("cors");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.session());

const whitelist = [
  "https://bucodel-lms.onrender.com",
  "http://localhost:3000",
  "https://bucodel.vercel.app",
  "https://bucodel-alabiemmanuel177.vercel.app",
  "https://bucodel.vercel.app/",
];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

// app.use(cors(corsOptions));
app.use(cors());

const mainRoute = require("./routes/main");

app.use("/", mainRoute);

app.get("/", (req, res) => {
  res.send("Server Running");
});

//db connect
connectDB();

const port = process.env.ACCESS_PORT || 5700;

app.listen(port, () => {
  console.log(`Server running on port ${port}.`);
});