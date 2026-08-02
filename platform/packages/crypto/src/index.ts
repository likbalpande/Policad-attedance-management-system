import { createSign, createVerify } from "node:crypto";

// PB signs the UAI-derived "origin" value with private key 2; LAG verifies it
// with public key 2 (see product-idea.txt's login section). The JWT itself
// (signed with private key 1) is handled separately by the JWT library - this
// package only covers the raw asymmetric sign/verify step, kept generic so
// it isn't tied to the "origin" use case specifically.

export function signData(data: string, privateKeyPem: string): string {
  const signer = createSign("RSA-SHA256");
  signer.update(data);
  signer.end();
  return signer.sign(privateKeyPem, "base64");
}

export function verifySignature(data: string, signature: string, publicKeyPem: string): boolean {
  const verifier = createVerify("RSA-SHA256");
  verifier.update(data);
  verifier.end();
  return verifier.verify(publicKeyPem, signature, "base64");
}
