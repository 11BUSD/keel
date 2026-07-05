import type { KeelServices } from "./interfaces";
import { MockAuditLog } from "./mockAuditLog";
import { MockLedger } from "./mockLedger";
import { MockMandateEngine } from "./mockMandateEngine";
import { MockRiskEngine } from "./mockRiskEngine";
import { MockTreasuryEngine } from "./mockTreasuryEngine";

export type { KeelServices } from "./interfaces";
export type {
  AuditLog,
  Ledger,
  MandateEngine,
  RiskEngine,
  TreasuryEngine,
} from "./interfaces";

let services: KeelServices | null = null;

/**
 * The single service registry (ARCHITECTURE.md). Swapping in a real backend means
 * replacing the wiring below — everything above this line of the stack is untouched.
 */
export function getServices(): KeelServices {
  if (!services) {
    const treasuryEngine = new MockTreasuryEngine();
    services = {
      ledger: new MockLedger(),
      // Slightly longer simulated latency so the evaluation moment reads on stage.
      riskEngine: new MockRiskEngine(treasuryEngine, 1400),
      treasuryEngine,
      mandateEngine: new MockMandateEngine(treasuryEngine),
      auditLog: new MockAuditLog(),
    };
  }
  return services;
}
