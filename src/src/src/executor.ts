import { 
    SystemProgram, 
    PublicKey, 
    VersionedTransaction,
    TransactionMessage
} from '@solana/web3.js';
import { connection, walletKeypair, JITO_BLOCK_ENGINE_URL, JITO_TIP_ACCOUNT } from './config';
import axios from 'axios';

export class TransactionExecutor {
    
    public async buildJitoBundle(recentBlockhash: string, tipLamports: number): Promise<VersionedTransaction> {
        // Just a dummy transfer to ourselves to prove execution
        const transferIx = SystemProgram.transfer({
            fromPubkey: walletKeypair.publicKey,
            toPubkey: walletKeypair.publicKey,
            lamports: 1000, 
        });

        // The tip instruction to pay the Jito validator
        const tipIx = SystemProgram.transfer({
            fromPubkey: walletKeypair.publicKey,
            toPubkey: new PublicKey(JITO_TIP_ACCOUNT),
            lamports: tipLamports,
        });

        const messageV0 = new TransactionMessage({
            payerKey: walletKeypair.publicKey,
            recentBlockhash: recentBlockhash,
            instructions: [transferIx, tipIx]
        }).compileToV0Message();

        const tx = new VersionedTransaction(messageV0);
        tx.sign([walletKeypair]);
        
        return tx;
    }

    public async submitBundle(tx: VersionedTransaction): Promise<string> {
        const serializedTx = Buffer.from(tx.serialize()).toString('base64');
        
        const payload = {
            jsonrpc: "2.0",
            id: 1,
            method: "sendBundle",
            params: [[serializedTx]]
        };

        const start = Date.now();
        const res = await axios.post(JITO_BLOCK_ENGINE_URL, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        const bundleId = res.data.result;
        if (!bundleId) {
            throw new Error(`Jito rejected the bundle: ${JSON.stringify(res.data)}`);
        }

        const end = Date.now();
        console.log(`[Stack] Bundle sent. ID: ${bundleId}`);
        console.log(`[Metrics] Processed time delta: ${end - start}ms`);
        
        return bundleId;
    }
}
        const processedTime = Date.now();
        console.log(` [STACK] Bundle successfully transmitted. Bundle ID: ${bundleId}`);
        console.log(` [METRICS] Time Delta (processed_at calculation window): ${processedTime - startTime}ms`);
        
        return bundleId;
    }
}
