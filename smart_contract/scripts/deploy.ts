import { network } from "hardhat";

async function main() {
    const { ethers } = await network.create();

    const AuditTrail = await ethers.getContractFactory("AuditTrail");

    const auditTrail = await AuditTrail.deploy();

    await auditTrail.waitForDeployment();

    console.log(
        "AuditTrail deployed at:",
        await auditTrail.getAddress()
    );
}

main()
.catch((error) => {
    console.error(error);
    process.exitCode = 1;
});