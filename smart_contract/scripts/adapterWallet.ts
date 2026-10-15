import { Wallet } from "ethers"
import fs from "fs"

const wallet = Wallet.createRandom()

console.log("Adapter wallet address:");
console.log(wallet.address);


console.log("Adapter wallet private key:");
console.log(wallet.privateKey);


fs.writeFileSync(
    "adapter-wallet.json",
    JSON.stringify(
        {
            address: wallet.address,
            privateKey: wallet.privateKey
        },
        null,
        2
    )
);