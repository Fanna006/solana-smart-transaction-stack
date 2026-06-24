# Solana Smart Transaction Stack

This is a custom transaction stack built for the Superteam Nigeria Advanced Infrastructure Bounty. Instead of just hoping transactions go through, this system is built to survive actual network chaos—handling backpressure, dropped bundles, and validator slot anomalies autonomously.

---

##  System Architecture.

The core idea here is decoupling standard transaction execution from a smart recovery agent. When things break, the system doesn't just blindly loop a retry; it figures out why it failed and adjusts[span_1](start_span)[span_1](end_span).

### Key Components
* **Stream Observer (Yellowstone gRPC):** Standard RPC polling is too slow. This connects directly to a gRPC stream to pull live slot updates, blockhash data, and leader schedules with minimal latency[span_2](start_span)[span_2](end_span).
* **Bundle Engine:** Puts together native Jito bundles, signs them, and calculates dynamic Jito tips based on real-time network conditions rather than using hardcoded values[span_3](start_span)[span_3](end_span).
* **State Tracker:** Watches the exact lifecycle of the bundle across `Processed`, `Confirmed`, and `Finalized` commitment levels, logging the actual latency metrics[span_4](start_span)[span_4](end_span).
* **AI Recovery Agent:** An isolated module that catches failures, analyzes the error strings, and decides exactly how to adjust the payload to force it through on the next attempt[span_5](start_span)[span_5](end_span).

### How It Handles Failures (Fault Injection)
The stack intentionally catches edge cases like `BlockhashNotFound` and skipped Jito leaders. When a transaction drops, the AI agent takes over. It purges the dead blockhash, fetches a fresh one, bumps the tip to gain auction priority, and commands the engine to resubmit without manual intervention[span_6](start_span)[span_6](end_span).

---

##  Operational Questions.

### Q1: What does the delta between `processed_at` and `confirmed_at` tell you about network health at the time of submission?
It basically acts as a real-time health check for network consensus[span_7](start_span)[span_7](end_span). A transaction is "processed" when it hits a block, but it is only "confirmed" once a supermajority (66%+) of validators vote on it[span_8](start_span)[span_8](end_span). If the time delta between these two stages is tiny, the network is healthy and votes are propagating across the gossip protocol quickly[span_9](start_span)[span_9](end_span). If the delta is massive, the network is congested, experiencing fork churn, or validators are struggling to coordinate the necessary votes[span_10](start_span)[span_10](end_span).

### Q2: Why should you never use finalized commitment when fetching a blockhash for a time-sensitive transaction?
A Solana blockhash is only valid for 151 slots (roughly 60 to 90 seconds)[span_11](start_span)[span_11](end_span). The `finalized` commitment level means a block is buried under at least 31 other confirmed blocks[span_12](start_span)[span_12](end_span). So, if you fetch a blockhash using `finalized`, you are grabbing a hash that is already 31+ slots old right out of the gate[span_13](start_span)[span_13](end_span). You instantly burn about 13 seconds of your transaction's lifespan before you even build it, which is a terrible tradeoff if you are trying to avoid an "Expired Blockhash" error[span_14](start_span)[span_14](end_span).

### Q3: What happens to your bundle if the Jito leader skips their slot?
Jito bundles only work if the specific Jito validator scheduled for that slot actually produces a block[span_15](start_span)[span_15](end_span). If the leader skips their slot (due to hardware issues, network lag, etc.), the Jito block engine has nowhere to put your bundle[span_16](start_span)[span_16](end_span). The entire bundle is just dropped[span_17](start_span)[span_17](end_span). Your system has to realize this happened, rebuild the transaction with a fresh hash, and aim for the next available Jito leader[span_18](start_span)[span_18](end_span).

---

##  Setup Instructions.

**Prerequisites:** Node.js (v18+)

**1. Clone the repository:**
```bash
git clone [https://github.com/YOUR_GITHUB_USERNAME/solana-smart-transaction-stack.git](https://github.com/YOUR_GITHUB_USERNAME/solana-smart-transaction-stack.git)
cd solana-smart-transaction-stack
