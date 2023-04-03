import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const ALCHEMY_KEY_MUMBAI: string = process.env.ALCHEMY_KEY_MUMBAI as string;
const PRIVATE_KEY: string = process.env.PRIVATE_KEY as string;
const POLYGONSCAN_API: string = process.env.POLYGONSCAN_API as string;

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_KEY_MUMBAI}`,
      accounts: [PRIVATE_KEY],
      chainId: 80001,
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: POLYGONSCAN_API,
    },
  },
  solidity: "0.8.14",
};

export default config;
