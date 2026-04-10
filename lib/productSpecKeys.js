/**
 * Product detail UI: canonical spec rows (lowercase catalog fields from LLM or legacy data).
 * Amazon PDP labels are stored as separate top-level keys; see ProductDetailsModal dynamic rows.
 */

/** @type {{ key: string, label: string, icon: string }[]} */
const SPEC_KEYS = [
  { key: "material", label: "Material", icon: "🧵" },
  { key: "color", label: "Color", icon: "🎨" },
  { key: "dimensions", label: "Dimensions", icon: "📐" },
  { key: "usage", label: "Usage", icon: "💡" },
  { key: "pattern", label: "Pattern", icon: "🔲" },
  { key: "mountType", label: "Mount Type", icon: "🔩" },
  { key: "style", label: "Style", icon: "✨" },
  { key: "weight", label: "Weight", icon: "⚖️" },
  { key: "season", label: "Season", icon: "🌤️" },
  { key: "gender", label: "Gender", icon: "👤" },
  { key: "baseColour", label: "Base Colour", icon: "🎨" },
];

module.exports = { SPEC_KEYS };
