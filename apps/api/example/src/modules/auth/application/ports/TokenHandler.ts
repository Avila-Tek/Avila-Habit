export interface TokenPayload {
  userId: string;
}

export interface TokenHandler {
  generate(payload: TokenPayload, expiresIn?: string | number): Promise<string>;
  verify(token: string): Promise<TokenPayload>;
}
