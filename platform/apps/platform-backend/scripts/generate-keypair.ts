import { generateKeyPairSync } from "node:crypto";

const prefix = process.argv.slice(2).find((arg) => arg !== "--");
if (!prefix) {
    console.error("Usage: tsx scripts/generate-keypair.ts <VAR_PREFIX>");
    console.error("Example: tsx scripts/generate-keypair.ts JWT_ACCESS");
    process.exit(1);
}

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

const toEnvLine = (name: string, pem: string) => `${name}="${pem.replace(/\n/g, "\\n")}"`;

console.log(toEnvLine(`${prefix}_PRIVATE_KEY`, privateKey));
console.log(toEnvLine(`${prefix}_PUBLIC_KEY`, publicKey));
