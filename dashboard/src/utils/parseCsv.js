export function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = parseCsvLine(lines[i]);
    if (parts.length !== headers.length) continue;
    const row = {};
    headers.forEach((h, j) => {
      row[h] = parts[j];
    });
    rows.push(row);
  }
  return rows;
}

export function rowYear(timeStr) {
  if (!timeStr) return null;
  const d = new Date(timeStr);
  const y = d.getFullYear();
  return Number.isFinite(y) ? y : null;
}
