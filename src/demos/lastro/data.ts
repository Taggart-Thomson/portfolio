// Sample data for the Lastro demo. Holdings, prices, headlines, suggestions,
// conversations and costs are all invented. Not financial advice.

export interface Position { ticker: string; name: string; cls: string; qty: number; avg: number; price: number | null; note?: string }
export const POSITIONS: Position[] = [
  { ticker: "BOVA11", name: "Ibovespa ETF", cls: "ETF", qty: 40, avg: 118.2, price: 124.85 },
  { ticker: "IVVB11", name: "S&P 500 ETF (BRL)", cls: "ETF", qty: 15, avg: 310.0, price: 342.1 },
  { ticker: "ITUB4", name: "Bank stock", cls: "Stock", qty: 100, avg: 30.4, price: 33.12 },
  { ticker: "WEGE3", name: "Industrial stock", cls: "Stock", qty: 60, avg: 41.8, price: 39.55 },
  { ticker: "HGLG11", name: "Logistics FII", cls: "FII", qty: 20, avg: 158.0, price: 161.4 },
  { ticker: "Tesouro Selic 2029", name: "Government bond", cls: "Bond", qty: 0.8, avg: 15420, price: null, note: "Bond prices aren't fetched yet, so this isn't valued." },
  { ticker: "BTC", name: "Bitcoin", cls: "Crypto", qty: 0.0015, avg: 480000, price: 512300 },
];

export const MARKET = [
  { name: "Ibovespa", value: "128.410 pts", move: 0.62 },
  { name: "S&P 500", value: "5.912 pts", move: -0.18 },
  { name: "USD/BRL", value: "R$ 5,41", move: 0.25 },
  { name: "Bitcoin", value: "R$ 512.300", move: 1.9 },
];

export interface Suggestion { action: "Buy" | "Hold" | "Trim"; ticker: string; why: string; sources: string[] }
export const SUGGESTIONS: Suggestion[] = [
  { action: "Buy", ticker: "IVVB11", why: "Brazil is about 70% of the portfolio. Adding S&P 500 exposure in reais spreads the risk without leaving B3.", sources: ["Allocation", "Sample headline 2"] },
  { action: "Buy", ticker: "Tesouro IPCA+ 2035", why: "No inflation-linked bond yet. A long IPCA+ bond protects the budget against inflation.", sources: ["Positions", "Sample headline 1"] },
  { action: "Hold", ticker: "WEGE3", why: "Down about 5% from average cost, but the sample news gives no reason to sell.", sources: ["Sample headline 4"] },
];
export const REJECTED = [{ ticker: "VOO", reason: "US-listed ETF, not buyable on B3. Rejected before saving; the rest of the analysis was kept." }];

export const NEWS = [
  "Sample headline 1: Inflation expectations edge higher in weekly survey",
  "Sample headline 2: Real holds steady against the dollar",
  "Sample headline 3: Retail sales data due Thursday",
  "Sample headline 4: Industrial orders flat for the quarter",
  "Sample headline 5: Logistics fund vacancies fall slightly",
];

export const DEFAULT_BUDGET = 3000;
export const MONTH = "November 2026";

export interface Run { at: string; input: number; cached: number; output: number; cost: number; ok: boolean; note?: string }
export const RUNS: Run[] = [
  { at: "Nov 7, 11:00", input: 3120, cached: 9800, output: 910, cost: 0.021, ok: true },
  { at: "Nov 7, 12:00", input: 3240, cached: 9800, output: 880, cost: 0.021, ok: true },
  { at: "Nov 7, 13:00", input: 2100, cached: 9800, output: 0, cost: 0.006, ok: false, note: "News feed timed out after the model call started. Logged anyway." },
  { at: "Nov 7, 14:00", input: 3310, cached: 9800, output: 940, cost: 0.022, ok: true },
  { at: "Nov 7, 15:00", input: 3190, cached: 9800, output: 905, cost: 0.021, ok: true },
  { at: "Nov 7, 16:00", input: 3275, cached: 9800, output: 925, cost: 0.022, ok: true },
];
export const MONTH_COST = 2.84; // sample, USD, month to date

export interface Memory { kind: "budget" | "instruction" | "note"; text: string; said?: string; when: string }
export const MEMORY: Memory[] = [
  { kind: "instruction", text: "Keep crypto under 5% of the portfolio.", when: "Oct 12" },
  { kind: "instruction", text: "No single stock above 20%.", when: "Oct 12" },
  { kind: "note", text: "Prefers ETFs over picking individual stocks.", when: "Oct 20" },
];

export interface Turn { who: "you" | "advisor"; text: string }
export const HISTORY: Turn[] = [
  { who: "you", text: "Keep crypto under 5% of the portfolio." },
  { who: "advisor", text: "Saved as a standing instruction. Crypto is {CRYPTO} of the sample portfolio today, under the limit." },
];
