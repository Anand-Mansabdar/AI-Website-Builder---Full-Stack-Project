import "dotenv/config";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({ origin: process.env.ORIGINS.split(","), credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  return res.send("Server is live...");
});

// Global error handler
app.use((error, _req, res, _next) => {
  console.error(`[ERROR] ${error.message}`);
  return res.status(500).json({
    message: error.message
  })
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
