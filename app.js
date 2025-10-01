require("dotenv").config();

const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || "development";

//Core Modules
const http = require("http");
const path = require("path");
const fs = require("fs");

//Exteral Modules
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

//Local Modules
const rootDir = require("./utils/pathUtils");
const adminRouter = require("./routes/adminRoutes");
const authRouter = require("./routes/authRoutes");
const customerAuthRouter = require("./routes/customerAuthRoutes");
const customerRouter = require("./routes/customerRoutes");
const guestRouter = require("./routes/guestRoutes");
const paymentRouter = require("./routes/paymentRoutes");
const productRouter = require("./routes/productRoutes");

const app = express();

if (NODE_ENV === "production") {
  app.set("trust proxy", 1); // Trust first proxy in production
} else {
  app.set("trust proxy", false); // Don't trust proxy in development
}

const corsOptions = {
  origin: function (origin, callback) {
    // Define allowed origins
    const allowedOrigins = [
      "http://localhost:3000", // React dev server
      "http://localhost:5173", // Vite dev server
      "http://localhost:5174",
      "http://192.168.43.2:5173",
      "http://192.168.43.2:5174",
      "https://adivasimart.com", // Production frontend
      "https://www.adivasimart.com", // Production frontend with www
      "https://admin.adivasimart.com",
      "https://z1x1nc5r-5173.inc1.devtunnels.ms",
      "https://adivasimart-server.onrender.com",
    ];

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Origin",
    "X-Requested-With",
    "Accept",
    "X-API-Client",
    // req.headers,
  ],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));



app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: true,
  })
);

app.use(express.json({ limit: "50mb" }));

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 5 login requests per windowMs
  message: {
    error: "Too many login attempts, please try again later.",
  },
  skipSuccessfulRequests: true,
  skip: (req) => {
    // Skip rate limiting in development
    return NODE_ENV === "development";
  },
});
// app.use(strictLimiter);
app.use("/admin/api/auth/login", authLimiter);
app.use("/client/api/auth/login", authLimiter);

const sessionStore = new MySQLStore({

  host: process.env.DB_HOST || "srv1401.hstgr.io",
  user: process.env.DB_USER || "u813762469_lalpadia",
  password: process.env.DB_PASSWORD || "Badal@25102000",
  database: process.env.DB_NAME || "u813762469_Lalpadia",
  port: process.env.DB_PORT || 3306,
  //Connection settings
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  //Session settings
  clearExpired: true,
  checkExpirationInterval: 900000, // 15 minutes
  expiration: 10 * 24 * 60 * 60 * 1000, // 10 days
  createDatabaseTable: false,
  connectionLimit: 5,
  endConnectionOnClose: true,
  // charset: "utf8mb4_bin",
  // schema: {
  //   tableName: "sessions",
  //   columnNames: {
  //     session_id: "session_id",
  //     expires: "expires",
  //     data: "data",
  //   },
  // },
});

const clientSessionStore = new MySQLStore({
  // host: "localhost",
  // user: "root",
  // password: "Nonha@0605",
  // database: "lalpadia",
  // host: "srv1401.hstgr.io",
  // user: "u813762469_lalpadia",
  // password: "Badal@25102000",
  // database: "u813762469_Lalpadia",
  // port: 3306,

  host: process.env.DB_HOST || "srv1401.hstgr.io",
  user: process.env.DB_USER || "u813762469_lalpadia",
  password: process.env.DB_PASSWORD || "Badal@25102000",
  database: process.env.DB_NAME || "u813762469_Lalpadia",
  port: process.env.DB_PORT || 3306,

  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,

  clearExpired: true,
  checkExpirationInterval: 900000,
  expiration: 10 * 24 * 60 * 60 * 1000,
  // createDatabaseTable: true,
  connectionLimit: 5,
  endConnectionOnClose: false,
  // charset: "utf8mb4_bin",
  // schema: {
  //   tableName: "client_sessions",
  //   columnNames: {
  //     session_id: "session_id",
  //     expires: "expires",
  //     data: "data",
  //   },
  // },
});

sessionStore.onReady(() => {
  console.log("MySQLStore ready");
});

clientSessionStore.onReady(() => {
  console.log("Client session store is Ready");
});

// sessionStore.onError((error) => {
//   console.error("Session store error:", error);
// });

//Setting up the template engine
app.set("view engine", "ejs");

// app.set("views", "views");

const randomString = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const SESSION_SECRET = process.env.SESSION_SECRET || randomString(32);
const CLIENT_SESSION_SECRET =
  process.env.CLIENT_SESSION_SECRET || randomString(32);
console.log("SESSION SECRET====", SESSION_SECRET);

const adminSession = session({
  key: "users",
  // name: "users",
  secret: SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 10 * 24 * 60 * 60 * 1000,
    // domain: NODE_ENV === "production" ? ".adivasimart.com" : undefined,
  },
  // genid: () => {
  //   return randomString(32);
  // },

  reconnect: true,
  acquireTimeout: 60000,
});

const clientSession = session({
  key: "clients",
  // name: "clients",
  secret: CLIENT_SESSION_SECRET,
  store: clientSessionStore,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure:  false,
    sameSite: "lax",
    maxAge: 10 * 24 * 60 * 60 * 1000,
  },
  // genid: () => {
  //   return randomString(32);
  // },
  reconnect: true,
  acquireTimeout: 60000,
});




const sessionMiddleware = (req, res, next) => {
  // console.log(`=== SESSION MIDDLEWARE DEBUG ===`);
  // console.log(`Full URL: ${req.originalUrl}`);
  // console.log(`Path: ${req.path}`);
  // console.log(`Method: ${req.method}`);
  // console.log(`Request headers:`, {
  //   cookie: req.headers.cookie,
  //   origin: req.headers.origin,
  //   userAgent: req.headers["user-agent"]?.substring(0, 50) + "...",
  // });

  // Check what session will be used
  let sessionType = "";
  if (req.path.startsWith("/admin")) {
    sessionType = "ADMIN";
    // console.log("🔵 Using ADMIN session for:", req.path);
    return adminSession(req, res, (err) => {
      
      if (err) {
        console.error("Admin session error:", err);
        return next(err);
      }
      // console.log("Admin session initialized:", {
      //   sessionID: req.sessionID,
      //   hasSession: !!req.session,
      //   userId: req.session?.userId,
      //   isLoggedIn: req.session?.isLoggedIn,
      //   cookieName: "users",
      // });
      next();
    });
  } else if (req.path.startsWith("/client") || req.path.startsWith("/api")) {
    sessionType = "CLIENT";
    // console.log("🟢 Using CLIENT session for:", req.path);
    return clientSession(req, res, (err) => {
      if (err) {
        console.error("Client session error:", err);
        return next(err);
      }
      // console.log("Client session initialized:", {
      //   sessionID: req.sessionID,
      //   hasSession: !!req.session,
      //   cookieName: "clients",
      // });
      next();
    });
  } else {
    sessionType = "DEFAULT CLIENT";
    // console.log("🟡 Using DEFAULT client session for:", req.path);
    return clientSession(req, res, (err) => {
      if (err) {
        console.error("Default session error:", err);
        return next(err);
      }
      // console.log("Default session initialized:", {
      //   sessionID: req.sessionID,
      //   hasSession: !!req.session,
      //   cookieName: "clients",
      // });
      next();
    });
  }
};

app.use(sessionMiddleware);

const generateProductFolder = () => {
  const timestamp = Date.now();
  const random = randomString(8);
  return `product_${timestamp}_${random}`;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!req.productFolder) {
      req.productFolder = generateProductFolder();
    }
    const productPath = path.join("uploads", req.productFolder);
    if (!fs.existsSync(productPath)) {
      fs.mkdirSync(productPath, { recursive: true });
    }
    cb(null, productPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.originalname}`;
    cb(null, fileName);
    // cb(null, randomString(10) + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // console.log("File filter check:", file.mimetype);
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    console.log("File rejected by filter:", file.mimetype);
    cb(null, false);
  }
};

// const multerOptions = { storage, fileFilter };
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    fieldSize: 10 * 1024 * 1024,
    fields: 50,
    field: 10,
  },
  fileFilter: fileFilter,
});
const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "gallery", maxCount: 10 },
]);

app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5174");
    res.header("Access-Control-Allow-Methods", "GET");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(rootDir, "uploads"))
);

// app.use("/uploads", express.static(path.join(rootDir, "uploads")));

app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(express.static(path.join(rootDir, "public")));
const requireAPIClient = (req, res, next) => {
  // Check if request is from browser
  const userAgent = req.get("User-Agent") || "";
  const isBrowser = /mozilla|edge|chrome|safari|firefox/i.test(userAgent);

  // Check for API client headers
  const hasAPIHeader =
    req.get("X-API-Client") || req.get("X-Requested-With") || req.get("origin");
  // console.log(req.get("X-Requested-With"));

  // Allow preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return next();
  }

  // Block browser requests without proper headers
  if (isBrowser && !hasAPIHeader) {
    return res.status(403).json({
      error: "Direct browser access not allowed",
      message:
        "This is an API endpoint. Please use the appropriate client application.",
    });
  }

  next();
};

// app.use((req, res, next) => {
//   console.log(`=== ROUTE DEBUG ===`);
//   console.log(`Method: ${req.method}`);
//   console.log(`Original URL: ${req.originalUrl}`);
//   console.log(`Path: ${req.path}`);
//   console.log(`Base URL: ${req.baseUrl}`);
//   console.log(`==================`);
//   next();
// });

app.use("/admin", requireAPIClient);
app.use("/admin/api/auth", authRouter);
app.use("/admin/api", uploadFields, adminRouter);
app.use("/api", customerAuthRouter);
app.use("/guest/api", guestRouter);
app.use("/client/api/", customerRouter);
app.use("/payment/api", paymentRouter);
app.use("/products", productRouter);



// app.use("*", (req, res) => {
//   console.log(`404 - Unhandled route: ${req.method} ${req.originalUrl}`);
//   res.status(404).json({
//     error: "Route not found",
//     method: req.method,
//     url: req.originalUrl,
//     path: req.path,
//   });
// });



// const PORT = 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running at http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Trust proxy: ${app.get("trust proxy")}`);
});