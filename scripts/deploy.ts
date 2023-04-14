import { ethers, network } from "hardhat";
import { developmentChains } from "../helper-hardhat-config";
import { verify } from "../utils/verify";

async function main() {
  const CampaignsFactory = await ethers.getContractFactory(
    "CampaignFactory"
  );
  const _tokenX = "0x42bb40bF79730451B11f6De1CbA222F17b87Afd7"
  const _owner = "0xa8EC796eE75B04af1223445c587588181CEb56CD"
  
  const campaignsFactory = await CampaignsFactory.deploy(_tokenX, _owner);

  await campaignsFactory.deployed();

  console.log(`campaignsFactory deployed to ${campaignsFactory.address}`);
  console.log("Waiting confirmations");
  await campaignsFactory.deployTransaction.wait(10);
  console.log("Confirmations done!");
  if (
    !developmentChains.includes(network.name) &&
    process.env.POLYGONSCAN_API
  ) {
    console.log("Verifying...");
    await verify(campaignsFactory.address, [_tokenX, _owner]);
  }
}

main()
  .then(() => (process.exitCode = 0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
