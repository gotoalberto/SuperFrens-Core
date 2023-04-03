const {
  contractLensABI,
  campaingAbi,
  ERC721,
  contractLensAddress,
} = require("../const/const");
const ethers = require("ethers");
const { Framework } = require("@superfluid-finance/sdk-core");

require("dotenv").config();

describe("Contract listener", function () {
  let signer, sf, fUSDCx, monthlyAmount, calculatedFlowRate;

  const clientsArray = [
    {
      clientProfileId: 0x01a8f0,
      clientAddress: "0x43ddf2bf7b0d2bb2d3904298763bca2d3f2b40e0",
      flowSenderAddress: "0x7E06FD8211dB3d06Ec3Dc023c01dBCFF7E476368",
      followNftAddress: "0xAAAC76a2729bf0eE736577DABD2A751C8790E681",
      followers: [],
    },
  ];

  const newFollower = "0x96A313A39C5A52ef5685d3139B66A8EA2b6DF5E4";
  const nextCampaignAddress = "0xcc128620cd1b2ff89034cd33fdeff2a2f7096d79";

  const providerSuperfluid = ethers.getDefaultProvider(
    `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_KEY_MUMBAI}`
  );

  beforeEach(async () => {
    signer = new ethers.Wallet(process.env.PRIVATE_KEY, providerSuperfluid);
    sf = await Framework.create({
      chainId: Number(80001),
      provider: providerSuperfluid,
    });
    fUSDCx = await sf.loadSuperToken("fUSDCx");
    monthlyAmount = ethers.utils.parseEther("1");
    calculatedFlowRate = Math.round(monthlyAmount / 2592000);
  });

  describe("Create flow", function () {
    it("Get the next campaign address", async function () {
      let _nonce = 0;

      _nonce = await providerSuperfluid.getTransactionCount(
        "0x9Eb19d1A3D7bb955A81a5e246aa0f524d835CA59",
        "latest"
      );

      let rlpEncoded = ethers.utils.RLP.encode([
        "0x9Eb19d1A3D7bb955A81a5e246aa0f524d835CA59",
        ethers.BigNumber.from(_nonce.toString()).toHexString(),
      ]);
      let contractAddressLong = ethers.utils.keccak256(rlpEncoded);
      let contractAddress = "0x".concat(contractAddressLong.substring(26));
      expect(contractAddress).toBe(nextCampaignAddress);
    });

    it("Should create a flow to new follower if he start follow", async function () {
      try {
        const createFlowOperation = fUSDCx.createFlowByOperator({
          sender: clientsArray[0].flowSenderAddress,
          receiver: newFollower,
          flowRate: calculatedFlowRate,
        });
        await createFlowOperation.exec(signer);
      } catch (error) {
        console.log(
          "Hmmm, your transaction threw an error. Make sure that this stream does not already exist, and that you've entered a valid Ethereum address!"
        );
        console.log(error);
      }
    });
    it("Should delete a flow to the follower if he stop follow", async function () {
      try {
        const deleteFlowOperation = sf.cfaV1.deleteFlowByOperator({
          sender: clientsArray[0].flowSenderAddress,
          receiver: newFollower,
          superToken: fUSDCx.address,
        });
        await deleteFlowOperation.exec(signer);
      } catch (error) {
        console.log(
          "Hmmm, your transaction threw an error. Make sure that this stream does not already exist, and that you've entered a valid Ethereum address!"
        );
        console.log(error);
      }
    });
  });
});
