export interface TokenPayload {
  id: string;
}

export interface ITokenProvider {
  sign(payload: TokenPayload): string;
  verify(token: string): TokenPayload | null;
  decode(token: string): TokenPayload | null;
}
