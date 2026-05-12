/**
 * backend/server.ts
 * Entry point aplikasi GoletKos
 */

import express from "express";
import cors from "cors";
import path from "path";
import config from "./config";

import authRoutes from "./routes/auth";
import kosRoutes from "./routes/kos";
import bookingRoutes from "./routes/booking";
import featuresRoutes from "./routes/features";
import * as kosCtrl from "./controllers/kos";

const app = express();

// Middleware global
app.use(cors());
app.use(express.json());

// Serve frontend static files — .ts files served as JavaScript
app.use(
  express.static(path.join(__dirname, "../frontend"), {
    setHeaders(res, filePath) {
      if (filePath.endsWith(".ts")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  }),
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/kos", kosRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api", featuresRoutes);
app.post("/api/compare", kosCtrl.compare);

// Fallback: serve index.html
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Global error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("[Error]", err.message);
    res
      .status(500)
      .json({
        success: false,
        data: null,
        message: "Terjadi kesalahan server",
      });
  },
);

app.listen(config.app.port, () => {
  console.log(`Server berjalan di http://localhost:${config.app.port}`);
});

export default app;
