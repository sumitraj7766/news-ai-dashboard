const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.join(__dirname, ".env"),
});

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      const isAllowedVercelDomain =
        typeof origin === "string" &&
        origin.endsWith(".vercel.app");

      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        isAllowedVercelDomain
      ) {
        return callback(null, true);
      }

      console.error("Blocked CORS origin:", origin);

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "20mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/user", require("./routes/user.routes"));
app.use("/api/news", require("./routes/news.routes"));
app.use("/api/ai", require("./routes/ai.routes"));

app.get("/", (req, res) => {
  res.send("News AI Backend is running");
});

app.use((error, req, res) => {
  if (error.type === "entity.too.large") {
    return res.status(413).json({
      message:
        "Profile image is too large. Please choose a smaller image.",
    });
  }

  if (error.message === "Not allowed by CORS") {
    return res.status(403).json({
      message: "Frontend origin is not allowed by CORS",
    });
  }

  console.error("Unhandled server error:", error);

  return res.status(500).json({
    message: "Internal server error",
  });
});

console.log(
  "Gemini configured:",
  Boolean(process.env.GEMINI_API_KEY)
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});