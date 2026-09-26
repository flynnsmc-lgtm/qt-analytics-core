# ARKM Intelligence Training Manual: Human Learning on On-Chain Forensics

**Document Reference**: `QT-ARKM-TRAIN-01`  
**Classification**: Proprietary Institutional Training / Human Learning Pack  
**Platform Reference**: [Arkham Intelligence](https://arkm.com) (`https://intel.arkm.com`)  
**Target Audience**: Financial Fraud Analysts, Asset Recovery Specialists, Compliance Officers, Legal Counsel

---

## Executive Summary

Arkham Intelligence is an on-chain deanonymization platform that matches blockchain addresses to real-world entities using algorithmic clustering, AI matching engines (*Ultra*), and crowdsourced intelligence. 

Traditional block explorers (such as Etherscan or Blockchain.com) display raw, disconnected cryptographic hashes (`0x71C...`, `bc1q...`). Arkham translates these raw hashes into an institutional financial surveillance graph, revealing **who** is transferring funds, **how much** they hold across multiple chains, and **where** capital is flowing in real time.

---

## Module 1: Understanding Labels vs. Entities vs. Addresses

The core mental model of Arkham rests on three distinct layers of data:

```
┌────────────────────────────────────────────────────────┐
│                   1. THE ENTITY                        │
│  The real-world firm, individual, or syndicate         │
│  e.g., "Wintermute", "Binance", "Solstice Crypto"      │
└───────────────────────────┬────────────────────────────┘
                            │ contains many
┌───────────────────────────▼────────────────────────────┐
│                    2. LABELS                           │
│  Descriptive tags applied to specific addresses        │
│  e.g., "Solstice: Hot Wallet 1", "Binance: Deposit 4" │
└───────────────────────────┬────────────────────────────┘
                            │ applies to
┌───────────────────────────▼────────────────────────────┐
│                   3. RAW ADDRESSES                     │
│  Cryptographic public keys on individual chains        │
│  e.g., 0x4838b106fce9647bdf1e7877bf73ce8b0bad5f97    │
└────────────────────────────────────────────────────────┘
```

### 1.1 What is an Address?
An **address** is an alphanumeric string representing an account or smart contract on a blockchain (e.g., Ethereum EVM `0x...`, Bitcoin `bc1...` or `1...`, Solana base58 `sol...`). By default, addresses are pseudonymous and have no inherent identity attached.

### 1.2 What is a Label?
A **label** is an analytical tag assigned to an address to describe its function or partial ownership.
- **Examples**:
  - `Uniswap V3: Router 2` (identifies the contract code)
  - `Wintermute: Binance Deposit` (identifies a specific off-ramp address)
  - `Tornado.Cash: 100 ETH Pool` (identifies an obfuscation contract)
- **Types of Labels in Arkham**:
  - **Ultra AI / System Labels**: Automatically detected by Arkham's heuristic clustering algorithm based on transaction patterns, gas fee sponsorship, and deposit consolidation.
  - **Curated / Analyst Verified Labels**: Manually inspected and confirmed by Arkham's intelligence team with cryptographic or public proof.
  - **Intel Exchange / Bounty Labels**: Sourced from community bounties where on-chain researchers submit evidence to earn ARKM rewards.

### 1.3 What is an Entity?
An **entity** is the overarching organization, company, government, or individual that owns or controls an entire network of addresses.
- Instead of tracking 500 separate wallet addresses for a market maker like Jump Trading or Solstice Crypto, an **Entity page** consolidates all associated addresses across Ethereum, Bitcoin, Solana, Arbitrum, Avalanche, and Polygon into a single financial balance sheet.
- **Entity Analytics Include**:
  - Aggregate Portfolio Value ($ USD equivalent across all chains)
  - Historical Balance Graph (over 24h, 7d, 30d, 1y, or all-time)
  - Top Counterparties (who they send to and receive from most)
  - Token Breakdown (percentage of portfolio in BTC, ETH, SOL, stables, or altcoins)
  - Complete cross-chain transaction ledger.

---

## Module 2: Currencies, Blockchains & Portfolio Accounting

Arkham indexes multiple blockchain ecosystems, normalizing different token standards into a unified USD financial ledger:

### 2.1 Supported Blockchain Networks
- **EVM Networks**: Ethereum, Arbitrum, Optimism, Base, Polygon, BNB Chain, Avalanche, Linea, Scroll, Mantle.
- **Non-EVM Networks**: Bitcoin (UTXO), Solana (SPL), Tron (TRC-20), TON.

### 2.2 Currency Categories in Arkham
1. **Native Layer-1 Assets**:
   - `BTC`, `ETH`, `SOL`, `BNB`, `AVAX`.
   - Used for primary value transfer and gas fees.
2. **Stablecoins**:
   - `USDT`, `USDC`, `DAI`, `FDUSD`, `USDE`.
   - Critical for forensic tracking because capital flowing into stablecoins indicates derisking, profit-taking, or preparation for OTC / CEX off-ramping.
3. **Wrapped & Bridged Tokens**:
   - `WBTC`, `WETH`, `cbBTC`, `stETH`.
   - Often used by institutional entities for DeFi collateral or liquidity farming.
4. **Governance & Utility Tokens**:
   - Liquid market tokens traded on decentralized or centralized venues.

### 2.3 How Arkham Calculates Portfolio Balances
- Real-time balances query the current token state across all indexed addresses in the entity cluster.
- USD values are calculated via volume-weighted average price (VWAP) feeds from CoinGecko, centralized exchanges, and on-chain oracle pools.
- **Forensic Caveat**: Always check for illiquid or "airdropped" spam tokens that might inflate a wallet's nominal balance. Arkham provides an option to filter out unverified/low-liquidity tokens.

---

## Module 3: Private Case Study — `solstice-crypto` Teardown

**Reference URL**: `https://arkm.com/labels/solstice-crypto` (or `https://intel.arkm.com/explorer/entity/solstice-crypto`)

### 3.1 Entity Classification
* **Entity Name**: Solstice Crypto
* **Category**: Proprietary Trading Desk / Crypto Market Maker / Liquidity Provider
* **Operational Profile**: High-frequency algorithmic trading, decentralized liquidity provisioning, cross-chain arbitrage, and institutional OTC settlement.

### 3.2 How to Conduct an ARKM Teardown of Solstice Crypto
When opening the Solstice Crypto entity on Arkham, follow this 5-step investigative workflow:

```
Step 1: Check Total Portfolio Value & Multi-Chain Distribution
   │
   ├─► Step 2: Inspect Historical Balance Graph (Look for sudden liquidations or capital calls)
   │
   ├─► Step 3: Filter Counterparty Roster (Identify top CEX off-ramps & DEX venues)
   │
   ├─► Step 4: Open the Flow Visualizer (Generate the directional capital graph)
   │
   └─► Step 5: Isolate Outflow Spikes (Identify destination wallets & peel chains)
```

#### Step 1: Portfolio Allocation Analysis
- Look at the **Portfolio** tab. Observe the ratio between **Liquid Stables (USDC/USDT)** vs. **L1 Assets (ETH/SOL/BTC)**.
- Desks maintaining >60% stablecoins are typically operating in capital-preservation or market-making mode; desks with high altcoin exposure are actively market-making or taking directional positions.

#### Step 2: Counterparty Breakdown
- Go to the **Counterparties** tab.
- Sort by **Total Volume (USD)**:
  - If the top counterparties are **Binance**, **Bybit**, **Coinbase**, or **OKX**, the entity is using centralized order books for delta-neutral hedging or off-ramping.
  - If the top counterparties are **Uniswap V3 Pools**, **Curve**, or **Raydium**, the entity is deploying automated market maker (AMM) liquidity scripts.
  - If interacting with other desks (e.g., **Wintermute**, **FalconX**, **Cumberland**), they are conducting institutional OTC block trades.

#### Step 3: Visualizer Mapping
- Click the **Visualizer** button at top right.
- Set the filter: `USD Value > $10,000` and `Timeframe: Last 30 Days`.
- **Interpreting the Graph**:
  - The central node represents **Solstice Crypto**.
  - Inbound green lines indicate capital injection from liquidity providers or exchange withdrawals.
  - Outbound red lines indicate capital distribution to operational hot wallets or institutional settlement desks.

---

## Module 4: 50 Core Entities & Labels Reference Directory

This curated directory contains 50 of the most significant on-chain entities for training and forensic reference, organized across 6 institutional categories:

### Category A: Market Makers & Algorithmic Trading Desks
| # | Entity Name | Arkham Slug | Primary Chains | Forensic & Analytical Significance |
|---|---|---|---|---|
| 1 | **Jump Trading** | `jump-trading` | ETH, SOL, BTC | Top tier HFT market maker; key participant in multi-chain DeFi and wormhole bridge arbitrage. |
| 2 | **Wintermute** | `wintermute` | ETH, ARB, OP, SOL | Primary algorithmic liquidity provider for major DEXs and CEXs; highly active in automated token market making. |
| 3 | **Cumberland (DRW)** | `cumberland` | BTC, ETH, SOL | One of the largest institutional OTC desks; frequently handles multi-million dollar institutional liquidity flows. |
| 4 | **Solstice Crypto** | `solstice-crypto` | ETH, SOL, Multi | Proprietary digital asset management, algorithmic liquidity provisioning, and institutional routing. |
| 5 | **GSR Markets** | `gsr` | ETH, SOL, BSC | Global market maker specializing in token launches, OTC options, and programmatic liquidity. |
| 6 | **DWF Labs** | `dwf-labs` | ETH, BNB, Multi | High-velocity investment and trading firm; known for active on-chain accumulation and exchange deposit patterns. |
| 7 | **Flow Traders** | `flow-traders` | ETH, BTC | Traditional proprietary trading firm active in crypto ETP market making and on-chain liquidity. |
| 8 | **Amber Group** | `amber-group` | ETH, BTC, Multi | Institutional digital asset desk providing liquidity, asset management, and structured products. |
| 9 | **B2C2** | `b2c2` | BTC, ETH | Premier institutional crypto liquidity provider owned by Japanese financial giant SBI Group. |
| 10 | **QCP Capital** | `qcp-capital` | BTC, ETH | Singapore-based crypto derivatives and options trading desk; key indicator of institutional macro sentiment. |

### Category B: Centralized Exchanges (CEX Reserves & Hot Wallets)
| # | Entity Name | Arkham Slug | Primary Chains | Forensic & Analytical Significance |
|---|---|---|---|---|
| 11 | **Binance** | `binance` | All major chains | World's largest exchange; primary destination for deposit interception, KYC freeze requests, and retail volume. |
| 12 | **Coinbase** | `coinbase` | BTC, ETH, Base, SOL | US regulated exchange; official custodian for major Bitcoin and Ethereum ETFs (BlackRock, etc.). |
| 13 | **Kraken** | `kraken` | BTC, ETH, Multi | Veteran exchange with dedicated compliance liaison desks and rigorous AML/SAR cooperation frameworks. |
| 14 | **OKX** | `okx` | ETH, BTC, SOL, Multi | Major global exchange with massive derivative liquidity and active multi-chain Web3 wallet routing. |
| 15 | **Bybit** | `bybit` | ETH, BTC, SOL, Multi | Massive perpetual futures venue; high counterparty volume with offshore market makers. |
| 16 | **Bitfinex** | `bitfinex` | BTC, ETH, TRON | Closely linked to Tether (USDT) treasury issuance and deep BTC order book liquidity. |
| 17 | **Robinhood** | `robinhood` | BTC, ETH, DOGE | Major US retail brokerage holding immense retail custody reserves of BTC, ETH, and meme tokens. |
| 18 | **Upbit** | `upbit` | BTC, ETH, Multi | Largest South Korean exchange; primary hub for the "Kimchi Premium" and regional altcoin volume. |
| 19 | **KuCoin** | `kucoin` | Multi-chain | International exchange with extensive altcoin listing inventory and high multi-hop deposit flow. |
| 20 | **Gate.io** | `gate-io` | Multi-chain | Massive long-tail token exchange with complex internal hot-wallet consolidation trees. |

### Category C: Sovereign & Government Seized Asset Holdings
| # | Entity Name | Arkham Slug | Primary Chains | Forensic & Analytical Significance |
|---|---|---|---|---|
| 21 | **US Government** | `united-states` | BTC, ETH, USDT | Holds hundreds of thousands of seized Bitcoins from Silk Road, Bitfinex hack, and James Zhong cases. |
| 22 | **German Government (BKA)**| `germany` | BTC | Held over 50,000 BTC seized from Movie2k; executed massive market-impact liquidations in mid-2024. |
| 23 | **UK Government (Met Police)**| `united-kingdom` | BTC | Holds seized crypto assets from criminal confiscation orders managed under Home Office protocols. |
| 24 | **Royal Government of Bhutan**| `bhutan` | BTC | Sovereign Bitcoin mining operations run through state holding company Druk Holding & Investments. |
| 25 | **El Salvador Treasury** | `el-salvador` | BTC | Sovereign national treasury purchasing 1 BTC daily, held in cold custody verified on-chain. |

### Category D: Venture Capital, Foundations & Liquid Treasuries
| # | Entity Name | Arkham Slug | Primary Chains | Forensic & Analytical Significance |
|---|---|---|---|---|
| 26 | **Paradigm** | `paradigm` | ETH | Premier crypto-native venture capital fund; large-scale holdings in Ethereum and DeFi protocol governance. |
| 27 | **a16z Crypto** | `a16z` | ETH, OP, Base | Venture capital powerhouse; major validator node operator and governance participant across top protocols. |
| 28 | **Pantera Capital** | `pantera-capital` | BTC, ETH, Multi | Oldest US digital asset fund; manages institutional venture and liquid token portfolios. |
| 29 | **Dragonfly Capital** | `dragonfly` | ETH, Multi | Global crypto venture fund active in cross-border decentralized finance infrastructure. |
| 30 | **Polychain Capital** | `polychain-capital` | BTC, ETH, Multi | Major early-stage crypto venture fund with extensive staking and governance validator footprints. |
| 31 | **Galaxy Digital** | `galaxy-digital` | BTC, ETH, Multi | Mike Novogratz's digital asset financial services firm; acts as liquidator for major estate bankruptcies (e.g. FTX). |
| 32 | **Digital Currency Group** | `dcg` | BTC, ETH | Parent conglomerate of Foundry, Genesis, and Grayscale. |
| 33 | **Ethereum Foundation** | `ethereum-foundation` | ETH | Non-profit stewarding Ethereum core development; periodically sells ETH for operational budget runway. |
| 34 | **Arbitrum Foundation** | `arbitrum` | ARB, ETH | Governance treasury managing ecosystem grants and sequencer revenue allocation. |
| 35 | **Optimism Foundation** | `optimism` | OP, ETH | Collective treasury powering the Superchain ecosystem and retroactive public goods funding. |

### Category E: DeFi Protocols, Yield Engines & Staking
| # | Entity Name | Arkham Slug | Primary Chains | Forensic & Analytical Significance |
|---|---|---|---|---|
| 36 | **Uniswap** | `uniswap` | Multi-chain EVM | Decentralized trading benchmark; smart contracts act as primary liquidity hub for all automated token routing. |
| 37 | **Aave** | `aave` | Multi-chain EVM | Largest decentralized money market; critical for tracking flash loans, liquidations, and borrow leverage. |
| 38 | **Sky (formerly MakerDAO)** | `makerdao` | ETH | Decentralized issuer of USDS/DAI; holds vast collateral in ETH, staked ETH, and Real World Assets (US Treasuries). |
| 39 | **Lido** | `lido` | ETH | Largest liquid staking protocol (`stETH`); controls ~28% of all staked Ethereum validator consensus. |
| 40 | **Curve Finance** | `curve` | Multi-chain EVM | Deep liquidity AMM for pegged assets (stables, LSTs); critical for monitoring peg stability and systemic stress. |
| 41 | **EigenLayer** | `eigenlayer` | ETH | Restaking protocol benchmark; tracks re-delegated ETH security pools across active AVSs. |
| 42 | **Pendle Finance** | `pendle` | ETH, ARB | Yield tokenization protocol; massive volume hub for point farming and interest rate swaps. |
| 43 | **Ethena** | `ethena` | ETH | Synthetic dollar protocol (`USDe`); manages multi-billion dollar basis trade hedging positions on CEXs. |
| 44 | **Tether Treasury** | `tether` | TRON, ETH, Multi | Multi-chain issuer of USDT; mints and burns billions in response to institutional exchange demand. |
| 45 | **Circle** | `circle` | ETH, SOL, Base, Multi | Regulated issuer of USDC; tracks direct mint/redemption rails with US banking institutions. |

### Category F: Exploiters, Mixers & High-Risk Threat Actors
| # | Entity Name | Arkham Slug | Primary Chains | Forensic & Analytical Significance |
|---|---|---|---|---|
| 46 | **Lazarus Group** | `lazarus-group` | BTC, ETH, Multi | State-sponsored cybercrime syndicate responsible for Ronin, Coincheck, and Bybit exploits. Uses complex peel chains. |
| 47 | **Tornado Cash** | `tornado-cash` | ETH, BSC, ARB | Decentralized zero-knowledge mixer; primary target of OFAC sanctions and compliance taint screening. |
| 48 | **Railgun** | `railgun` | ETH, BSC, Polygon | Privacy system utilizing zero-knowledge proofs for DeFi transactions; increasingly scrutinized by fraud investigators. |
| 49 | **Euler Finance Exploiter** | `euler-exploiter` | ETH | Perpetrator of the $200M Euler flash loan exploit; notable for returning funds after negotiations. |
| 50 | **WazirX Hacker** | `wazirx-exploiter` | ETH | Exploiter responsible for the $235M Indian exchange breach in 2024; textbook case study in multi-stage asset laundering. |

---

## Module 5: Investigation & Query Cheat Sheet

### 5.1 Key Filters for Forensic Analysis
When investigating an address or entity on Arkham:

1. **Filter by Timeframe**:
   - `1H` / `24H`: Immediate incident response for live exploit triage.
   - `7D` / `30D`: Tracing capital accumulation, peel chains, and off-ramp schedules.
2. **Filter by Value**:
   - Set minimum threshold (e.g., `USD Value > $5,000`) to eliminate dust attacks, spam transfers, and gas rebates.
3. **Filter by Counterparty**:
   - Specify target exchange entity (e.g. `Binance`) to find all direct deposit tx hashes for Law Enforcement / Freeze Notices.
4. **Visualizer Flow Analysis**:
   - Right-click any node $\rightarrow$ Select **Expand** to see 2nd and 3rd order hops.
   - Group by Entity to collapse 50 child deposit addresses into a single institutional node.

### 5.2 SAR-Ready Evidence Formatting Checklist
For every case dossier delivered to financial institutions or counsel:
- [ ] **Target Entity / Suspect Name**: Identified using Arkham label verification.
- [ ] **Root Infiltration Tx Hash**: First unauthorized transaction draining the victim wallet.
- [ ] **Intermediary Peel Chain Addresses**: List of temporary hop wallets with timestamps.
- [ ] **Terminal Exchange Deposit Address**: The CEX deposit wallet where funds stopped moving.
- [ ] **ARKM Visualizer Export**: Vector PNG/SVG diagram illustrating the linear flow of funds.
- [ ] **SLA & Date Stamp**: Verified under standard 24-hour turnaround protocols.

### 5.3 Interactive Backoffice Workflow & Gap Analysis Tool
For visual training and operational process mapping:
- **Interactive Drag-and-Drop Canvas**: Access the live backoffice tool at [http://localhost:3000/workflow_builder.html](http://localhost:3000/workflow_builder.html) to rearrange process steps, create directional connecting lines, and toggle amber gap highlights.
- **Workflow Blueprints & Mermaid Diagrams**: Review the complete process trees in [Agent Desk/TRAINING/ARKM_AGENT_WORKFLOW_DIAGRAMS.md](file:///c:/Users/44790/.gemini/antigravity-ide/scratch/chi-physics-core/Agent%20Desk/TRAINING/ARKM_AGENT_WORKFLOW_DIAGRAMS.md).

---

*Manual maintained by QT Analytics Forensics & Training Desk • Document ID: `QT-ARKM-TRAIN-01`*
