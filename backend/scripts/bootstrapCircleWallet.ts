import crypto from 'crypto';
import path from 'path';
import dotenv from 'dotenv';
import {
  initiateDeveloperControlledWalletsClient,
  registerEntitySecretCiphertext,
} from '@circle-fin/developer-controlled-wallets';
import type { Blockchain } from '@circle-fin/developer-controlled-wallets';

dotenv.config();

async function main() {
  const apiKey = process.env.CIRCLE_API_KEY;
  if (!apiKey) {
    throw new Error('CIRCLE_API_KEY is required');
  }

  const baseUrl = process.env.CIRCLE_API_BASE;
  const recoveryPathInput = process.env.CIRCLE_RECOVERY_FILE_PATH || '';
  const recoveryFileDownloadPath = recoveryPathInput
    ? (path.extname(recoveryPathInput) ? path.dirname(recoveryPathInput) : recoveryPathInput)
    : '';
  const providedSecret = process.env.CIRCLE_ENTITY_SECRET;
  const entitySecret = providedSecret || crypto.randomBytes(32).toString('hex');

  const walletSetName = process.env.CIRCLE_WALLET_SET_NAME || 'Hyde Arc WalletSet';
  const accountType = (process.env.CIRCLE_WALLET_ACCOUNT_TYPE || 'EOA') as 'EOA' | 'SCA';
  const blockchainsRaw = process.env.CIRCLE_WALLET_BLOCKCHAINS || 'ARC-TESTNET';
  const blockchains = blockchainsRaw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean) as Blockchain[];
  const count = Number(process.env.CIRCLE_WALLET_COUNT || 1);

  const registerResponse = await registerEntitySecretCiphertext({
    apiKey,
    entitySecret,
    recoveryFileDownloadPath,
    baseUrl,
  });

  const client = initiateDeveloperControlledWalletsClient({
    apiKey,
    entitySecret,
    baseUrl,
  });

  const walletSetResponse = await client.createWalletSet({
    name: walletSetName,
  });

  const walletSetId = walletSetResponse.data?.walletSet?.id;
  if (!walletSetId) {
    throw new Error('Failed to create wallet set');
  }

  const walletsResponse = await client.createWallets({
    accountType,
    blockchains,
    count: Number.isNaN(count) || count <= 0 ? 1 : count,
    walletSetId,
  });

  console.log('✅ Circle Wallet bootstrap 완료');
  console.log(`- entitySecret: ${entitySecret}`);
  console.log(`- recoveryFile: ${registerResponse.data?.recoveryFile || recoveryFileDownloadPath}`);
  console.log(`- walletSetId: ${walletSetId}`);
  console.log('- wallets:');
  walletsResponse.data?.wallets?.forEach((wallet) => {
    console.log(`  - id: ${wallet.id} | address: ${wallet.address} | blockchain: ${wallet.blockchain}`);
  });
}

main().catch((error) => {
  console.error('❌ Circle Wallet bootstrap 실패:', error);
  process.exit(1);
});
