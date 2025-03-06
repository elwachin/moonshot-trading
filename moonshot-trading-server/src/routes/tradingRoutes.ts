import { Router } from "express";
import {
  prepareTransaction,
  submitTransaction,
} from "../controllers/tradingController";

export const tradingRoutes = Router();

tradingRoutes.post("/prepare", prepareTransaction);
tradingRoutes.post("/submit", submitTransaction);
