import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authRoutes } from "./routes/auth.routes.js";
import { taskRoutes } from "./routes/task.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));
app.use(express.json());

// Rotas da aplicação
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Backend a correr na porta ${port}`);
});
