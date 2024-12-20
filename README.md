# NOVA

![NOVA - AI-powered DeFi Hub for opBNB](https://github.com/0xinevitable/nova/raw/main/.github/assets/cover.png)

NOVA is the first on-chain autonomous decentralized hub built specifically for the opBNB ecosystem. It enables users to trade, stake, and manage their assets with AI-powered DeFi tools with a single dashboard.

## Useful Resources
Demo Video: https://youtu.be/IT4WqHqvcc4

Website URL: https://nova-plum-beta.vercel.app

## Background
- NOVA creates a unique ecosystem where experimenters and scientists can contribute their findings to build reputable on-chain data networks, earning sNOVA tokens for their contributions.
- One of DeFi's core challenges is the fragmentation of liquidity and information, which significantly impacts user onboarding. NOVA addresses this by creating a unified hub for all DeFi activities on opBNB.
- With the emergence of new chains and protocols, liquidity often becomes scattered across multiple platforms. NOVA aims to consolidate these fragmented resources into a single, efficient platform for the opBNB ecosystem.


## AI-Powered DeFi Dashboard

NOVA provides a comprehensive dashboard where users can connect their opBNB wallet to view their network assets, DeFi positions, and portfolio analytics powered by AI. Users can access all their positions across different protocols in one place, making portfolio management more efficient and intuitive.

### Experimental Data Network

- Scientists and researchers can contribute their experimental findings to our on-chain data network
- Contributors earn sNOVA tokens for verified and valuable data submissions
- This creates a decentralized knowledge base that enhances the ecosystem's overall value
- Implemented through our `Experimentor` contract at `0x345x283d04f6Dd5E05a93B551346f6`

### Proof of Humanity Integration

In the era of increasing Sybil attacks and artificial network manipulation, NOVA implements robust identity verification through [Gitcoin Passport](https://support.passport.xyz/passport-knowledge-base) integration. This system:

- Protects the experimental data network from manipulation
- Ensures the quality of scientific contributions
- Provides a trustworthiness metric for participants
- Helps in fair distribution of sNOVA rewards

The Humanity Score is calculated based on:
- Web2 verifications (GitHub, Discord, Twitter activity)
- Web3 credentials (NFT ownership, transaction history)
- Scientific contribution history
- Peer reviews and validations

This implementation helps maintain the integrity of our scientific data network while ensuring fair reward distribution to genuine contributors.

### One-Click Staking

![Stake](https://github.com/0xinevitable/nova/raw/main/.github/assets/stake.png)

Our staking mechanism is implemented through the StakedNova contract: `0x999A03C4c31790eB9Bf0e86F8c8439A0119ECE4f`

## Concentrated Liquidity DEX

![Positions](https://github.com/0xinevitable/nova/raw/main/.github/assets/positions.png)

### Mocked ERC20s

| Name | Symbol | Decimals | Address |
| --- | --- | --- | --- |
| Bitcoin | BTC | 8 | 0x31a721837d8964772142e1136B8878b6608549F2 |
| Binance Coin | BNB | 18 | 0xE03639b06Be343BC0898FAaA8463EcF6E5c14869 |
| Tether | USDT | 6 | 0xA3142213778e757B2AacAdCEe143B03AacFe7bE9 |
| USD Coin | USDC | 6 | 0x188E24768794fA1f126aB97ff5F06D4c5B4bda42 |
| Dai | DAI | 18 | 0x719C9B9CF384E73Ff7D149f237D5cb9004F0d97f |
| RWA Gold | GOLD | 18 | 0x57a2825c2e54F90b92580b3C690A24EAC55C1702 |

### Pools

| Name | Address | Fee |
| --- | --- | --- |
| BTC-BNB | 0x80Aa65dd6f1Cf24Ded2C183cF94d5854112FA69E | 500 |
| DAI-BNB | 0xEA7f07Fd60186600d8C5117E2858db5B3302214f | 500 |
| USDT-USDC | 0x85B1C77BA933190B01Cc31C48c2C84c8979e3E5d | 500 |
| USDC-GOLD | 0x6d6D2f29EF83cb617Dbfb498D52A5686672D3A62 | 500 |
| USDC-BNB | 0xdB220Cbb5aa3d94D775cF970d373Ab25721203b3 | 500 |
| USDT-BNB | 0x17f48F05112405321BCdfd0Dd8D981a60a9A56cD | 500 |
| USDT-GOLD | 0xdb209f1d54724917c5d9acdEBB98Fe5117cd1C49 | 500 |

### V3 (CLAMM)

Based on Uniswap V3([core](https://github.com/Uniswap/v3-core), [periphery](https://github.com/Uniswap/v3-periphery))'s concentrated liquidity implementation.

| Contract Name | Address |
| --- | --- |
| WBNB | 0x3ED1e9de39B7f84AF898bc1Be16109022ec9d1BB |
| UniswapV3Factory | 0x7fD493E18f52178485d34A1500a7Fa16e8c1a2b4 |
| SwapRouter | 0xaD13E1Ad9d52E2D3a6aed859A3A10213f81572C3 |
| NFTDescriptor | 0xA18D0dF34E4bf225B56Fc12f818eFA0B88a3Ce8A |
| NonfungibleTokenPositionDescriptor | 0x3Cf78BFe7a41ecc0BE7F5C7beaBB6974FBf46d9C |
| NonfungiblePositionManager | 0xB0cF94c1D32B57Fc05F8F199a8577EfcB3F62Ed8 |
| QuoterV2 | 0x283d04f6Dd5E05a93B551346f6621D1563628DC1 |

## 🛠️ Developer Documentation

### Build

```bash
# Contracts
cd contracts

# Deploy scripts
yarn workspace @nova/contracts hardhat run scripts/deploy-tokens.ts
yarn workspace @nova/contracts hardhat run scripts/deploy-univ3.ts
yarn workspace @nova/contracts hardhat run scripts/deploy-univ3-pools.ts
yarn workspace @nova/contracts hardhat run scripts/deploy-univ3-quoter.ts
yarn workspace @nova/contracts hardhat run scripts/deploy-experimentor.ts

# Frontend
yarn dev
yarn build

