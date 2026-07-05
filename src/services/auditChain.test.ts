import { beforeEach, describe, expect, it } from "vitest";
import { fnv1a64 } from "@/lib/hash";
import { appendAudit, getWorld, resetWorld, verifyAuditChain } from "./store";

beforeEach(() => resetWorld());

describe("audit hash chain", () => {
  it("links each event to the previous hash and verifies end-to-end", () => {
    appendAudit({ actor: "t", category: "system", action: "a.one", detail: "first" });
    appendAudit({ actor: "t", category: "system", action: "a.two", detail: "second" });
    const audit = getWorld().audit;
    expect(audit[1].prevHash).toBe(audit[0].hash);
    expect(audit[2].prevHash).toBe(audit[1].hash);
    expect(verifyAuditChain()).toBe(true);
  });

  it("detects tampering with any field", () => {
    appendAudit({ actor: "t", category: "system", action: "a.one", detail: "first" });
    getWorld().audit[1].detail = "rewritten history";
    expect(verifyAuditChain()).toBe(false);
  });

  it("fnv1a64 is stable and collision-resistant enough for the demo", () => {
    expect(fnv1a64("keel")).toBe(fnv1a64("keel"));
    expect(fnv1a64("keel")).not.toBe(fnv1a64("keel ") );
    expect(fnv1a64("")).toMatch(/^[0-9a-f]{16}$/);
  });
});
