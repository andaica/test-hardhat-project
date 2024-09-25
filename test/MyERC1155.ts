import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ZeroAddress } from "ethers";
import { ethers } from "hardhat";

describe("MyERC1155", function () {
  const CollectionName = "My 1155 Collection";
  const CollectionSymbol = "my15";
  const DefaultTokenURI =
    "ipfs://QmakAFezCU2BTe3D5VsMBkMx6Y1U4RRCnpZGWDTGyKYyKB";

  const _INTERFACE_ID_ERC165 = "0x01ffc9a7";
  const _INTERFACE_ID_ERC1155 = "0xd9b67a26";
  const _INTERFACE_ID_ERC1155MetadataURI = "0x0e89341c";
  const _ERC721_RECEIVED = "0x150b7a02";

  async function deployContract() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const factory = await ethers.getContractFactory("MyMultiToken");
    const deploy = await factory.deploy(CollectionName, CollectionSymbol);
    const myCollection = await deploy.waitForDeployment();

    console.log(
      "contract created: ",
      await myCollection.name(),
      await myCollection.symbol(),
      myCollection.target
    );

    // Fixtures can return anything you consider useful for your tests
    return { myCollection, owner, addr1, addr2 };
  }

  describe("Initialization", function () {
    it("Should set right information", async function () {
      const { myCollection, owner } = await loadFixture(deployContract);

      expect(await myCollection.name()).to.equal(CollectionName);
      expect(await myCollection.symbol()).to.equal(CollectionSymbol);
    });
  });

  describe("SupportsInterface", function () {
    it("Should return right", async function () {
      const { myCollection } = await loadFixture(deployContract);

      let isSupport = await myCollection.supportsInterface(
        _INTERFACE_ID_ERC165
      );
      expect(isSupport).to.equal(true);

      isSupport = await myCollection.supportsInterface(_INTERFACE_ID_ERC1155);
      expect(isSupport).to.equal(true);

      isSupport = await myCollection.supportsInterface(
        _INTERFACE_ID_ERC1155MetadataURI
      );
      expect(isSupport).to.equal(true);

      isSupport = await myCollection.supportsInterface(_ERC721_RECEIVED);
      expect(isSupport).to.equal(false);
    });
  });

  describe("TokenURI", function () {
    it("Token not exist", async function () {
      const { myCollection } = await loadFixture(deployContract);
      expect(await myCollection.uri(0)).to.equal("");
    });

    it("Should set right token uri", async function () {
      const { myCollection, owner } = await loadFixture(deployContract);
      let mint = await myCollection.mintWithUri(0, 100, DefaultTokenURI);
      expect(await myCollection.uri(0)).to.equal(DefaultTokenURI);

      await expect(mint)
        .to.emit(myCollection, "URI")
        .withArgs(DefaultTokenURI, 0);
    });
  });

  describe("Mint", function () {
    it("Should mint success", async function () {
      const { myCollection, owner } = await loadFixture(deployContract);
      let mint = await myCollection.mint(0, 100, "0x");
      expect(await myCollection.balanceOf(owner, 0)).to.equal(100);

      await expect(mint)
        .to.emit(myCollection, "TransferSingle")
        .withArgs(owner.address, ZeroAddress, owner.address, 0, 100);
    });
  });

  describe("BatchMint", function () {
    it("Error if data not valid", async function () {
      const { myCollection } = await loadFixture(deployContract);
      let mint = myCollection.batchMint([0, 1, 2], [], "0x");

      await expect(mint).to.be.revertedWith("ids length != values length");
    });

    it("Should mint success", async function () {
      const { myCollection, owner } = await loadFixture(deployContract);
      let mint = await myCollection.batchMint([0, 1, 2], [100, 200, 300], "0x");
      expect(await myCollection.balanceOf(owner, 0)).to.equal(100);
      expect(await myCollection.balanceOf(owner, 1)).to.equal(200);
      expect(await myCollection.balanceOf(owner, 2)).to.equal(300);

      await expect(mint)
        .to.emit(myCollection, "TransferBatch")
        .withArgs(
          owner.address,
          ZeroAddress,
          owner.address,
          [0, 1, 2],
          [100, 200, 300]
        );
    });
  });

  describe("Burn", function () {
    it("Error if value not enough", async function () {
      const { myCollection } = await loadFixture(deployContract);
      let burn = myCollection.burn(0, 100);
      await expect(burn).to.be.revertedWith("token value not enough");

      await myCollection.mint(0, 100, "0x");
      burn = myCollection.burn(0, 200);
      await expect(burn).to.be.revertedWith("token value not enough");
    });

    it("Should burn success", async function () {
      const { myCollection, owner } = await loadFixture(deployContract);
      await myCollection.mint(0, 100, "0x");

      let burn = await myCollection.burn(0, 50);
      expect(await myCollection.balanceOf(owner, 0)).to.equal(50);

      burn = await myCollection.burn(0, 50);
      expect(await myCollection.balanceOf(owner, 0)).to.equal(0);

      await expect(burn)
        .to.emit(myCollection, "TransferSingle")
        .withArgs(owner.address, owner.address, ZeroAddress, 0, 50);
    });
  });

  describe("BatchBurn", function () {
    it("Error if data not valid", async function () {
      const { myCollection } = await loadFixture(deployContract);
      let burn = myCollection.batchBurn([], [100, 200, 300]);
      await expect(burn).to.be.revertedWith("ids length != values length");
    });

    it("Error if value not enough", async function () {
      const { myCollection } = await loadFixture(deployContract);
      let burn = myCollection.batchBurn([0, 1], [100, 200]);
      await expect(burn).to.be.revertedWith("token value not enough");

      await myCollection.mint(0, 100, "0x");
      burn = myCollection.batchBurn([0, 1], [100, 200]);
      await expect(burn).to.be.revertedWith("token value not enough");
    });

    it("Should burn success", async function () {
      const { myCollection, owner } = await loadFixture(deployContract);
      await myCollection.batchMint([0, 1, 2], [100, 200, 300], "0x");

      let burn = await myCollection.batchBurn([0, 1], [100, 100]);
      expect(await myCollection.balanceOf(owner, 0)).to.equal(0);
      expect(await myCollection.balanceOf(owner, 1)).to.equal(100);

      burn = await myCollection.batchBurn([1, 2], [100, 200]);
      expect(await myCollection.balanceOf(owner, 1)).to.equal(0);
      expect(await myCollection.balanceOf(owner, 2)).to.equal(100);

      await expect(burn)
        .to.emit(myCollection, "TransferBatch")
        .withArgs(
          owner.address,
          owner.address,
          ZeroAddress,
          [1, 2],
          [100, 200]
        );
    });
  });

  describe("BalanceOfBatch", function () {
    it("Error if data invalid", async function () {
      const { myCollection, addr1, addr2 } = await loadFixture(deployContract);
      let balanceOfBatch = myCollection.balanceOfBatch(
        [addr1, addr1, addr2],
        [0, 1]
      );
      await expect(balanceOfBatch).to.be.revertedWith(
        "owners length != ids length"
      );
    });

    it("Should balance of batch success", async function () {
      const { myCollection, owner, addr1 } = await loadFixture(deployContract);
      await myCollection.batchMint([0, 1], [100, 200], "0x");
      await myCollection.connect(addr1).batchMint([1, 2], [300, 400], "0x");

      let balanceOfBatch = await myCollection.balanceOfBatch(
        [owner, owner, addr1, addr1],
        [0, 1, 1, 2]
      );

      const resultString = JSON.stringify([100, 200, 300, 400]);
      expect(
        JSON.stringify(balanceOfBatch.map((item) => parseInt(item.toString())))
      ).to.equal(resultString);
    });
  });

  describe("setApprovalForAll", function () {
    it("Should set right approve all", async function () {
      const { myCollection, owner, addr1 } = await loadFixture(deployContract);
      let approveAll = await myCollection.setApprovalForAll(addr1, true);
      expect(await myCollection.isApprovedForAll(owner, addr1)).to.equal(true);

      await expect(approveAll)
        .to.emit(myCollection, "ApprovalForAll")
        .withArgs(owner.address, addr1.address, true);
    });
  });

  describe("SafeTransferFrom", function () {
    it("Error if not owner", async function () {
      const { myCollection, owner, addr1, addr2 } = await loadFixture(
        deployContract
      );
      await myCollection.mint(0, 100, "0x");

      let transfer = myCollection.safeTransferFrom(addr1, addr2, 0, 50, "0x");
      await expect(transfer).to.be.revertedWith("not approved");

      transfer = myCollection
        .connect(addr1)
        .safeTransferFrom(owner, addr2, 0, 50, "0x");
      await expect(transfer).to.be.revertedWith("not approved");
    });

    it("Error if transfer to zero address", async function () {
      const { myCollection, owner } = await loadFixture(deployContract);
      await myCollection.mint(0, 100, "0x");

      let transfer = myCollection.safeTransferFrom(
        owner,
        ZeroAddress,
        0,
        50,
        "0x"
      );
      await expect(transfer).to.be.revertedWith("to = 0 address");
    });

    it("Should transfer right", async function () {
      const { myCollection, owner, addr1 } = await loadFixture(deployContract);
      await myCollection.mint(0, 100, "0x");

      let transfer = await myCollection.safeTransferFrom(
        owner,
        addr1,
        0,
        50,
        "0x"
      );

      expect(await myCollection.balanceOf(owner, 0)).to.equal(50);
      expect(await myCollection.balanceOf(addr1, 0)).to.equal(50);

      await expect(transfer)
        .to.emit(myCollection, "TransferSingle")
        .withArgs(owner.address, owner.address, addr1.address, 0, 50);
    });

    it("Should transfer right with approve", async function () {
      const { myCollection, owner, addr1, addr2 } = await loadFixture(
        deployContract
      );
      await myCollection.mint(0, 100, "0x");

      await myCollection.setApprovalForAll(addr1, true);
      await myCollection
        .connect(addr1)
        .safeTransferFrom(owner, addr1, 0, 50, "0x");
      expect(await myCollection.balanceOf(owner, 0)).to.equal(50);
      expect(await myCollection.balanceOf(addr1, 0)).to.equal(50);

      await myCollection
        .connect(addr1)
        .safeTransferFrom(owner, addr2, 0, 50, "0x");
      expect(await myCollection.balanceOf(owner, 0)).to.equal(0);
      expect(await myCollection.balanceOf(addr2, 0)).to.equal(50);
    });

    it("Error if not ERC1155TokenReceiver", async function () {
      const { myCollection, owner } = await loadFixture(deployContract);
      await myCollection.mint(0, 100, "0x");

      const erc20Factory = await ethers.getContractFactory("ERC20");
      const deploy = await erc20Factory.deploy("Test", "test", 18);
      const myToken = await deploy.waitForDeployment();
      const myTokenContract = await myToken.getAddress();

      let transfer = myCollection.safeTransferFrom(
        owner,
        myTokenContract,
        0,
        50,
        "0x"
      );
      await expect(transfer).to.be.revertedWithoutReason();
    });

    it("Success if is not contract", async function () {
      const { myCollection, owner, addr1 } = await loadFixture(deployContract);
      await myCollection.mint(0, 100, "0x");
      await myCollection.safeTransferFrom(owner, addr1, 0, 50, "0x");
      expect(await myCollection.balanceOf(addr1, 0)).to.equal(50);
    });

    it("Success if is ERC1155TokenReceiver", async function () {
      const { myCollection, owner } = await loadFixture(deployContract);
      await myCollection.mint(0, 100, "0x");

      const mockERC1155Receiver = await ethers.deployContract(
        "MockERC1155Receiver"
      );
      const myContract = await mockERC1155Receiver.getAddress();

      await myCollection.safeTransferFrom(owner, myContract, 0, 50, "0x");
      expect(await myCollection.balanceOf(myContract, 0)).to.equal(50);
    });
  });

  describe("SafeBatchTransferFrom", function () {
    it("Error if not owner", async function () {
      const { myCollection, owner, addr1, addr2 } = await loadFixture(
        deployContract
      );
      await myCollection.mint(0, 100, "0x");

      let transfer = myCollection.safeBatchTransferFrom(
        addr1,
        addr2,
        [0],
        [50],
        "0x"
      );
      await expect(transfer).to.be.revertedWith("not approved");

      transfer = myCollection
        .connect(addr1)
        .safeBatchTransferFrom(owner, addr2, [0], [50], "0x");
      await expect(transfer).to.be.revertedWith("not approved");
    });

    it("Error if transfer to zero address", async function () {
      const { myCollection, owner } = await loadFixture(deployContract);
      await myCollection.mint(0, 100, "0x");

      let transfer = myCollection.safeBatchTransferFrom(
        owner,
        ZeroAddress,
        [0],
        [50],
        "0x"
      );
      await expect(transfer).to.be.revertedWith("to = 0 address");
    });

    it("Error if data not valid", async function () {
      const { myCollection, owner, addr1 } = await loadFixture(deployContract);
      let transfer = myCollection.safeBatchTransferFrom(
        owner,
        addr1,
        [0, 1, 2],
        [50],
        "0x"
      );
      await expect(transfer).to.be.revertedWith("ids length != values length");
    });

    it("Should transfer right", async function () {
      const { myCollection, owner, addr1 } = await loadFixture(deployContract);
      await myCollection.mint(0, 100, "0x");

      let transfer = await myCollection.safeBatchTransferFrom(
        owner,
        addr1,
        [0, 1],
        [50, 0],
        "0x"
      );

      expect(await myCollection.balanceOf(owner, 0)).to.equal(50);
      expect(await myCollection.balanceOf(addr1, 0)).to.equal(50);
      expect(await myCollection.balanceOf(addr1, 1)).to.equal(0);

      await expect(transfer)
        .to.emit(myCollection, "TransferBatch")
        .withArgs(owner.address, owner.address, addr1.address, [0, 1], [50, 0]);
    });

    it("Should transfer right with approve", async function () {
      const { myCollection, owner, addr1, addr2 } = await loadFixture(
        deployContract
      );
      await myCollection.batchMint([0, 1], [100, 200], "0x");

      await myCollection.setApprovalForAll(addr1, true);
      await myCollection
        .connect(addr1)
        .safeBatchTransferFrom(owner, addr1, [0, 1], [50, 50], "0x");
      expect(await myCollection.balanceOf(owner, 0)).to.equal(50);
      expect(await myCollection.balanceOf(addr1, 0)).to.equal(50);
      expect(await myCollection.balanceOf(owner, 1)).to.equal(150);
      expect(await myCollection.balanceOf(addr1, 1)).to.equal(50);

      await myCollection
        .connect(addr1)
        .safeBatchTransferFrom(owner, addr2, [1], [50], "0x");
      expect(await myCollection.balanceOf(owner, 1)).to.equal(100);
      expect(await myCollection.balanceOf(addr2, 1)).to.equal(50);
    });

    it("Error if not ERC1155TokenReceiver", async function () {
      const { myCollection, owner } = await loadFixture(deployContract);
      await myCollection.mint(0, 100, "0x");

      const erc20Factory = await ethers.getContractFactory("ERC20");
      const deploy = await erc20Factory.deploy("Test", "test", 18);
      const myToken = await deploy.waitForDeployment();
      const myTokenContract = await myToken.getAddress();

      let transfer = myCollection.safeBatchTransferFrom(
        owner,
        myTokenContract,
        [0],
        [50],
        "0x"
      );
      await expect(transfer).to.be.revertedWithoutReason();
    });

    it("Success if is not contract", async function () {
      const { myCollection, owner, addr1 } = await loadFixture(deployContract);
      await myCollection.mint(0, 100, "0x");
      await myCollection.safeBatchTransferFrom(owner, addr1, [0], [50], "0x");
      expect(await myCollection.balanceOf(addr1, 0)).to.equal(50);
    });

    it("Success if is ERC1155TokenReceiver", async function () {
      const { myCollection, owner } = await loadFixture(deployContract);
      await myCollection.mint(0, 100, "0x");

      const mockERC1155Receiver = await ethers.deployContract(
        "MockERC1155Receiver"
      );
      const myContract = await mockERC1155Receiver.getAddress();

      await myCollection.safeBatchTransferFrom(
        owner,
        myContract,
        [0],
        [50],
        "0x"
      );
      expect(await myCollection.balanceOf(myContract, 0)).to.equal(50);
    });
  });
});
