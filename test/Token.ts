import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Token", function () {
  async function deployTokenContract() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const hardhatToken = await ethers.deployContract("Token");
    // Fixtures can return anything you consider useful for your tests
    return { hardhatToken, owner, addr1, addr2 };
  }

  describe("Initialization", function () {
    it("Should set right owner", async function () {
      const { hardhatToken, owner } = await loadFixture(deployTokenContract);
      expect(await hardhatToken.owner()).to.equal(owner.address);
      expect(await hardhatToken.balanceOf(owner)).to.equal(
        await hardhatToken.totalSupply()
      );
    });
  });

  describe("Transactions", function () {
    it("Error if balances of sender not found", async function () {
      const { hardhatToken, addr2, addr1 } = await loadFixture(
        deployTokenContract
      );
      const transfer = hardhatToken.connect(addr1).transfer(addr2, 100);
      await expect(transfer).to.be.revertedWith("Not enough tokens");
    });

    it("Should set right balances after transfer", async function () {
      const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
        deployTokenContract
      );

      await hardhatToken.transfer(addr1, 100);
      await hardhatToken.connect(addr1).transfer(addr2, 50);

      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        (await hardhatToken.totalSupply()) - BigInt(100)
      );

      expect(await hardhatToken.balanceOf(addr1)).to.equal(50);

      expect(await hardhatToken.balanceOf(addr2)).to.equal(50);
    });

    it("Should emit event", async function () {
      const { hardhatToken, owner, addr1 } = await loadFixture(
        deployTokenContract
      );

      const transfer = hardhatToken.transfer(addr1, 100);
      await expect(transfer)
        .to.emit(hardhatToken, "Transfer")
        .withArgs(owner.address, addr1.address, 100);
    });
  });
});
