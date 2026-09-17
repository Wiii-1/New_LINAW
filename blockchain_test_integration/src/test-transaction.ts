import { JsonRpcProvider, Wallet } from "ethers";
import { readFileSync } from "node:fs";

const walletData = JSON.parse(
  readFileSync("../secrets/linaw-wallet.json", "utf8")
);

const provider = new JsonRpcProvider("http://localhost:8545");
const wallet = new Wallet(walletData.privateKey, provider);

console.log("1. Connected");

console.log("2. Chain ID:");
console.log(await provider.getNetwork());

console.log("3. Nonce:");
console.log(await provider.getTransactionCount(wallet.address));

console.log("4. Balance:");
console.log((await provider.getBalance(wallet.address)).toString());

console.log("5. Fee Data:");
console.log(await provider.getFeeData());

console.log("6. Estimating gas...");

const gas = await provider.estimateGas({
  from: wallet.address,
  to: wallet.address,
  value: 0n,
});

console.log(gas);

console.log("Address:", await wallet.getAddress());

console.log(
  "Nonce:",
  await provider.getTransactionCount(
    await wallet.getAddress(),
    "latest"
  )
);

console.log("7. Sending...");

const tx = await wallet.sendTransaction({
  to: wallet.address,
  value: 0n,
  gasLimit: gas,
});

console.log(tx.hash);