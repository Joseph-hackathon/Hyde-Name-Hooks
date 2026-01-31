import crypto from 'crypto';
import dotenv from 'dotenv';
import { registerEntitySecretCiphertext } from '@circle-fin/developer-controlled-wallets';

dotenv.config();

async function main() {
  const apiKey = process.env.CIRCLE_API_KEY;
  if (!apiKey) {
    throw new Error('CIRCLE_API_KEY is required');
  }

  const recoveryFileDownloadPath = process.env.CIRCLE_RECOVERY_FILE_PATH || '';
  const providedSecret = process.env.CIRCLE_ENTITY_SECRET;
  const entitySecret = providedSecret || crypto.randomBytes(32).toString('hex');

  const response = await registerEntitySecretCiphertext({
    apiKey,
    entitySecret,
    recoveryFileDownloadPath,
  });

  const recoveryFile = response?.data?.recoveryFile;

  console.log('✅ Entity Secret 등록 완료');
  console.log(`- entitySecret: ${entitySecret}`);
  if (recoveryFile) {
    console.log(`- recoveryFile: ${recoveryFile}`);
  } else if (recoveryFileDownloadPath) {
    console.log(`- recoveryFile: ${recoveryFileDownloadPath}`);
  }
  console.log(
    '- entitySecretCiphertext: Circle SDK는 요청 시 자동 생성합니다. 필요 시 별도 생성 스크립트를 추가하세요.'
  );
}

main().catch((error) => {
  console.error('❌ Entity Secret 등록 실패:', error);
  process.exit(1);
});
