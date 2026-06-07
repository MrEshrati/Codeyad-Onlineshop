// const cookieParser = require("../util/cookieparser");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const sendEmail = require("../util/email");
const crypto = require("crypto");
const { log } = require("console");
const { validationResult } = require("express-validator");

exports.getLogin = (req, res) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
  });
};

exports.postLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email }).then((user) => {
    if (!user) {
      req.flash("error", "Email/Password is incorrect");
      return res.redirect("/login");
    }

    bcrypt.compare(password, user.password).then((match) => {
      if (match) {
        req.session.isLoggedIn = true;
        req.session.user = user;
        return req.session.save((err) => {
          console.log(err);
          res.redirect("/");
        });
      }
      req.flash("error", "Email/Password is incorrect");
      res.redirect("/login");
    });
  });
};

exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
};

exports.getSignup = (req, res) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: req.flash("error"),
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
};

exports.postSignup = (req, res) => {
  const errors = validationResult(req);
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
    });
  }

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash("error", "Email is already in use");
        return res.redirect("/signup");
      }

      return bcrypt.hash(password, 12).then((hashedPassword) => {
        const user = new User({
          email: email,
          password: hashedPassword,
          cart: { item: [] },
        });
        return user.save();
      });
    })
    .then(() => {
      req.flash("success", "Your account has been created.You can login");
      sendEmail({
        subject: "Sign Up",
        // text: "You are signed up!!!!",
        html: `<h1>You are signed up!!!</h1>`,
        userEmail: email,
      });
      res.redirect("/login");
    })
    .catch((e) => {
      console.log(e);
    });
};

exports.getResetPass = (req, res) => {
  res.render("auth/reset", {
    path: "/reset-password",
    pageTitle: "Reset-Password",
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
  });
};

exports.postResetPass = (req, res) => {
  crypto.randomBytes(32, (err, buf) => {
    if (err) {
      console.log(err);
      return res.render("/reset-password");
    }

    const token = buf.toString("hex");
    User.findOne({ email: req.body.email }).then((user) => {
      if (!user) {
        req.flash("error", "No User with this email found");
        return res.redirect("/reset-password");
      }

      req.flash("success", "An Email containing the reset link was sent");
      res.redirect("/reset-password");
      sendEmail({
        userEmail: req.body.email,
        subject: "بازیابی رمز عبور",
        html: `<p>درخواست بازیابی رمز عبور</p>
        <p>برای بازیابی رمز عبور روی لینک کلیک کنید. <a href="http://localhost:3000/reset-password/${token}">لینک</a></p>`,
      });
      user.resetToken = token;
      user.ResetTokenExpireDate = Date.now() + 3600000;
      return user.save();
    });
  });
};

exports.getUpdatePassword = (req, res) => {
  const token = req.params.token;

  User.findOne({
    resetToken: token,
    ResetTokenExpireDate: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid/Expired Token.");
        return res.redirect("/reset-password");
      }

      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "Update Password",
        errorMessage: req.flash("error"),
        successMessage: req.flash("success"),
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postUpdatePassword = (req, res) => {
  const newPass = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let selectedUser;

  User.findOne({
    resetToken: passwordToken,
    ResetTokenExpireDate: {
      $gt: Date.now(),
    },
    _id: userId,
  })
    .then((user) => {
      selectedUser = user;
      return bcrypt.hash(newPass, 12);
    })
    .then((hashedPass) => {
      selectedUser.password = hashedPass;
      selectedUser.resetToken = undefined;
      selectedUser.ResetTokenExpireDate = undefined;
      return selectedUser.save();
    })
    .then((result) => {
      req.flash("success", "Your password has successfuly updated");
      res.redirect("/login");
    })
    .catch((err) => {
      req.flash("error", "There was an error updating your password");
      res.redirect("/reset-password");
    });
};
