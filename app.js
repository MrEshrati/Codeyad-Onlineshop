const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./models/user.model");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");

const MONGODB_URI = "mongodb://localhost/OnlineShop";

const app = express();
const store = new MongoDBSession({
  uri: MONGODB_URI,
  collection: "session",
});

const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRouter = require("./routes/admin.route");
const shopRouter = require("./routes/shop.route");
const authRouter = require("./routes/auth.route");

app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);

app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "REDACTED",
    resave: false,
    saveUninitialized: false,
    store: store,
  }),
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRouter);
app.use(shopRouter);
app.use(authRouter);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

mongoose
  .connect(MONGODB_URI)
  .then((res) => {
    User.findOne().then((user) => {
      if (!user) {
        const password = "REDACTED"
        return bcrypt.hash(password, 12).then((hashedPassword) => {
          const user = new User({
            // name: "Arshia"
            email: "REDACTED",
            password: hashedPassword,
            cart: { item: [] },
          });
          return user.save();
        });
      }
    });

    app.listen(3000, () => {
      console.log("Listening on PORT 3000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
