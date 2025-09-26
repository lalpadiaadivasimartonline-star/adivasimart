//External Modules
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
//Local Modules
const User = require("../models/Users");
const db = require("../utils/dataBaseUtils");

exports.postSignup = [
  check("first_name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters long.")
    .matches(/^[A-Za-z]+$/)
    .withMessage("First name must contain only alphabetic characters."),

  check("last_name")
    .trim()
    .matches(/^[A-Za-z]+$/)
    .withMessage("Last name must contain only alphabetic characters."),

  check("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .matches(/[A-Za-z\s]/)
    .normalizeEmail(),

  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 character long")
    .matches(/[A-Z]/)
    .withMessage("password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("password must contain at least one number")
    .matches(/[\W]/)
    .withMessage("password must contain at least one special character"),

  check("confirm_password")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),

  (req, res, next) => {
    const { first_name, last_name, email, password, confirm_password } =
      req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        const user = new User(first_name, last_name, email, hashedPassword);
        return user.save();
      })
      .then((result) => {
        res.status(201).json({ message: "User created successfully!" });
      })
      .catch((err) => {
        console.log(err);
      });

    // const user = new Users(null, first_name, last_name, email, password);
    // user.save();
    // res.status(201).json({ message: "User created successfully!" });
  },
];

exports.postLogin = async (req, res, next) => {
  // console.log(req.body);
  const { email, password } = req.body;

  const [rows] = await db.execute(
    `SELECT user_id, password FROM users WHERE email=?`,
    [email]
  );
  // console.log("ROWS", rows);
  if (!rows.length)
    return res.status(401).json({ error: "Invalid credentials" });

  const user = rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    return res
      .status(401)
      .json({
        error: "Invalid credentials",
        isLoggedIn: req.session.isLoggedIn,
      });
  }

  req.session.userId = user.user_id;
  req.session.regenerate((err) => {
    if (err) {
      return res.status(500).json({ error: "Session error" });
    }
    req.session.userId = user.user_id;
    req.session.isLoggedIn = true;
    req.session.user = email;
    res.json({
      message: "Logged in",
      userId: user.user_id,
      isLoggedIn: req.session.isLoggedIn,
      user: email,
    });
  });
  // console.log("POST LOGIN SESSION", req.session);
};

exports.postLogout = async (req, res, next) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout Failed' });

    res.clearCookie('users');
    return res.json({ message: 'Logged out' });
  })
}

exports.getHome = async (req, res, next) => {
  // console.log('USER ID',req.session.userId)
  // const [rows] = await db.execute(
  //   `SELECT user_id, email password FROM users WHERE user_id=?`,
  //   [req.session.userId]
  // );
  // if (req.user_id !== req.session.userId) res.json({ error: "Unauthorized" });
   if (!req.session || !req.session.userId || !req.session.isLoggedIn) {
     return res.status(401).json({
       error: "Unauthorized",
       isLoggedIn: false,
     });
   }
  res.json({
    user: {
      userId: req.session.userId,
      user: req.session.user,
      isLoggedIn: req.session.isLoggedIn,
    },
    message: "Authorized",
  });

};
