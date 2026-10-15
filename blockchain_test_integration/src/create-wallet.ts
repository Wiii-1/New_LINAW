import { Wallet } from "ethers"
import { writeFileSync } from "node:fs"

const wallet = Wallet.createRandom()

const walletData ={
    address: wallet.address,
    privateKey: wallet.privateKey
}

console.log("LINAW Application Wallet");
console.log("========================");

console.log("Address: ")
console.log(wallet.address)

console.log("\nPrivate Key: ")
console.log(wallet.privateKey)

writeFileSync(
    "linaw-wallet.json",
    JSON.stringify(walletData, null, 2),
    {
        mode: 0o600
    }
)

console.log("\nSaved to linaw-wallet.json")