import express from "express";
import { tradingRoutes } from "./routes/tradingRoutes";

const app = express();
const port = 5000;

app.use(express.json());

app.use("/api/trading", tradingRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
