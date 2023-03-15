import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { PromiseOrValue } from "../typechain-types/common";

describe("Lock", function () {
  async function deployFlowSenderFactory() {
    const [owner, otherAccount] = await ethers.getSigners();

    const flowSenderFactoryContract = await ethers.getContractFactory(
      "FlowSenderFactory"
    );
    const flowSenderFactory = await flowSenderFactoryContract.deploy();

    return { flowSenderFactory, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { flowSenderFactory, owner } = await loadFixture(
        deployFlowSenderFactory
      );

      expect(await flowSenderFactory.owner()).to.equal(owner.address);
    });
  });

  describe("Create FlowSender", function () {
    describe("Events", function () {
      it("Should emit an event on create flowSender", async function () {
        const { flowSenderFactory } = await loadFixture(
          deployFlowSenderFactory
        );
        await expect(
          flowSenderFactory.deployFlowSender(
            "0xa8ec796ee75b04af1223445c587588181ceb56cd",
            "2000000000000000000"
          )
        ).to.emit(flowSenderFactory, "ContractCreated");
      });
    });

    // describe("Transfers", function () {
    //   it("Should transfer the funds to the owner", async function () {
    //     const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
    //       deployOneYearLockFixture
    //     );

    //     await time.increaseTo(unlockTime);

    //     await expect(lock.withdraw()).to.changeEtherBalances(
    //       [owner, lock],
    //       [lockedAmount, -lockedAmount]
    //     );
    //   });
    // });
  });
});
