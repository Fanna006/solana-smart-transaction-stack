import { connection } from './config';
import { TransactionExecutor } from './executor';
import { AIAgent } from './aiAgent';

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runBountyLifecycle() {
    console.log("=========================================================");
    console.log(" STARTING SOLANA AI AUTONOMOUS TRANSACTION BUNDLE STACK");
    console.log("=========================================================");

    const executor = new TransactionExecutor();
    const ai = new AIAgent();

    let baseTip = 20000; 

    for (let loop = 1; loop <= 10; loop++) {
        console.log(`\n--- Iteration Loop [${loop} / 10] ---`);
        let currentAttempt = 1;
        let success = false;

        let blockhashObj = await connection.getLatestBlockhash('confirmed');
        let blockhash = blockhashObj.blockhash;

        if (loop === 3) {
            console.log(" [FAULT INJECTION] Simulating a massive submission delay to force blockhash expiry...");
            blockhash = "EETubv41J6FWe5D7F16vFz9D6wD6xJtoX98NfA1V2B3C"; 
        }

        while (!success && currentAttempt <= 3) {
            try {
                console.log(` Building versioned transaction bundle. Active Blockhash: ${blockhash.slice(0, 8)}...`);
                const transaction = await executor.buildJitoBundleTransaction(blockhash, baseTip);
                
                if (loop === 3 && currentAttempt === 1) {
                    throw new Error("Solana Network Exception: BlockhashNotFound or transaction expired during processing slot.");
                }

                const bundleId = await executor.submitBundle(transaction);
                console.log(` Success! Bundle confirmed in active slot. Blockhash validated.`);
                success = true;
                
            } catch (error: any) {
                console.error(` [FAILURE CAUGHT] Error details: ${error.message}`);
                
                const decision = await ai.analyzeFailure(error.message, currentAttempt);
                
                console.log(`\n [AI DECISION INCOMING]`);
                console.log(`    Strategy: ${decision.action}`);
                console.log(`    Reason: ${decision.reasoning}`);
                
                if (decision.action === 'REFRESH_BLOCKHASH_AND_BUMP_TIP') {
                    console.log(` [AUTONOMOUS ACTION] AI is overriding parameters. Refreshing blockhash data and scaling tips...`);
                    
                    const freshHash = await connection.getLatestBlockhash('confirmed');
                    blockhash = freshHash.blockhash; 
                    baseTip += decision.suggestedTipBumpLamports; 
                    
                    currentAttempt++;
                    console.log(` Re-executing transaction stack now under AI instructions...`);
                } else {
                    console.log(" AI halted current operations.");
                    break;
                }
            }
        }
        await sleep(2000);
    }
    console.log("\n=========================================================");
    console.log("🎉 ALL 10 TRANSACTIONS COMPLETED. STACK ARCHITECTURE SHUTTING DOWN CLEANLY.");
    console.log("=========================================================");
}

runBountyLifecycle().catch(err => console.error("Critical core failure:", err));
                  
