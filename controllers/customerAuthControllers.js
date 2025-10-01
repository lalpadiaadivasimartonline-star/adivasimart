//External Modules
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const Customers = require("../models/Customers");
const Cart = require("../models/Cart");

exports.postCustomerSignup = [
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

  check("phone_number")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Invalid phone number")
    .isLength({ max: 10 })
    .withMessage("Invalid phone number")
    .matches(/^[0-9]+$/)
    .withMessage("Invalid phone number"),

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

  async (req, res, next) => {
    const {
      first_name,
      last_name,
      guestId,
      phone_number,
      email,
      password,
      confirm_password,
      accept_terms,
    } = req.body;

    // console.log(req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const randomString = (length) => {
        let result = "";
        const characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
          result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
          );
        }
        return result;
      };

      const subString = (str) => {
        let newStr = "";
        for (let i = 0; i < str.length; i++) {
          if (str[i] === "@") {
            return newStr;
          }
          newStr += str[i];
        }

        return newStr;
      };

      let user_name = subString(email) + "_" + randomString(5);
      const hashedPassword = await bcrypt.hash(password, 12);
      const customer = new Customers(
        null,
        first_name,
        last_name,
        user_name,
        phone_number,
        email,
        hashedPassword
      );

      const [result] = await customer.save();
      const userId = userResult.customer_id;

      res.status(201).json({
        success: true,
        message: "User created successfully!",
        result: result,
      });
    } catch (err) {
      console.error("Signup error:", err);

      // Handle duplicate email error
      if (err.code === "ER_DUP_ENTRY" || err.errno === 1062) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
];

exports.postCustomerLogin = async (req, res, next) => {
  const { phoneNumber, email, password } = req.body;
  
  const [row] = await Customers.getCustomer(phoneNumber, email);

  if (!row.length) {
    return res.status(401).json({ error: { message: "Invalid credentials" } });
  } else {
    const matchPassword = await bcrypt.compare(password, row[0].password);
    if (!matchPassword) {
      
      return res
        .status(401)
        .json({ error: { message: "Invalid credentials" } });
    }
    const id = row[0].customer_id;
    const [cart] = await Cart.getCustomerCartItems(id);
    const [favourites] = await Cart.getCustomerFavourite(id);
    req.session.userId = row[0].customer_id;
    req.session.user = row[0];
    req.session.isLoggedIn = true;
    req.session.regenerate((error) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: "Session error" });
      }
      
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Session save failed" });
        }
        req.session.userId = row[0].customer_id;
        req.session.isLoggedIn = true;
        req.session.user = row[0];
        res.send({
          sessionID: req.sessionID,
          cart,
          favourites,
          user: req.session.user,
          userId: req.session.userId,
          isLoggedIn: req.session.isLoggedIn,
        });

      })

      
    });
  }
};

exports.checkLoginStatus = async (req, res, next) => {
  console.log("CLIENT SESSIONS",req.session)
  if (!req.session || !req.session.user || !req.session.userId) {
    // console.log("REJECTED");
    return res.status(401).json({
      error: "Unauthorized",
      isLoggedIn: false,
    });
  }

  // console.log("SUCESSSS====>", req.session);
  const [cart] = await Cart.getCustomerCartItems(req.session.userId);
  const [favourites] = await Cart.getCustomerFavourite(req.session.userId);

  res.json({
    cart,
    favourites,
    userId: req.session.userId,
    user: req.session.user,
    isLoggedIn: req.session.isLoggedIn,
  });
};

exports.postLogout = async (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Logout Failed" });

    res.clearCookie("clients");
    return res.json({ message: "Logged out" });
  });
};
