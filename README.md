# Generative NFT Launchpad

A production-grade, dockerized NFT launchpad built with Solidity, Hardhat, Next.js, and Merkle Tree allowlist verification. This project implements a secure, gas-efficient, and testable architecture for launching generative NFT collections.

## Architecture

### Smart Contracts
- **MyNFT.sol**: Implements ERC721, ERC2981, and Ownable.
  - **Sale States**: Paused, Allowlist, Public.
  - **Merkle Tree**: efficient on-chain verification for allowlists without storing addresses.
  - **Reveal Mechanism**: Two-step metadata reveal (Base URI -> Revealed URI).
  - **Security**: Checks-Effects-Interactions pattern for withdrawals.

### Frontend
- **Next.js & TypeScript**: Type-safe, high-performance UI.
- **Wagmi & RainbowKit**: Robust wallet connection and state management.
- **Client-Side Merkle**: Rebuilds tree/proofs on client (secure for this demo, usually server-side for production secrecy).
- **Admin Panel**: Dashboard for owner to manage sale state and reveal.

### Tooling
- **Hardhat**: Development environment, testing, and deployment.
- **Docker**: Containerized environment for reproducible builds.

## Setup & Usage

### Prerequisites
- Docker & Docker Compose
- Node.js (local dev only)

### Quick Start (Docker)
Run the entire stack (Node + Frontend) with a single command:

```bash
docker-compose up --build
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Hardhat Node: [http://localhost:8545](http://localhost:8545)

### Local Development

1. **Install Dependencies**
   ```bash
   npm run install:all
   ```

2. **Start Hardhat Node**
   ```bash
   npm run node:start
   ```

3. **Deploy Contract**
   ```bash
   # In a new terminal
   npm run contract:deploy -- --network localhost
   ```

4. **Start Frontend**
   ```bash
   npm run frontend:dev
   ```

## Design Decisions

- **Merkle Tree**: chosen over mapping for Allowlist to minimize gas costs (O(1) storage vs O(N)).
- **SaleState Enum**: Explicit state management prevents race conditions between sales.
- **Use of `keccak256(abi.encodePacked(address))`**: Standard Solidity hashing pattern. JS side matches this using `ethers.solidityPackedKeccak256`.
- **Docker**: Multi-stage build for frontend ensures a lightweight production image.

## Testing

Run the full unit test suite:

```bash
npm run contract:test
```

## Security

- **Withdrawals**: Protected by `onlyOwner` and follows CEI pattern.
- **Reentrancy**: Not strictly needed for Minting (minting follows CEI via OZ), but good practice to be aware of.
- **Metadata**: BaseURI can be locked (in a future upgrade) or managed by owner.

## License
MIT
