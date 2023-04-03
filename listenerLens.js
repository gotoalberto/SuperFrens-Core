const {
  contractLensABI,
  campaingAbi,
  ERC721,
  contractLensAddress,
} = require("./const/const");
const ethers = require("ethers");
const { Framework } = require("@superfluid-finance/sdk-core");

require("dotenv").config();

async function main() {
  const providerLens = new ethers.providers.WebSocketProvider(
    `wss://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY_POLYGON}`
  );
  const providerSuperfluid = ethers.getDefaultProvider(
    `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_KEY_MUMBAI}`
  );

  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, providerSuperfluid);

  const sf = await Framework.create({
    chainId: Number(80001),
    provider: providerSuperfluid,
  });

  const fUSDCx = await sf.loadSuperToken("fUSDCx");
  const monthlyAmount = ethers.utils.parseEther("1");
  const calculatedFlowRate = Math.round(monthlyAmount / 2592000);

  const clientsArray = [
    {
      clientProfileId: 0x01a8f0,
      clientAddress: "0x43ddf2bf7b0d2bb2d3904298763bca2d3f2b40e0",
      flowSenderAddress: "0xD6E47877b0eeC8D3cF0B00EE49C28d6aa349b01d",
      followNftAddress: "0xAAAC76a2729bf0eE736577DABD2A751C8790E681",
      followers: [],
    },
  ];

  let contractCampaign;

  const contractLens = new ethers.Contract(
    contractLensAddress,
    contractLensABI,
    providerLens
  );

  async function createFlow(newFollower, clientFromApi, txHash) {
    contractCampaign = new ethers.Contract(
      clientFromApi.flowSenderAddress,
      campaingAbi,
      signer
    );
    let followerForSteam = newFollower;
    if (followerForSteam === "0x5a84eC20F88e94dC3EB96cE77695997f8446a22D") {
      const tx = await providerLens.getTransaction(txHash);
      const iface = new ethers.utils.Interface([
        "function followFor(uint256[] profileIds,address[] mintFor,bytes[] datas)",
      ]);
      const result = iface.decodeFunctionData("followFor", tx.data);
      followerForSteam = result.mintFor[0];
    }
    console.log("Creating steam to ", followerForSteam);
    const alreadyWithFlow = await clientFromApi.followers.filter(
      (follower) => follower.followerAddress === followerForSteam
    );
    if (alreadyWithFlow) {
      console.log("Already with flow");
      return;
    }
    const createFlowOperation = fUSDCx.createFlowByOperator({
      sender: clientFromApi.flowSenderAddress,
      receiver: followerForSteam,
      flowRate: calculatedFlowRate,
    });
    await createFlowOperation.exec(signer);
    clientFromApi.followers.push({
      followerAddress: followerForSteam,
      flowSenderAddress: clientFromApi.flowSenderAddress,
    });
    console.log(
      "Create flow done!, adding",
      followerForSteam,
      "to followersArray"
    );
  }

  async function cleanSteams(newFollower, clientFromApi, txHash) {
    console.log("Cleaning...");
    try {
      const contractLensNFT = new ethers.Contract(
        clientFromApi.followNftAddress,
        ERC721,
        providerLens
      );
      clientFromApi.followers.map(async (follower) => {
        const nftInBalance = await contractLensNFT.balanceOf(
          follower.followerAddress
        );
        if (nftInBalance === 0) {
          console.log("Cleaning ", follower.followerAddress);
          contractCampaign = new ethers.Contract(
            client.flowSenderAddress,
            campaingAbi,
            signer
          );
          const deleteFlowOperation = sf.cfaV1.deleteFlowByOperator({
            sender: client.flowSenderAddress,
            receiver: follower.followerAddress,
            superToken: fUSDCx,
          });
          await deleteFlowOperation
            .exec(signer)
            .then(followersArray.splice(index, 1));
        }
        await createFlow(
          newFollower,
          clientFromApi.contractFlowAddress,
          txHash
        );
      });
    } catch (err) {
      console.log(err);
    }
  }

  async function steam(profileIds, newFollower, tx) {
    const client = clientsArray.filter((_client) => {
      return _client.clientProfileId.toString() === profileIds;
    });
    if (client[0].followers.length > 0) {
      console.log("Cleaning steams...");
      await cleanSteams(newFollower, client[0], tx.transactionHash);
    } else {
      await createFlow(newFollower, client[0], tx.transactionHash);
    }
  }

  contractLens.on(
    "Followed",
    async (newFollower, profileIds, followModuleDatas, timestamp, tx) => {
      if (
        clientsArray.some(
          (cli) => cli.clientProfileId.toString() === profileIds.toString()
        )
      ) {
        await steam(profileIds.toString(), newFollower, tx);
      }
    }
  );
}

main().catch((error) => {
  console.error(error);
});
