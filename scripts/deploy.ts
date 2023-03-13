import { ethers, network } from "hardhat";
import { developmentChains } from "../helper-hardhat-config";
import { verify } from "../utils/verify";

async function main() {
  const FlowSenderFactory = await ethers.getContractFactory(
    "FlowSenderFactory"
  );
  const flowSenderFactory = await FlowSenderFactory.deploy();

  await flowSenderFactory.deployed();

  console.log(`flowSenderFactory deployed to ${flowSenderFactory.address}`);
  console.log("Waiting confirmations");
  await flowSenderFactory.deployTransaction.wait(10);
  console.log("Confirmations done!");
  if (
    !developmentChains.includes(network.name) &&
    process.env.POLYGONSCAN_API
  ) {
    console.log("Verifying...");
    await verify(flowSenderFactory.address, []);
  }
}

main()
  .then(() => (process.exitCode = 0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
