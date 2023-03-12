require("@nomicfoundation/hardhat-toolbox")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-gas-reporter")
require("hardhat-deploy")
require("solidity-coverage")

require("dotenv").config()

const MUMBAI_URL_RPC = process.env.URL_RPC_MUMBAI
const PRIVATE_KEY_ACCOUNT_MUMBAI = process.env.PRIVATE_KEY_MUMBAI
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.14",
            },
        ],
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        player: {
            default: 1,
        },
    },
    networks: {
        mumbai: {
            chainId: 80001,
            blockConfirmations: 6,
            url: MUMBAI_URL_RPC,
            accounts: [PRIVATE_KEY_ACCOUNT_MUMBAI],
        },
        hardhat: {
            chainId: 31337,
            blockConfirmations: 1,
        },
    },
    polygonscan: {
        apiKey: {
            mumbai: POLYGONSCAN_API_KEY,
        },
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "MATIC",
    },
    mocha: {
        timeout: 700000,
    },
}
