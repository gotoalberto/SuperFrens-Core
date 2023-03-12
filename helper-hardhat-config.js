const networkConfig = {
    80001: {
        name: "mumbai",
        callbackGasLimit: "500000",
        interval: "30",
    },
    31337: {
        name: "hardhat",
        callbackGasLimit: "500000",
        interval: "30",
    },
}

const developmentChains = ["localhost", "hardhat", "mumbai"]
const frontEndContractsFile =
    "./constants/contractAddresses.json"
const frontEndAbiFile = "./constants/abi.json"

module.exports = {
    networkConfig,
    developmentChains,
    frontEndContractsFile,
    frontEndAbiFile,
}
