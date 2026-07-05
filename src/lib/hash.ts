/**
 * FNV-1a 64-bit hash, hex-encoded. Used to hash-chain the simulated audit log.
 * NOT cryptographic — acceptable for a simulated tamper-evidence demo only
 * (ADR-0006); a production audit log would use SHA-256 with signed anchors.
 */
const FNV_OFFSET = 0xcbf29ce484222325n;
const FNV_PRIME = 0x100000001b3n;
const MASK64 = 0xffffffffffffffffn;

export function fnv1a64(input: string): string {
  let hash = FNV_OFFSET;
  for (let i = 0; i < input.length; i++) {
    hash ^= BigInt(input.charCodeAt(i));
    hash = (hash * FNV_PRIME) & MASK64;
  }
  return hash.toString(16).padStart(16, "0");
}
