// server/services/simulator.ts
import crypto from "crypto";

export function computePhq9Total(phq9: number[]): number {
  if (!Array.isArray(phq9) || phq9.length !== 9) {
    throw new Error("PHQ-9 must be an array of 9 integers (0-3)");
  }
  for (const v of phq9) {
    if (!Number.isInteger(v) || v < 0 || v > 3) {
      throw new Error("PHQ-9 values must be integers between 0 and 3");
    }
  }
  return phq9.reduce((a, b) => a + b, 0);
}

function deterministicBias(salt: string): number {
  // Create a small reproducible bias 0..3 using a hash of the salt (file name)
  const hash = crypto.createHash("sha256").update(salt).digest("hex");
  const pick = parseInt(hash.slice(0, 8), 16) % 6;
  const biasMap: Record<number, number> = { 0: 0, 1: 0, 2: 1, 3: 1, 4: 2, 5: 3 };
  return biasMap[pick];
}

export function simulateFromPhq(phq9: number[], salt?: string) {
  const phqTotal = computePhq9Total(phq9);
  const bias = deterministicBias(salt ?? "nofile");
  const simulated = Math.max(0, phqTotal - bias);

  let label = "";
  if (simulated <= 4) label = "Minimal or None";
  else if (simulated <= 9) label = "Mild";
  else if (simulated <= 14) label = "Moderate";
  else if (simulated <= 19) label = "Moderately Severe";
  else label = "Severe";

  return {
    phq9_total: phqTotal,
    bias_applied: bias,
    simulated_total: simulated,
    label,
  };
}
