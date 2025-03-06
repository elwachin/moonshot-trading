import { Environment, FixedSide, Moonshot } from "@wen-moon-ser/moonshot-sdk";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  TransactionMessage,
  VersionedTransaction,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import {
  RPC_URL,
  FEE_WALLET,
  FEE_PERCENTAGE,
  SLIPPAGE_BPS,
  COMPUTE_UNIT_PRICE_MICROLAMPORTS,
} from "../config";

const connection = new Connection(RPC_URL, "confirmed");

export const prepareTrade = async (
  action: "BUY" | "SELL", //Only BUY and SELL are supported
  mintAddress: string,
  amount: string,
  sender: string
) => {
  const keypair = Keypair.generate();
  // Initialize Moonshot SDK with RPC and environment configuration
  const moonshot = new Moonshot({
    rpcUrl: RPC_URL,
    environment: Environment.DEVNET,
    chainOptions: {
      solana: { confirmOptions: { commitment: "confirmed" } },
    },
  });

  // Create token instance using the provided mint address
  const token = moonshot.Token({
    mintAddress,
  });

  const creator = new PublicKey(sender);
  const feeWalletPubkey = new PublicKey(FEE_WALLET);
  const tokenAmount = BigInt(amount);

  // Validate trade action
  if (action !== "BUY" && action !== "SELL") {
    return;
  }

  // Calculate the required collateral amount for the trade in SOL
  const collateralAmount = await token.getCollateralAmountByTokens({
    tokenAmount,
    tradeDirection: action,
  });

  // Prepare trading instructions with configured slippage tolerance
  const { ixs } = await token.prepareIxs({
    slippageBps: SLIPPAGE_BPS,
    creatorPK: creator.toBase58(),
    tokenAmount,
    collateralAmount,
    tradeDirection: action,
    fixedSide: FixedSide.OUT,
  });

  // Set compute unit price for transaction priority
  const priorityIx = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: COMPUTE_UNIT_PRICE_MICROLAMPORTS,
  });

  const { blockhash } = await connection.getLatestBlockhash("confirmed");

  // Calculate platform fee (FEE_PERCENTAGE of collateral amount)
  // console.log("collateralAmount", Number(collateralAmount));
  const feeAmount = (collateralAmount * BigInt(FEE_PERCENTAGE)) / BigInt(100);

  // Create fee transfer instruction
  const transferInstruction = SystemProgram.transfer({
    fromPubkey: creator,
    toPubkey: feeWalletPubkey,
    lamports: Number(feeAmount),
  });

  // Build MessageV0 transaction message with priority, trading instructions, and fee transfer
  const messageV0 = new TransactionMessage({
    payerKey: creator,
    recentBlockhash: blockhash,
    instructions: [priorityIx, ...ixs, transferInstruction],
  }).compileToV0Message();

  // Create a versioned transaction from the message
  const transaction = new VersionedTransaction(messageV0);

  // Serialize tranaction for transmission
  const serializedTransaction = transaction.serialize();

  // Convert the binary buffer to a base64 string for easy transmission
  // This format can be safely sent over HTTP/websockets and stored in databases
  const serializedTransactionBase64 = Buffer.from(
    serializedTransaction
  ).toString("base64");

  // Return the base64 encoded transaction
  return { serializedTransactionBase64 };

  // return serializedTransaction.toString('base64');
};

export const submitTrade = async (serializedSignedTransaction: string) => {
  // Deserialize and submit the signed transaction
  const transactionBuffer = Buffer.from(serializedSignedTransaction, "base64");
  const deserializedMessage =
    VersionedTransaction.deserialize(transactionBuffer);
  const txHash = await connection.sendTransaction(deserializedMessage, {
    skipPreflight: false,
    maxRetries: 0,
    preflightCommitment: "confirmed",
  });
  console.log("txHash", txHash);
  return txHash;
};
