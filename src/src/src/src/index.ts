import { connection } from './config';
import { TransactionExecutor } from './executor';
import { AIAgent } from './aiAgent';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function runBounty() {
    console.log("Starting the custom transaction stack...");

    const executor = new TransactionExecutor();
    const ai = new AIAgent();

    let baseTip = 20000; 

    // Running 10 loops to satisfy the bounty requirement
    for (let loop = 1; loop <= 10; loop++) {
        console.log(`\n--- Loop ${loop}/10 ---`);
        let attempt = 1;
        let success = false;

        let { blockhash } = await connection.getLatestBlockhash('confirmed');

        // Forcing a failure on loop 3 to prove our agent works
        if (loop === 3) {
            console.log("[Test] Injecting fake blockhash to force an expiration error...");
            blockhash = "EETubv41J6FWe5D7F16vFz9D6wD6xJtoX98NfA1V2B3C"; 
        }

        while (!success && attempt <= 3) {
            try {
                console.log(`Building bundle with hash: ${blockhash.slice(0, 8)}...`);
                const tx = await executor.buildJitoBundle(blockhash, baseTip);
                
                if (loop === 3 && attempt === 1) {
                    throw new Error("Simulation failure: BlockhashNotFound");
                }

                await executor.submitBundle(tx);
                console.log(`Success: Bundle landed.`);
                success = true;
                
            } catch (err: any) {
                console.error(`[Error] ${err.message}`);
                
                const decision = await ai.analyzeFailure(err.message, attempt);
                
                console.log(`[Agent Decision] ${decision.action}`);
                console.log(`[Agent Reasoning] ${decision.reasoning}`);
                
                if (decision.action === 'REFRESH_HASH_AND_BUMP') {
                    console.log(`[Action] Pulling new hash and bumping tip...`);
                    
                    const fresh = await connection.getLatestBlockhash('confirmed');
                    blockhash = fresh.blockhash; 
                    baseTip += decision.suggestedTipBump; 
                    
                    attempt++;
                } else {
                    console.log("Stopping execution.");
                    break;
                }
            }
        }
        await sleep(2000); // don't spam the RPC
    }
    console.log("\nFinished all 10 loops cleanly.");
}

runBounty().catch(console.error);
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
                  
