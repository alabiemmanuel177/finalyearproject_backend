const express = require("express");
const app = express();
const connectDB = require("./migrations/index.js");
const cors = require("cors");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });
const bodyParser = require("body-parser");

app.use(bodyParser.json({ limit: "10mb" }));

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
  "http://localhost:3000",
  "https://bucodel.vercel.app",
  "https://bucodel-alabiemmanuel177.vercel.app",
  "https://bucodel.vercel.app/",
];
const corsOptions = {
  /**
   * @param origin
   * @param callback
   */
  origin: function (origin, callback) {
    // Check if the origin is allowed by CORS
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
app.use(cors());

const fs = require("fs");

const UPLOADS_DIR = "./uploads";

// Check if the uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  // If it doesn't exist, create the directory
  fs.mkdirSync(UPLOADS_DIR);
  console.log("Folder Created");
} else {
  console.log("Folder Exist");
}

const { routes } = require("./routes/main");

// Registers routes
routes({ app, io });

app.get("/", (req, res) => {
  res.send("Server Running");
});

//db connect
connectDB();

const port = process.env.ACCESS_PORT || 5700;

server.listen(port, () => {
  console.log(`Server running on port ${port}.`);
});
