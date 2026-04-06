const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("./config/database");
const routes = require("./routes");
const errorHandler = require("./utils/helpers/errorHandler");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const { verifyToken } = require("./utils/jwt");
const { scheduleExpiredTokenCleanup } = require("./utils/tokenCleanup");

const app = express();
const server = require("http").createServer(app);
const clientOrigins = (process.env.CLIENT_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (clientOrigins.length === 0) {
  if (process.env.NODE_ENV === "production") {
    console.error("FATAL: CLIENT_ORIGINS is not configured in production. CORS is permissive and this is unsafe. Set CLIENT_ORIGINS with allowed origins.");
    process.exit(1);
  }

  console.warn("WARNING: CLIENT_ORIGINS not configured. CORS will allow all origins in non-production environments.");
}

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // allow non-browser requests (postman, internal systems)
  if (clientOrigins.length === 0) return process.env.NODE_ENV !== "production";
  return clientOrigins.includes(origin);
};

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
};

const io = require("socket.io")(server, {
  cors: corsOptions,
});

// Store io on app for access in controllers
app.set("io", io);

const isProduction = process.env.NODE_ENV === "production";
let trustProxyValue;

if (process.env.TRUST_PROXY_HOPS !== undefined) {
  const hops = Number.parseInt(process.env.TRUST_PROXY_HOPS, 10);

  if (!Number.isInteger(hops) || hops < 0) {
    console.warn(`Invalid TRUST_PROXY_HOPS value '${process.env.TRUST_PROXY_HOPS}'; expected non-negative integer. Skipping trust proxy setting.`);
  } else {
    trustProxyValue = hops;
  }
} else if (isProduction) {
  // In production with proxies (Nginx, AWS ELB, Vercel, Cloudflare), this is usually required.
  trustProxyValue = 1;
  console.warn("TRUST_PROXY_HOPS not set, defaulting to 1 for production to support accurate rate-limiting behind proxies.");
}

if (trustProxyValue !== undefined) {
  app.set("trust proxy", trustProxyValue);
  console.log(`Trust proxy hops set to ${trustProxyValue}`);
}

io.use((socket, next) => {
  const authToken = socket.handshake.auth?.token;
  const authHeader = socket.handshake.headers?.authorization;
  const token = authToken || (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);

  if (!token) {
    return next(new Error("Authentication token required"));
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    return next(new Error("Invalid authentication token"));
  }

  if (!decoded?._id) {
    return next(new Error("Invalid authentication token"));
  }

  socket.data.userId = decoded._id;
  socket.data.name = decoded.name;
  socket.data.role = decoded.role;
  socket.data.profileImage = decoded.profileImage;
  socket.data.workspaceId = decoded.role === "admin" ? decoded._id : decoded.adminRef || null;

  return next();
});

const initializeSockets = require("./sockets");
initializeSockets(io);

// Connect to MongoDB
connectDB();

// Schedule periodic cleanup of expired token fields on user accounts
scheduleExpiredTokenCleanup();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(passport.initialize());

// Passport Config
require("./config/passport");

// Routes
app.use("/api", routes);

// Swagger API Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Workspace Elite API Documentation",
  }),
);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
