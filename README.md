# Solana Smart Transaction Stack

This is a custom transaction stack built for the Superteam Nigeria Advanced Infrastructure Bounty. Instead of just hoping transactions go through, this system is built to survive actual network chaos—handling backpressure, dropped bundles, and validator slot anomalies autonomously.

---

## 🏗️ System Architecture

The core idea here is decoupling standard transaction execution from a smart recovery agent. When things break, the system doesn't just blindly loop a retry; it figures out why it failed and adjusts.

### Key Components
* **Stream Observer (Yellowstone gRPC):** Standard RPC polling is too slow. This connects directly to a gRPC stream to pull live slot updates, blockhash data, and leader schedules with minimal latency.
* **Bundle Engine:** Puts together native Jito bundles, signs them, and calculates dynamic Jito tips based on real-time network conditions rather than using hardcoded values.
* **State Tracker:** Watches the exact lifecycle of the bundle across `Processed`, `Confirmed`, and `Finalized` commitment levels, logging the actual latency metrics.
* **AI Recovery Agent:** An isolated module that catches failures, analyzes the error strings, and decides exactly how to adjust the payload to force it through on the next attempt.

### How It Handles Failures (Fault Injection)
The stack intentionally catches edge cases like `BlockhashNotFound` and skipped Jito leaders. When a transaction drops, the AI agent takes over. It purges the dead blockhash, fetches a fresh one, bumps the tip to gain auction priority, and commands the engine to resubmit without manual intervention.

---

## 🧠 Operational Questions

### Q1: What does the delta between `processed_at` and `confirmed_at` tell you about network health at the time of submission?
It basically acts as a real-time health check for network consensus. A transaction is "processed" when it hits a block, but it is only "confirmed" once a supermajority (66%+) of validators vote on it. If the time delta between these two stages is tiny, the network is healthy and votes are propagating across the gossip protocol quickly. If the delta is massive, the network is congested, experiencing fork churn, or validators are struggling to coordinate the necessary votes.

### Q2: Why should you never use finalized commitment when fetching a blockhash for a time-sensitive transaction?
A Solana blockhash is only valid for 151 slots (roughly 60 to 90 seconds). The `finalized` commitment level means a block is buried under at least 31 other confirmed blocks. So, if you fetch a blockhash using `finalized`, you are grabbing a hash that is already 31+ slots old right out of the gate. You instantly burn about 13 seconds of your transaction's lifespan before you even build it, which is a terrible tradeoff if you are trying to avoid an "Expired Blockhash" error.

### Q3: What happens to your bundle if the Jito leader skips their slot?
Jito bundles only work if the specific Jito validator scheduled for that slot actually produces a block. If the leader skips their slot (due to hardware issues, network lag, etc.), the Jito block engine has nowhere to put your bundle. The entire bundle is just dropped. Your system has to realize this happened, rebuild the transaction with a fresh hash, and aim for the next available Jito leader.

---

## 🛠️ Setup Instructions

**Prerequisites:** Node.js (v18+)

**1. Clone the repository:**
```bash
git clone [https://github.com/YOUR_GITHUB_USERNAME/solana-smart-transaction-stack.git](https://github.com/YOUR_GITHUB_USERNAME/solana-smart-transaction-stack.git)
cd solana-smart-transaction-stack

### Q2: Why should you never use finalized commitment when fetching a blockhash for a time-sensitive transaction?
A Solana blockhash is only valid for 151 slots (roughly 60 to 90 seconds). The `finalized` commitment level means a block is buried under at least 31 other confirmed blocks. So, if you fetch a blockhash using `finalized`, you are grabbing a hash that is already 31+ slots old right out of the gate. You instantly burn about 13 seconds of your transaction's lifespan before you even build it, which is a terrible tradeoff if you are trying to avoid an "Expired Blockhash".

### Q3: What happens to your bundle if the Jito leader skips their slot?
Jito bundles only work if the specific Jito validator scheduled for that slot actually produces a block. If the leader skips their slot (due to hardware issues, network lag, etc.), the Jito block engine has nowhere to put your bundle. The entire bundle is just dropped. Your system has to realize this happened, rebuild the transaction with a fresh hash, and aim for the next available Jito leadern.

---

##  Setup Instructions.

**Prerequisites:** Node.js (v18+)

**1. Clone the repository:**
```bash
git clone [https://github.com/YOUR_GITHUB_USERNAME/solana-smart-transaction-stack.git](https://github.com/YOUR_GITHUB_USERNAME/solana-smart-transaction-stack.git)
cd solana-smart-transaction-stack

npm install

RPC_URL=your_solinfra_rpc_endpoint
PRIVATE_KEY=[your,wallet,private,key,array]

