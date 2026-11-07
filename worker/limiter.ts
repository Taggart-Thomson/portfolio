// Usage limits for the chat: a per-visitor hourly limit and a site-wide daily cap.
// One Durable Object instance holds the counters. Visitors are counted by a salted hash of
// their IP address, so no IP address is ever stored. Counters for past hours and days are deleted.
import { DurableObject } from "cloudflare:workers";

export interface LimitResult {
  ok: boolean;
  reason?: "visitor" | "daily";
}

export class Limiter extends DurableObject {
  async check(visitor: string, perHour: number, perDay: number): Promise<LimitResult> {
    const now = new Date();
    const day = now.toISOString().slice(0, 10);
    const hour = now.toISOString().slice(0, 13);
    const dayKey = `day:${day}`;
    const visitorKey = `v:${hour}:${visitor}`;

    const s = this.ctx.storage;
    const [dayCount = 0, visitorCount = 0] = await Promise.all([s.get<number>(dayKey), s.get<number>(visitorKey)]);
    if (dayCount >= perDay) return { ok: false, reason: "daily" };
    if (visitorCount >= perHour) return { ok: false, reason: "visitor" };

    await s.put({ [dayKey]: dayCount + 1, [visitorKey]: visitorCount + 1 });
    await this.cleanup(day, hour);
    return { ok: true };
  }

  // At most once an hour, delete counters from earlier hours and days.
  private async cleanup(day: string, hour: string) {
    const s = this.ctx.storage;
    if ((await s.get<string>("cleaned")) === hour) return;
    const stale: string[] = [];
    for (const key of (await s.list()).keys()) {
      if (key === "cleaned") continue;
      if (key.startsWith("day:") && key !== `day:${day}`) stale.push(key);
      if (key.startsWith("v:") && !key.startsWith(`v:${hour}:`)) stale.push(key);
    }
    for (let i = 0; i < stale.length; i += 128) await s.delete(stale.slice(i, i + 128));
    await s.put("cleaned", hour);
  }
}
