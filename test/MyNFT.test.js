const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

describe("MyNFT", function () {
  let MyNFT;
  let myNFT;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  let merkleTree;
  let root;

  const MAX_SUPPLY = 100;
  const BASE_URI = "ipfs://QmBase/";
  const REVEALED_URI = "ipfs://QmRevealed/";
  const ROYALTY_FEE = 500; // 5%

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Setup Merkle Tree
    const allowlist = [owner.address, addr1.address];
    const leaves = allowlist.map(addr => ethers.solidityPackedKeccak256(["address"], [addr]));
    const leafBuffers = leaves.map(x => Buffer.from(x.replace(/^0x/, ''), 'hex'));

    merkleTree = new MerkleTree(leafBuffers, keccak256, { sortPairs: true });
    root = merkleTree.getHexRoot();

    MyNFT = await ethers.getContractFactory("MyNFT");
    myNFT = await MyNFT.deploy(
      BASE_URI,
      REVEALED_URI,
      MAX_SUPPLY,
      owner.address,
      ROYALTY_FEE
    );
    await myNFT.waitForDeployment(); // Ethers v6
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await myNFT.owner()).to.equal(owner.address);
    });

    it("Should set the right max supply", async function () {
      expect(await myNFT.maxSupply()).to.equal(MAX_SUPPLY);
    });

    it("Should start in Paused state", async function () {
      expect(await myNFT.saleState()).to.equal(0); // Paused
    });
  });

  describe("Sale State", function () {
    it("Should allow owner to change sale state", async function () {
      await myNFT.setSaleState(1); // Allowlist
      expect(await myNFT.saleState()).to.equal(1);
    });

    it("Should not allow non-owner to change sale state", async function () {
      await expect(myNFT.connect(addr1).setSaleState(1)).to.be.revertedWithCustomError(myNFT, "OwnableUnauthorizedAccount");
    });
  });

  describe("Allowlist Mint", function () {
    beforeEach(async function () {
      await myNFT.setMerkleRoot(root);
      await myNFT.setSaleState(1); // Allowlist
    });

    it("Should mint if on allowlist", async function () {
      const leaf = ethers.solidityPackedKeccak256(["address"], [addr1.address]);
      const leafBuffer = Buffer.from(leaf.replace(/^0x/, ''), 'hex');
      const proof = merkleTree.getHexProof(leafBuffer);

      const price = await myNFT.allowlistPrice();

      await expect(myNFT.connect(addr1).allowlistMint(proof, 1, { value: price }))
        .to.emit(myNFT, "NFTMinted")
        .withArgs(addr1.address, 1, 1);

      expect(await myNFT.balanceOf(addr1.address)).to.equal(1);
    });

    it("Should fail if proof is invalid", async function () {
      const leaf = ethers.solidityPackedKeccak256(["address"], [addr2.address]); // Not on list
      const leafBuffer = Buffer.from(leaf.replace(/^0x/, ''), 'hex');
      const proof = merkleTree.getHexProof(leafBuffer); // Empty or invalid for addr2 if strict, but let's assume we try to use addr2's proof which doesn't exist

      const price = await myNFT.allowlistPrice();

      await expect(myNFT.connect(addr2).allowlistMint([], 1, { value: price }))
        .to.be.revertedWith("Invalid Merkle proof");
    });

    it("Should fail if sale is not Allowlist", async function () {
      await myNFT.setSaleState(0); // Paused
      const leaf = ethers.solidityPackedKeccak256(["address"], [addr1.address]);
      const leafBuffer = Buffer.from(leaf.replace(/^0x/, ''), 'hex');
      const proof = merkleTree.getHexProof(leafBuffer);
      const price = await myNFT.allowlistPrice();

      await expect(myNFT.connect(addr1).allowlistMint(proof, 1, { value: price }))
        .to.be.revertedWith("Allowlist sale not active");
    });
  });

  describe("Public Mint", function () {
    beforeEach(async function () {
      await myNFT.setSaleState(2); // Public
    });

    it("Should mint correctly", async function () {
      const price = await myNFT.publicPrice();
      await myNFT.connect(addr2).publicMint(1, { value: price });
      expect(await myNFT.balanceOf(addr2.address)).to.equal(1);
    });

    it("Should fail if insufficient funds", async function () {
      const price = await myNFT.publicPrice(); // returns BigInt
      // Send less
      await expect(myNFT.connect(addr2).publicMint(1, { value: price - BigInt(1) }))
        .to.be.revertedWith("Incorrect ETH amount");
    });
  });

  describe("Reveal", function () {
    it("Should return baseURI when not revealed", async function () {
      await myNFT.ownerMint(owner.address, 1);
      const uri = await myNFT.tokenURI(1);
      // Unrevealed URI is typically static for all tokens (e.g., hidden.json)
      expect(uri).to.equal(BASE_URI);
    });

    it("Should return revealedURI when revealed", async function () {
      await myNFT.ownerMint(owner.address, 1);
      await myNFT.reveal(REVEALED_URI);
      const uri = await myNFT.tokenURI(1);
      expect(uri).to.equal(REVEALED_URI + "1.json");
    });
  });
});
