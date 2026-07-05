import type { AuditEvent } from "@/domain";
import type { AuditLog } from "./interfaces";
import { delay, getWorld, verifyAuditChain } from "./store";

/** Read-side of the hash-chained audit log (ADR-0006). */
export class MockAuditLog implements AuditLog {
  constructor(private readonly latencyMs = 250) {}

  async list(): Promise<AuditEvent[]> {
    await delay(this.latencyMs);
    return [...getWorld().audit].reverse().map((e) => structuredClone(e));
  }

  async verifyChain(): Promise<{ valid: boolean; length: number }> {
    await delay(this.latencyMs);
    return { valid: verifyAuditChain(), length: getWorld().audit.length };
  }
}
