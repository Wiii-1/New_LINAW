import { JsonRpcProvider, Wallet } from "ethers";
import { readFileSync } from "node:fs";
import "dotenv/config"

const walletData = JSON.parse(
    readFileSync("../secrets/linaw-wallet.json", "utf-8")
)

const provider = new JsonRpcProvider(
    "http://localhost:8545"
);

const wallet = new Wallet (
    walletData.privateKey,
    provider
)

console.log("Address:");
console.log(wallet.address);

const network = await provider.getNetwork()

console.log("\nNetwork:");
console.log(network);

const balance = await provider.getBalance(wallet.address);

console.log("\nBalance:");
console.log(balance.toString());