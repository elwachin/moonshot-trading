import { Request, Response } from "express";
import { prepareTrade, submitTrade } from "../services/tradingService";

export const prepareTransaction = async (req: Request, res: Response) => {
  const { action, mintAddress, amount, sender } = req.body;

  try {
    const preparedTransaction = await prepareTrade(
      action,
      mintAddress,
      amount,
      sender
    );
    res.json({ transaction: preparedTransaction });
  } catch (error) {
    console.error("Error preparing transaction:", error);
    res.status(500).json({ error: "Failed to prepare transaction" });
  }
};

export const submitTransaction = async (req: Request, res: Response) => {
  const { serializedSignedTransaction } = req.body;

  try {
    const result = await submitTrade(serializedSignedTransaction);
    res.json({ success: true, result });
  } catch (error) {
    console.error("Error submitting transaction:", error);
    res.status(500).json({ error: "Failed to submit transaction" });
  }
};
