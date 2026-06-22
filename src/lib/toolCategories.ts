// Fully custom tool/materials categories
// Each category lets users define exactly which fields they want
// Only non-empty fields are shown in the form and tutorial view

export type ToolFieldKey = "name" | "amount" | "size" | "kind" | "notes";

export interface ToolFieldDef {
  key: ToolFieldKey;
  label: string;
  placeholder: string;
  helper: string;
  /** For custom categories: the actual item name */
  itemName?: string;
}

export interface ToolFieldConfig {
  sectionTitle: string;
  fields: ToolFieldDef[];
}

/** Extended config for custom categories stored per-tutorial */
export interface CustomToolFieldConfig extends ToolFieldConfig {
  categoryKey: string;
}

export const TOOL_CATEGORY_CONFIG: Record<string, ToolFieldConfig> = {
  Cooking: {
    sectionTitle: "Ingredients",
    fields: [
      { key: "name", label: "Ingredient", placeholder: "e.g. flour, chicken breast", helper: "What do you need?" },
      { key: "amount", label: "Amount", placeholder: "e.g. 2 cups, 500g", helper: "How much?" },
      { key: "size", label: "Cut / Size", placeholder: "e.g. diced, shredded", helper: "How should it be cut?" },
      { key: "kind", label: "Type", placeholder: "e.g. organic, whole wheat", helper: "Any specific type?" },
      { key: "notes", label: "Prep Notes", placeholder: "e.g. room temperature", helper: "Any prep tips?" },
    ],
  },
  Tech: {
    sectionTitle: "System Requirements",
    fields: [
      { key: "name", label: "Part", placeholder: "e.g. RAM, GPU, CPU", helper: "What part is needed?" },
      { key: "amount", label: "Amount", placeholder: "e.g. 8GB, 512GB", helper: "How much or how many?" },
      { key: "size", label: "Spec", placeholder: "e.g. RTX 3060, i7-12700K", helper: "Exact model or spec?" },
      { key: "kind", label: "Type", placeholder: "e.g. SSD, USB-C, M.2", helper: "What kind of interface?" },
      { key: "notes", label: "Requirements", placeholder: "e.g. min 8GB RAM", helper: "Any special requirements?" },
    ],
  },
  DIY: {
    sectionTitle: "Tools & Materials",
    fields: [
      { key: "name", label: "Item", placeholder: "e.g. hammer, wood screws", helper: "What do you need?" },
      { key: "amount", label: "Quantity", placeholder: "e.g. 2, 10ft, 1 box", helper: "How many do you need?" },
      { key: "size", label: "Size", placeholder: "e.g. 2 inch, 1/4 inch", helper: "What size or length?" },
      { key: "kind", label: "Type", placeholder: "e.g. Phillips head, galvanized", helper: "What type or drive?" },
      { key: "notes", label: "Notes", placeholder: "e.g. power tool required", helper: "Any tips or warnings?" },
    ],
  },
  "Home Improvement": {
    sectionTitle: "Tools & Materials",
    fields: [
      { key: "name", label: "Item", placeholder: "e.g. cordless drill, PVC pipe", helper: "What do you need?" },
      { key: "amount", label: "Quantity", placeholder: "e.g. 1 set, 10ft, 1 gallon", helper: "How much or how many?" },
      { key: "size", label: "Size", placeholder: "e.g. 1/2 inch, 2 inch", helper: "What diameter or volume?" },
      { key: "kind", label: "Grade", placeholder: "e.g. Schedule 40, waterproof", helper: "What quality or rating?" },
      { key: "notes", label: "Notes", placeholder: "e.g. check building codes", helper: "Any tips or warnings?" },
    ],
  },
  Woodworking: {
    sectionTitle: "Tools & Materials",
    fields: [
      { key: "name", label: "Item", placeholder: "e.g. table saw, wood glue", helper: "What do you need?" },
      { key: "amount", label: "Quantity", placeholder: "e.g. 1 sheet, 2oz, 4 clamps", helper: "How much or how many?" },
      { key: "size", label: "Dimensions", placeholder: "e.g. 3/4 inch, 4x8 ft", helper: "What size board?" },
      { key: "kind", label: "Type", placeholder: "e.g. red oak, pine, MDF", helper: "What wood species or grade?" },
      { key: "notes", label: "Notes", placeholder: "e.g. acclimate 24hrs", helper: "Any tips or warnings?" },
    ],
  },
  Electronics: {
    sectionTitle: "Components",
    fields: [
      { key: "name", label: "Component", placeholder: "e.g. 10k resistor, Arduino", helper: "What part is needed?" },
      { key: "amount", label: "Quantity", placeholder: "e.g. 10pcs, 5m, 1 roll", helper: "How many do you need?" },
      { key: "size", label: "Rating", placeholder: "e.g. 10k, 25V, AWG 22", helper: "Voltage, resistance, or gauge?" },
      { key: "kind", label: "Type", placeholder: "e.g. through-hole, SMD 0805", helper: "Package or connector type?" },
      { key: "notes", label: "Notes", placeholder: "e.g. watch polarity, ESD-sensitive", helper: "Any tips or warnings?" },
    ],
  },
  Crafts: {
    sectionTitle: "Supplies",
    fields: [
      { key: "name", label: "Supply", placeholder: "e.g. acrylic paint, brushes", helper: "What supply is needed?" },
      { key: "amount", label: "Quantity", placeholder: "e.g. 3 tubes, 1 pack", helper: "How many do you need?" },
      { key: "size", label: "Size", placeholder: "e.g. 8oz, 12x16 inch", helper: "What size or shape?" },
      { key: "kind", label: "Brand", placeholder: "e.g. Winsor & Newton", helper: "What brand or finish?" },
      { key: "notes", label: "Notes", placeholder: "e.g. work in ventilated area", helper: "Any tips or warnings?" },
    ],
  },
  Sewing: {
    sectionTitle: "Supplies",
    fields: [
      { key: "name", label: "Supply", placeholder: "e.g. thread, fabric, needles", helper: "What supply is needed?" },
      { key: "amount", label: "Quantity", placeholder: "e.g. 3 yards, 2 spools", helper: "How much or how many?" },
      { key: "size", label: "Size", placeholder: "e.g. 1/4 inch, 45 inch width", helper: "What width or needle size?" },
      { key: "kind", label: "Material", placeholder: "e.g. cotton, polyester, silk", helper: "What material?" },
      { key: "notes", label: "Notes", placeholder: "e.g. pre-wash fabric", helper: "Any tips or warnings?" },
    ],
  },
  Vehicles: {
    sectionTitle: "Parts & Fluids",
    fields: [
      { key: "name", label: "Part / Fluid", placeholder: "e.g. engine oil, brake pads", helper: "What part or fluid?" },
      { key: "amount", label: "Quantity", placeholder: "e.g. 4 qts, 1 set, 1 gallon", helper: "How much or how many?" },
      { key: "size", label: "Size / Spec", placeholder: "e.g. 5W-30, V6/V8 compatible", helper: "What size or spec?" },
      { key: "kind", label: "Type", placeholder: "e.g. synthetic, OEM, aftermarket", helper: "Synthetic or OEM?" },
      { key: "notes", label: "Notes", placeholder: "e.g. change every 5,000 miles", helper: "Any tips or compatibility notes?" },
    ],
  },
  Gardening: {
    sectionTitle: "Plants & Supplies",
    fields: [
      { key: "name", label: "Item", placeholder: "e.g. tomato seeds, potting soil", helper: "What plant or supply?" },
      { key: "amount", label: "Quantity", placeholder: "e.g. 1 pack, 2 cubic feet", helper: "How much or how many?" },
      { key: "size", label: "Size / Age", placeholder: "e.g. 1-gallon, 6-week seedlings", helper: "What size pot or plant age?" },
      { key: "kind", label: "Variety", placeholder: "e.g. heirloom, NPK 10-10-10", helper: "What variety or formula?" },
      { key: "notes", label: "Notes", placeholder: "e.g. full sun (6+ hrs)", helper: "Any growing tips?" },
    ],
  },
  Other: {
    sectionTitle: "Items",
    fields: [
      { key: "name", label: "Item", placeholder: "e.g. item name", helper: "What do you need?" },
      { key: "amount", label: "Quantity", placeholder: "e.g. 2, 1 set", helper: "How many?" },
      { key: "size", label: "Size", placeholder: "e.g. small, medium, large", helper: "What size?" },
      { key: "kind", label: "Type", placeholder: "e.g. standard, premium", helper: "What kind?" },
      { key: "notes", label: "Notes", placeholder: "e.g. optional, recommended", helper: "Any extra notes?" },
    ],
  },
};

export const DEFAULT_TOOL_CONFIG: ToolFieldConfig = TOOL_CATEGORY_CONFIG["Other"];

export function getToolConfig(category: string): ToolFieldConfig {
  return TOOL_CATEGORY_CONFIG[category] ?? DEFAULT_TOOL_CONFIG;
}

export function getMergedToolConfig(
  category: string,
  customConfigs: CustomToolFieldConfig[] = []
): ToolFieldConfig {
  const custom = customConfigs.find((c) => c.categoryKey === category);
  if (custom) return custom;
  return getToolConfig(category);
}

export function getCategoriesFromTools(
  tools: { category: string }[],
  customConfigs: CustomToolFieldConfig[] = []
): string[] {
  const cats = new Set<string>();
  for (const tool of tools) cats.add(tool.category);
  for (const cfg of customConfigs) {
    if (tools.some((t) => t.category === cfg.categoryKey)) cats.add(cfg.categoryKey);
  }
  return Array.from(cats);
}

/** Returns true if a tool has any non-empty field besides name */
export function toolHasExtraFields(tool: Record<string, string>, config: ToolFieldConfig): boolean {
  for (const f of config.fields) {
    if (f.key === "name") continue;
    const val = tool[f.key === "amount" ? "quantity" : f.key];
    if (val !== undefined && val !== null && String(val).trim() !== "") return true;
  }
  return false;
}
