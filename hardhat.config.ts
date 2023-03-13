import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const MUMBAI_RPC_URL: string = process.env.MUMBAI_RPC_URL as string;
const PRIVATE_KEY: string = process.env.PRIVATE_KEY as string;
const POLYGONSCAN_API: string = process.env.POLYGONSCAN_API as string;

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    mumbai: {
      url: MUMBAI_RPC_URL,
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
