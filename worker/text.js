// Shared tokenizer for the knowledge index (build time) and retrieval (in the Worker).
// Plain JS so both Node and the Worker can import it.

const STOP = new Set(
  ("a an and are as at be been but by can could did do does for from had has have he her his how i if in into is it its " +
    "me my of on or our she so than that the their them then there these they this to was we were what when where which " +
    "who whom why will with would you your about any also just more most not only over such very taggart thomson tell " +
    "him himself he's does did has have").split(" "),
);

// Light stemming: enough to match "schedulers" with "scheduler" and "automated" with "automation".
function stem(w) {
  if (w.length > 5 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 5 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith("ed")) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith("es") && !w.endsWith("ses")) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}

export function tokenize(s) {
  return s
    .normalize("NFD").replace(/\p{M}/gu, "")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w && w.length > 1 && !STOP.has(w))
    .map(stem);
}
