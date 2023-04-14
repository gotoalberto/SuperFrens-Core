const {
  contractLensABI,
  ERC721,
  contractLensAddress,
} = require("./const/const");
const ethers = require("ethers");
const fetch = require("cross-fetch");
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

  let clientsArray = [];

  const fUSDCx = await sf.loadSuperToken("fUSDCx");

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  };

  async function getClients() {
    const response = await fetch(
      "https://qfgg4yahcg.execute-api.eu-north-1.amazonaws.com/fluidSense/clients",
      options
    );
    clientsArray = await response.json();
  }

  async function getFollowers(flowSenderAddress) {
    const response = await fetch(
      `https://qfgg4yahcg.execute-api.eu-north-1.amazonaws.com/fluidSense/followers?flowSenderAddress=${flowSenderAddress}`,
      options
    );
    return response.json();
  }

  async function deleteFollower(flowSenderAddress, followerAddress) {
    const response = await fetch(
      `https://qfgg4yahcg.execute-api.eu-north-1.amazonaws.com/fluidSense/followers?flowSenderAddress=${flowSenderAddress}&followerAddress=${followerAddress}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  async function postFollower(followerAddress, flowSenderAddress) {
    try {
      await fetch(
        "https://qfgg4yahcg.execute-api.eu-north-1.amazonaws.com/fluidSense/followers",
        {
          method: "POST",
          headers: {
            accept: "application/json",
          },
          body: JSON.stringify({
            followerAddress: followerAddress,
            flowSenderAddress: flowSenderAddress,
          }),
          mode: "no-cors",
        }
      );
    } catch (err) {
      console.log(err);
    }
  }

  const contractLens = new ethers.Contract(
    contractLensAddress,
    contractLensABI,
    providerLens
  );

  async function createFlow(
    newFollower,
    clientFromApi,
    txHash,
    followersFromApi
  ) {
    let followerForSteam = newFollower;
    if (followerForSteam === "0x5a84eC20F88e94dC3EB96cE77695997f8446a22D") {
      const tx = await providerLens.getTransaction(txHash);
      const iface = new ethers.utils.Interface([
        "function followFor(uint256[] profileIds,address[] mintFor,bytes[] datas)",
      ]);
      const result = iface.decodeFunctionData("followFor", tx.data);
      followerForSteam = result.mintFor[0];
    }
    const alreadyWithFlow = await followersFromApi.filter(
      (follower) => follower.followerAddress === followerForSteam
    );

    if (alreadyWithFlow.length !== 0) {
      console.log("Already with flow");
      return;
    }
    console.log("Creating steam to ", followerForSteam);

    const monthlyAmount = ethers.utils.parseEther(
      clientFromApi.amountFlowRate.toString()
    );
    const calculatedFlowRate = Math.round(monthlyAmount / 2592000);

    const createFlowOperation = fUSDCx.createFlowByOperator({
      sender: clientFromApi.flowSenderAddress,
      receiver: followerForSteam,
      flowRate: calculatedFlowRate,
    });
    await createFlowOperation.exec(signer);
    await postFollower(followerForSteam, clientFromApi.flowSenderAddress);
    console.log("Create flow done!, adding", followerForSteam, "to followers");
  }

  async function cleanSteams(
    newFollower,
    clientFromApi,
    txHash,
    followersFromApi
  ) {
    try {
      const contractLensNFT = new ethers.Contract(
        clientFromApi.followNftAddress,
        ERC721,
        providerLens
      );
      followersFromApi.map(async (follower) => {
        const nftInBalance = await contractLensNFT.balanceOf(
          follower.followerAddress
        );
        if (Number(nftInBalance.toString()) === 0) {
          console.log("Cleaning...", follower.followerAddress);
          const deleteFlowOperation = sf.cfaV1.deleteFlowByOperator({
            sender: clientFromApi.flowSenderAddress,
            receiver: follower.followerAddress,
            superToken: fUSDCx.address,
          });
          await deleteFlowOperation.exec(signer);
          console.log("Cleaned", follower.followerAddress);
          await deleteFollower(
            clientFromApi.flowSenderAddress,
            follower.followerAddress
          );
          console.log(
            "Delete flow done!, deleting",
            follower.followerAddress,
            "from followers"
          );
        }
        await createFlow(newFollower, clientFromApi, txHash, followersFromApi);
      });
    } catch (err) {
      console.log(err);
    }
  }

  async function steam(profileIds, newFollower, tx) {
    await getClients();
    const client = clientsArray.filter((_client) => {
      return _client.clientProfile === profileIds;
    });
    const followers = await getFollowers(client[0].flowSenderAddress);
    if (followers.length > 0) {
      console.log("Cleaning steams...");
      await cleanSteams(newFollower, client[0], tx.transactionHash, followers);
    } else {
      await createFlow(newFollower, client[0], tx.transactionHash, followers);
    }
  }

  await getClients();

  contractLens.on(
    "Followed",
    async (newFollower, profileIds, followModuleDatas, timestamp, tx) => {
      if (
        clientsArray.some((cli) => cli.clientProfile === profileIds[0]._hex)
      ) {
        await steam(profileIds[0]._hex, newFollower, tx);
      }
    }
  );
}

main().catch((error) => {
  console.error(error);
});
