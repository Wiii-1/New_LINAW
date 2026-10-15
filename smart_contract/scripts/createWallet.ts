import { Wallet } from "ethers";
import { writeFileSync } from "node:fs";

const wallet = Wallet.createRandom();

const walletData = {
    address: wallet.address,
    privateKey: wallet.privateKey
};

console.log("LINAW Wallet");
console.log("========================");

console.log("Address:");
console.log(wallet.address);

console.log("\nPrivate Key:");
console.log(wallet.privateKey);

writeFileSync(
    "SC_Deployment.json",
    JSON.stringify(walletData, null, 2)
);

console.log("\nSaved to SC_Deployment.json");