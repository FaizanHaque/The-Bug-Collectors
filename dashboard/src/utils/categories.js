/**
 * Broad groups for filtering (common names). Order = display order.
 */
export const BROAD_GROUPS = [
  {
    id: "mackerel_tuna",
    label: "Mackerel & tunas",
    match: (n) => /mackerel|tuna|bonito|wahoo|skipjack/i.test(n),
  },
  {
    id: "salmon_trout",
    label: "Salmon & trout",
    match: (n) => /salmon|trout|steelhead|char\b/i.test(n),
  },
  {
    id: "flatfish",
    label: "Flatfish & soles",
    match: (n) => /sole|sanddab|flounder|halibut|turbot|plaice|dab\b/i.test(n),
  },
  {
    id: "rockfish",
    label: "Rockfishes",
    match: (n) => /rockfish|sebastes|bocaccio|chilipepper|shortbelly/i.test(n),
  },
  {
    id: "lanternfish",
    label: "Lanternfishes & allies",
    match: (n) =>
      /lanternfish|lampfish|flashlight|lightfish|myctoph|dogtooth|northern lampfish|california lanternfish|blue lanternfish/i.test(
        n
      ),
  },
  {
    id: "anchovy_herring",
    label: "Anchovy & herring-like",
    match: (n) => /anchovy|herring|sardine|sprat|pilchard/i.test(n),
  },
  {
    id: "hake_cod",
    label: "Hake & cod-like",
    match: (n) => /hake|cod\b|pollock|whiting/i.test(n),
  },
  {
    id: "smelt_argentine",
    label: "Smelts & argentines",
    match: (n) => /smelt|argentine|pencilsmelt|smoothtongue|blacksmelt/i.test(n),
  },
  {
    id: "hatchetfish",
    label: "Hatchetfishes",
    match: (n) => /hatchetfish/i.test(n),
  },
  {
    id: "dragon_viper",
    label: "Dragonfish & viperfish",
    match: (n) => /dragon|viperfish|blackdragon/i.test(n),
  },
  {
    id: "barracudina",
    label: "Barracudinas",
    match: (n) => /barracudin/i.test(n),
  },
  {
    id: "other_pelagic",
    label: "Other mesopelagic",
    match: () => false,
  },
];

export function groupsForCommonName(name) {
  const n = (name || "").trim();
  if (!n) return ["other_pelagic"];
  const hits = [];
  for (const g of BROAD_GROUPS) {
    if (g.id === "other_pelagic") continue;
    if (g.match(n)) hits.push(g.id);
  }
  if (hits.length === 0) hits.push("other_pelagic");
  return hits;
}

export function speciesInGroup(groupId, allCommonNames) {
  return allCommonNames.filter((name) => {
    const g = groupsForCommonName(name);
    if (groupId === "other_pelagic") {
      return g.includes("other_pelagic") && g.length === 1;
    }
    return g.includes(groupId);
  });
}
