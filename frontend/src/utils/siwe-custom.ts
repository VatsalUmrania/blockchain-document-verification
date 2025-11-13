import { ethers } from 'ethers';

export interface SiweMessageParams {
  domain: string;
  address: string;
  statement: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
  issuedAt?: string;
  expirationTime?: string;
  notBefore?: string;
  requestId?: string;
  resources?: string[];
}

export class CustomSiweMessage {
  public domain: string;
  public address: string;
  public statement: string;
  public uri: string;
  public version: string;
  public chainId: number;
  public nonce: string;
  public issuedAt: string;
  public expirationTime?: string;
  public notBefore?: string;
  public requestId?: string;
  public resources?: string[];

  constructor(params: SiweMessageParams) {
    // Ensure proper address checksum
    this.address = ethers.getAddress(params.address.toLowerCase());
    this.domain = params.domain;
    this.statement = params.statement;
    this.uri = params.uri;
    this.version = params.version;
    this.chainId = params.chainId;
    this.nonce = params.nonce;
    this.issuedAt = params.issuedAt || new Date().toISOString();
    this.expirationTime = params.expirationTime;
    this.notBefore = params.notBefore;
    this.requestId = params.requestId;
    this.resources = params.resources;
  }

  prepareMessage(): string {
    const header = `${this.domain} wants you to sign in with your Ethereum account:`;
    const addressLine = this.address;
    const statementLine = this.statement ? `\n${this.statement}` : '';
    
    let body = `\nURI: ${this.uri}`;
    body += `\nVersion: ${this.version}`;
    body += `\nChain ID: ${this.chainId}`;
    body += `\nNonce: ${this.nonce}`;
    body += `\nIssued At: ${this.issuedAt}`;
    
    if (this.expirationTime) {
      body += `\nExpiration Time: ${this.expirationTime}`;
    }
    
    if (this.notBefore) {
      body += `\nNot Before: ${this.notBefore}`;
    }
    
    if (this.requestId) {
      body += `\nRequest ID: ${this.requestId}`;
    }
    
    if (this.resources && this.resources.length > 0) {
      body += `\nResources:`;
      this.resources.forEach(resource => {
        body += `\n- ${resource}`;
      });
    }

    return `${header}\n${addressLine}${statementLine}\n${body}`;
  }

  async verify(signature: string): Promise<boolean> {
    try {
      const message = this.prepareMessage();
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === this.address.toLowerCase();
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  // Static method to parse a message string back to object (for backend)
  static parseMessage(messageString: string): CustomSiweMessage | null {
    try {
      const lines = messageString.split('\n');
      
      // Parse header
      const headerMatch = lines[0].match(/^(.+) wants you to sign in with your Ethereum account:$/);
      if (!headerMatch) return null;
      
      const domain = headerMatch[1];
      const address = lines[1];
      
      // Find statement (optional)
      let statement = '';
      let bodyStartIndex = 2;
      
      if (lines[2] && !lines[2].startsWith('URI:')) {
        statement = lines[2];
        bodyStartIndex = 3;
      }
      
      // Parse body
      const bodyLines = lines.slice(bodyStartIndex);
      const params: any = { domain, address, statement };
      
      bodyLines.forEach(line => {
        if (line.startsWith('URI: ')) params.uri = line.substring(5);
        else if (line.startsWith('Version: ')) params.version = line.substring(9);
        else if (line.startsWith('Chain ID: ')) params.chainId = parseInt(line.substring(10));
        else if (line.startsWith('Nonce: ')) params.nonce = line.substring(7);
        else if (line.startsWith('Issued At: ')) params.issuedAt = line.substring(11);
        else if (line.startsWith('Expiration Time: ')) params.expirationTime = line.substring(17);
        else if (line.startsWith('Not Before: ')) params.notBefore = line.substring(12);
        else if (line.startsWith('Request ID: ')) params.requestId = line.substring(12);
      });
      
      return new CustomSiweMessage(params);
    } catch (error) {
      console.error('Error parsing SIWE message:', error);
      return null;
    }
  }
}
