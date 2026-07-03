// Question-category identity colors, reusing the same 5-hue brand palette
// as subjectColors.js (sage/sky/coral/blush/lavender). There are more
// lesson categories than brand hues, so a couple of colors are intentionally
// reused across categories that rarely surface together in the same list.
const CATEGORY_COLORS = {
  "Health Care Systems": { color: "#5E93BE", bg: "#EBF3F9" }, // Sky
  "Epidemiology & Biostatistics": { color: "#8B72D8", bg: "#EFEAFB" }, // Lavender
  "Community Development": { color: "#6FA86B", bg: "#EEF5ED" }, // Sage
  "Family Health Nursing": { color: "#E36B8D", bg: "#FBE7ED" }, // Blush
  "DOH National Health Programs": { color: "#E8875F", bg: "#FDF1EB" }, // Coral
  "Community Health Settings": { color: "#5E93BE", bg: "#EBF3F9" }, // Sky (reuse)
  "Disaster & Emergency Community Health": { color: "#E8875F", bg: "#FDF1EB" }, // Coral (reuse)
  "DOH National Health Programs / Health Legislation": { color: "#8B72D8", bg: "#EFEAFB" }, // Lavender (reuse)
};

const FALLBACK = { color: "#8B72D8", bg: "#EFEAFB" };

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] ?? FALLBACK;
}
