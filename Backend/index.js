import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import DbCon from "./libs/db.js";
import AuthRoutes from "./routes/Auth.routes.js";
import EventRoutes from "./routes/Event.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Allow credentials + exact origin (NO "*")
const allowedOrigins = [
  process.env.FRONTEND_URL, // https://pvpsit-events.vercel.app
  "http://localhost:5173"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// ✅ Handle preflight OPTIONS for all routes
app.options("*", cors(corsOptions));

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ Connect DB
DbCon();

// ✅ Routes
app.use("/auth", AuthRoutes);
app.use("/events", EventRoutes);

// ✅ Health check (optional)
app.get("/", (req, res) => {
  res.send("API working ✅");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
