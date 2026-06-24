export interface RecoveryInstruction {
    shouldRetry: boolean;
    action: 'REFRESH_HASH_AND_BUMP' | 'BUMP_FEE_ONLY' | 'ABORT';
    reasoning: string;
    suggestedTipBump: number;
}

export class AIAgent {
    public async analyzeFailure(errorString: string, attemptCount: number): Promise<RecoveryInstruction> {
        console.log(`\n[Agent] Looking at the failure...`);
        
        if (attemptCount >= 3) {
            return {
                shouldRetry: false,
                action: 'ABORT',
                reasoning: "Hit the max retries. Either the network is completely cooked or we are out of SOL. Aborting.",
                suggestedTipBump: 0
            };
        }

        // Checking for expired blockhash or dropped transactions
        if (errorString.includes('BlockhashNotFound') || errorString.includes('expired') || errorString.includes('Simulation failure')) {
            return {
                shouldRetry: true,
                action: 'REFRESH_HASH_AND_BUMP',
                reasoning: "Looks like the blockhash expired or the leader skipped. We can't reuse the same payload. Need to pull a fresh hash and bump the Jito tip by 15k lamports to get prioritized in the next slot.",
                suggestedTipBump: 15000 
            };
        }

        // If it's just regular congestion
        return {
            shouldRetry: true,
            action: 'BUMP_FEE_ONLY',
            reasoning: "Probably just got outbid in the mempool. Let's bump the tip by 10k lamports and try again.",
            suggestedTipBump: 10000
        };
    }
}
}
