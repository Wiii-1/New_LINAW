import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create({ network: "sepolia" });

  const [signer] = await ethers.getSigners();

  if (!signer) {
    throw new Error("No deployer account configured.");
  }

  const address = await signer.getAddress();
  const balance = await ethers.provider.getBalance(address);
  const networkInfo = await ethers.provider.getNetwork();

  console.log("\n========== SEPOLIA VERIFICATION ==========");
  console.log("Network:", networkInfo.name);
  console.log("Chain ID:", networkInfo.chainId.toString());
  console.log("Deployer address:", address);
  console.log("Sepolia ETH balance:", ethers.formatEther(balance));
  console.log("==========================================\n");

  if (networkInfo.chainId !== 11155111n) {
    throw new Error("Wrong network! Expected Ethereum Sepolia.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});