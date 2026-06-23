import {
  TokenHandler as TokenHandlerContract,
  TokenPayload,
} from '../../application/ports/TokenHandler';

export class TokenHandler implements TokenHandlerContract {
  generate(
    payload: TokenPayload,
    expiresIn?: string | number
  ): Promise<string> {
    return new Promise((resolve) => {
      resolve('mock-token');
    });
  }

  verify(token: string): Promise<TokenPayload> {
    return new Promise((resolve) => {
      resolve({ userId: 'mock-user-id' });
    });
  }
}
