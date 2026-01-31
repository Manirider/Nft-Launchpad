// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MyNFT is ERC721, ERC2981, Ownable {
    using Strings for uint256;

    string public baseURI;
    string public revealedURI;
    bool public isRevealed;

    uint256 public totalSupply;
    uint256 public maxSupply;

    uint256 public allowlistPrice = 0.05 ether;
    uint256 public publicPrice = 0.1 ether;

    bytes32 public merkleRoot;

    enum SaleState {
        Paused,
        Allowlist,
        Public
    }
    SaleState public saleState = SaleState.Paused;

    mapping(address => uint256) public allowlistMinted;
    mapping(address => uint256) public publicMinted;

    uint256 public constant MAX_MINT_PER_TX = 10;
    uint256 public constant MAX_PER_WALLET = 20;

    event SaleStateChanged(SaleState newState);
    event MerkleRootUpdated(bytes32 newRoot);
    event PriceUpdated(uint256 allowlistPrice, uint256 publicPrice);
    event BaseURIUpdated(string newBaseURI);
    event Revealed(string revealedURI);
    event NFTMinted(address indexed minter, uint256 quantity, SaleState state);
    event RoyaltyUpdated(address receiver, uint96 feeNumerator);

    constructor(
        string memory _baseURI,
        string memory _revealedURI,
        uint256 _maxSupply,
        address _royaltyReceiver,
        uint96 _royaltyFeeNumerator
    ) ERC721("GenerativeNFT", "GNFT") Ownable(msg.sender) {
        baseURI = _baseURI;
        revealedURI = _revealedURI;
        maxSupply = _maxSupply;
        _setDefaultRoyalty(_royaltyReceiver, _royaltyFeeNumerator);
    }

    function allowlistMint(
        bytes32[] calldata _proof,
        uint256 _quantity
    ) external payable {
        require(saleState == SaleState.Allowlist, "Allowlist sale not active");
        require(
            _quantity > 0 && _quantity <= MAX_MINT_PER_TX,
            "Invalid quantity"
        );

        uint256 newTotal = allowlistMinted[msg.sender] + _quantity;
        require(newTotal <= MAX_PER_WALLET, "Exceeds wallet limit");

        require(
            msg.value == allowlistPrice * _quantity,
            "Incorrect ETH amount"
        );

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(
            MerkleProof.verify(_proof, merkleRoot, leaf),
            "Invalid Merkle proof"
        );

        require(totalSupply + _quantity <= maxSupply, "Exceeds max supply");

        allowlistMinted[msg.sender] = newTotal;
        _mintTokens(msg.sender, _quantity);

        emit NFTMinted(msg.sender, _quantity, SaleState.Allowlist);
    }

    function publicMint(uint256 _quantity) external payable {
        require(saleState == SaleState.Public, "Public sale not active");
        require(
            _quantity > 0 && _quantity <= MAX_MINT_PER_TX,
            "Invalid quantity"
        );

        uint256 newTotal = publicMinted[msg.sender] + _quantity;
        require(newTotal <= MAX_PER_WALLET, "Exceeds wallet limit");

        require(msg.value == publicPrice * _quantity, "Incorrect ETH amount");
        require(totalSupply + _quantity <= maxSupply, "Exceeds max supply");

        publicMinted[msg.sender] = newTotal;
        _mintTokens(msg.sender, _quantity);

        emit NFTMinted(msg.sender, _quantity, SaleState.Public);
    }

    function _mintTokens(address _to, uint256 _quantity) internal {
        for (uint256 i = 0; i < _quantity; i++) {
            totalSupply++;
            _safeMint(_to, totalSupply);
        }
    }

    function setSaleState(SaleState _state) external onlyOwner {
        saleState = _state;
        emit SaleStateChanged(_state);
    }

    function setMerkleRoot(bytes32 _root) external onlyOwner {
        merkleRoot = _root;
        emit MerkleRootUpdated(_root);
    }

    function reveal(string memory _revealedURI) external onlyOwner {
        require(!isRevealed, "Already revealed");
        revealedURI = _revealedURI;
        isRevealed = true;
        emit Revealed(_revealedURI);
    }

    function setPrices(
        uint256 _allowlistPrice,
        uint256 _publicPrice
    ) external onlyOwner {
        allowlistPrice = _allowlistPrice;
        publicPrice = _publicPrice;
        emit PriceUpdated(_allowlistPrice, _publicPrice);
    }

    function setBaseURI(string memory _newBaseURI) external onlyOwner {
        baseURI = _newBaseURI;
        emit BaseURIUpdated(_newBaseURI);
    }

    function ownerMint(address _to, uint256 _quantity) external onlyOwner {
        require(totalSupply + _quantity <= maxSupply, "Exceeds max supply");
        _mintTokens(_to, _quantity);
        emit NFTMinted(_to, _quantity, SaleState.Paused);
    }

    function setRoyalty(
        address _receiver,
        uint96 _feeNumerator
    ) external onlyOwner {
        _setDefaultRoyalty(_receiver, _feeNumerator);
        emit RoyaltyUpdated(_receiver, _feeNumerator);
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    function tokenURI(
        uint256 _tokenId
    ) public view override returns (string memory) {
        _requireOwned(_tokenId);

        if (!isRevealed) {
            return baseURI;
        }

        return
            string(abi.encodePacked(revealedURI, _tokenId.toString(), ".json"));
    }

    function isAllowlisted(
        address _address,
        bytes32[] calldata _proof
    ) external view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(_address));
        return MerkleProof.verify(_proof, merkleRoot, leaf);
    }

    function supportsInterface(
        bytes4 _interfaceId
    ) public view override(ERC721, ERC2981) returns (bool) {
        return super.supportsInterface(_interfaceId);
    }

    receive() external payable {}
}
