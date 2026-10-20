import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create({
    network: "sepolia",
  });

  const networkInfo = await ethers.provider.getNetwork();

  if (networkInfo.chainId !== 11155111n) {
    throw new Error(
      `Wrong network! Expected Sepolia (11155111), got ${networkInfo.chainId}.`,
    );
  }

  const [signer] = await ethers.getSigners();

  if (!signer) {
    throw new Error("No deployer account configured.");
  }

  const deployerAddress = await signer.getAddress();
  const balance = await ethers.provider.getBalance(deployerAddress);

  console.log("Network: Sepolia");
  console.log("Chain ID:", networkInfo.chainId.toString());
  console.log("Deployer:", deployerAddress);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  const AuditTrail = await ethers.getContractFactory("AuditTrail", signer);
  const auditTrail = await AuditTrail.deploy();

  console.log("Deployment transaction:", auditTrail.deploymentTransaction()?.hash);

  await auditTrail.waitForDeployment();

  console.log("AuditTrail deployed at:", await auditTrail.getAddress());
  console.log("Deployment successful!");
}

main().catch((error) => {
  console.error("Sepolia deployment failed:", error);
  process.exitCode = 1;
});