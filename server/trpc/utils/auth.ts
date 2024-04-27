import * as jose from 'jose';
import { eq } from 'drizzle-orm';
import { db } from '../../db/db';
import { users } from '../../db/schema';
import { env } from '../../env';
import { makeId } from '../../trpc/utils/shared';

const encode = TextEncoder.prototype.encode.bind(new TextEncoder());
const decode = TextDecoder.prototype.decode.bind(new TextDecoder());

const encPublicKey = await jose.importSPKI(env.ENC_PUBLIC_KEY, 'RSA-OAEP-256');
const signPrivateKey = await jose.importPKCS8(env.SIGN_PRIVATE_KEY, 'RS512');

export class Auth {
  async produceAccessToken(id: number) {
    const jwt = await new jose.SignJWT({})
      .setSubject(id.toString())
      .setIssuedAt()
      .setExpirationTime(env.TOKEN_EXPIRATION_TIME)
      .setIssuer('sms-tree')
      .setJti(makeId(32))
      .setProtectedHeader({
        alg: 'RS512',
        kid: env.SIGN_KID,
      })
      .sign(signPrivateKey);
    const jwe = await new jose.CompactEncrypt(encode(jwt))
      .setProtectedHeader({
        alg: 'RSA-OAEP-256',
        enc: 'A256GCM',
        kid: env.ENC_KID,
      })
      .encrypt(encPublicKey);
    return jwe;
  }

  async getUserFromToken(token: string) {
    try {
      const signPublicKey = await jose.importSPKI(env.SIGN_PUBLIC_KEY, 'RS512');
      const encPrivateKey = await jose.importPKCS8(env.ENC_PRIVATE_KEY, 'RSA-OAEP-256');
      const { plaintext: decryptedJwt } = await jose.compactDecrypt(token, encPrivateKey);
      const { payload } = await jose.jwtVerify(decode(decryptedJwt), signPublicKey);
      const userSelectResult = await db.select().from(users).where(eq(users.id, Number.parseInt(payload.sub!)));
      return { user: userSelectResult[0] };
    } catch (err) {
      if (err instanceof jose.errors.JWEDecryptionFailed)
        return { err: err.code };
      else if (err instanceof jose.errors.JWTExpired)
        return { err: err.code };
      else return { err: 'ERR_INVALID_TOKEN' };
    }
  }
}
