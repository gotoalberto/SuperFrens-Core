import { ethers } from "hardhat";

async function main() {
  const FlowSenderFactory = await ethers.getContractFactory(
    "FlowSenderFactory"
  );
  const flowSenderFactory = await FlowSenderFactory.deploy();

  await flowSenderFactory.deployed();

  console.log(`flowSenderFactory deployed to ${flowSenderFactory.address}`);
}

main()
  .then(() => (process.exitCode = 0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
