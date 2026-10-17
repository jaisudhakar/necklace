// Live gold price for the rate bar. Fetched in the visitor's browser from a
// free, key-less public feed (USD per troy ounce of 24K), converted to
// per-gram prices by purity. If the feed can't be reached the bar simply
// shows its other messages.

export const GOLD_FEED_URL = "https://api.gold-api.com/price/XAU";
const GRAMS_PER_TROY_OUNCE = 31.1035;
const CACHE_KEY = "ll-gold-rate";
const CACHE_MS = 10 * 60 * 1000;

export type GoldRates = { k24: number; k22: number; k18: number; at: number };

export async function fetchGoldRates(): Promise<GoldRates | null> {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) ?? "null") as GoldRates | null;
    if (cached && Date.now() - cached.at < CACHE_MS) return cached;
  } catch {
    /* storage unavailable: just fetch */
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(GOLD_FEED_URL, { signal: ctrl.signal });
    if (!res.ok) return null;
    const { price } = (await res.json()) as { price?: number };
    if (!price || !Number.isFinite(price)) return null;
    const perGram = price / GRAMS_PER_TROY_OUNCE;
    const rates = { k24: perGram, k22: perGram * (22 / 24), k18: perGram * 0.75, at: Date.now() };
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(rates));
    } catch {
      /* ignore */
    }
    return rates;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
