const axios = require("axios");
const { Keypair, VersionedTransaction } = require("@solana/web3.js");
const testWallet = require("./test-wallet.json");
const config = require("./config");

const creator = Keypair.fromSecretKey(Uint8Array.from(testWallet));

// console.log("privateKeyBuffer:", creator.secretKey);

const executeSwap = async () => {
  try {
    // Define the payload
    const payload = {
      action: "BUY", // or 'SELL'
      mintAddress: "9ThH8ayxFCFZqssoZmodgvtbTiBmMoLWUqQhRAP89Y97",
      amount: "10000000000000000", // Example token amount (adjust as needed) with token decimals, if too low, the swap will fail
      sender: "5ERCcaLkuLYvu4N27UEv982LXsrmQgtstb4Bonbhbf6k",
    };

    // Make a POST request to your prepare endpoint
    const response = await axios.post(
      `${config.API_BASE_URL}${config.endpoints.prepare}`,
      payload
    );

    // Get the serialized transaction from response
    // console.log("response.data", response.data);
    const { serializedTransactionBase64 } = response.data.transaction;
    if (!serializedTransactionBase64) {
      throw new Error("Serialized transaction is undefined");
    }
    // console.log("serializedTransaction", typeof serializedTransactionBase64);
    // Deserialize the transaction
    const transactionBuffer = Buffer.from(
      serializedTransactionBase64,
      "base64"
    );
    const deserializedMessage =
      VersionedTransaction.deserialize(transactionBuffer);
    // const transaction = Transaction.from(deserializedMessage);
    // Sign the transaction with the creator's keypair
    deserializedMessage.sign([creator]);
    // Serialize the signed transaction to send to the submit endpoint
    const serializedSignedTransaction = Buffer.from(
      deserializedMessage.serialize()
    ).toString("base64");

    // Make a POST request to your submit endpoint
    const responseFromSendTransaction = await axios.post(
      `${config.API_BASE_URL}${config.endpoints.submit}`,
      { serializedSignedTransaction }
    );
    console.log(
      "Trasaction response from bacek",
      responseFromSendTransaction.data
    );

    // // Log the response
    // console.log('Transaction Prepared:', deserializedMessage);
  } catch (error) {
    console.error("Error preparing transaction:", error);
  }
};

// Call the function
executeSwap();
