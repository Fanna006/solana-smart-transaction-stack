import { 
    SystemProgram, 
    Transaction, 
    PublicKey, 
    Blockhash,
    VersionedTransaction,
    TransactionMessage
} from '@solana/web3.js';
import { connection, walletKeypair, JITO_BLOCK_ENGINE_URL, JITO_TIP_ACCOUNT } from './config';
import axios from 'axios';

export class TransactionExecutor {
    
    public async buildJitoBundleTransaction(
        recentBlockhash: string, 
        tipLamports: number
    ): Promise<VersionedTransaction> {
        const transferInstruction = SystemProgram.transfer({
            fromPubkey: walletKeypair.publicKey,
            toPubkey: walletKeypair.publicKey,
            lamports: 1000, 
        });

        const tipInstruction = SystemProgram.transfer({
            fromPubkey: walletKeypair.publicKey,
            toPubkey: new PublicKey(JITO_TIP_ACCOUNT),
            lamports: tipLamports,
        });

        const messageV0 = new TransactionMessage({
            payerKey: walletKeypair.publicKey,
            recentBlockhash: recentBlockhash,
            instructions: [transferInstruction, tipInstruction]
        }).compileToV0Message();

        const versionedTx = new VersionedTransaction(messageV0);
        versionedTx.sign([walletKeypair]);
        
        return versionedTx;
    }

    public async submitBundle(versionedTx: VersionedTransaction): Promise<string> {
        const serializedTx = Buffer.from(versionedTx.serialize()).toString('base64');
        
        const payload = {
            jsonrpc: "2.0",
            id: 1,
            method: "sendBundle",
            params: [[serializedTx]]
        };

        const startTime = Date.now();
        const response = await axios.post(JITO_BLOCK_ENGINE_URL, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        const bundleId = response.data.result;
        if (!bundleId) {
            throw new Error(`Jito Bundle submission rejected: ${JSON.stringify(response.data)}`);
        }

        const processedTime = Date.now();
        console.log(` [STACK] Bundle successfully transmitted. Bundle ID: ${bundleId}`);
        console.log(` [METRICS] Time Delta (processed_at calculation window): ${processedTime - startTime}ms`);
        
        return bundleId;
    }
}
