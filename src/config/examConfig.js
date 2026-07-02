// Exam engine configuration. Everything the practice exam needs to scale is
// here — item count, timer, and the Part A / Part B target split — so it never
// hardcodes 100/80/20 and adapts to however many real questions exist.
//
// The real PNLE is 100 items per subject; the build spec calls for a 3-hour
// full mock. 3 hours / 100 items = 108 s/item, which we apply per item so
// shorter sets get a proportional timer.

export const examConfig = {
  secondsPerItem: 108, // 100 items -> 180 min (matches the real 3-hour paper)

  // Target composition, mirroring the PRC Enhanced TOS (Part A 80% / Part B 20%).
  // The builder treats these as *targets*: if the question pool doesn't hold
  // enough of a part, it takes what exists and reports the real composition
  // rather than inventing items.
  partRatio: { A: 0.8, B: 0.2 },

  // Selectable exam lengths. Capped to the size of the reviewed pool at runtime.
  presets: [
    { id: "quick", label: "Quick set", items: 20 },
    { id: "half", label: "Half paper", items: 50 },
    { id: "full", label: "Full paper", items: 100 },
  ],

  defaultPresetId: "full",
};

export function minutesForItems(items) {
  return Math.round((items * examConfig.secondsPerItem) / 60);
}
