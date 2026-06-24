export interface RecoveryInstruction {
    shouldRetry: boolean;
    action: 'REFRESH_BLOCKHASH_AND_BUMP_TIP' | 'INCREASE_TIP_ONLY' | 'ABORT';
    reasoning: string;
    suggestedTipBumpLamports: number;
}

export class AIAgent {
    public async analyzeFailure(errorString: string, attemptCount: number): Promise<RecoveryInstruction> {
        console.log(`\n [AI AGENT] Analyzing transaction failure string...`);
        
        if (attemptCount >= 3) {
            return {
                shouldRetry: false,
                action: 'ABORT',
                reasoning: "Maximum retry threshold reached. Persistent failures indicate severe downstream network issues or insufficient local funds.",
                suggestedTipBumpLamports: 0
            };
        }

        if (errorString.includes('BlockhashNotFound') || errorString.includes('expired') || errorString.includes('Simulation failure')) {
            return {
                shouldRetry: true,
                action: 'REFRESH_BLOCKHASH_AND_BUMP_TIP',
                reasoning: "CRITICAL FAULT DETECTED: The transaction failed because the blockhash expired or was not found in the validator queue. This happens when submission lags or a leader skips a block. To recover autonomously, we must grab an entirely fresh blockhash, re-sign the payload, and increase our Jito tip by 20% to gain processing priority in the upcoming slot.",
                suggestedTipBumpLamports: 15000 
            };
        }

        return {
            shouldRetry: true,
            action: 'INCREASE_TIP_ONLY',
            reasoning: "The transaction was likely dropped or outbid in the Jito auction mempool due to sudden network traffic spikes. Suggesting an aggressive tip increase to make our bundle more appealing to the next scheduled leader.",
            suggestedTipBumpLamports: 10000
        };
    }
}
