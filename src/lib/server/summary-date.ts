import { listActiveGA4SourceConfigs } from './db/metric-sources';
import type { ProductRollupDate } from './db/summaries';
import { DEFAULT_TIME_ZONE, currentDateInTimeZone } from './dates';

export function chooseCompanySummaryDate(dates: string[]): string {
  const counts = new Map<string, number>();
  for (const date of dates) {
    counts.set(date, (counts.get(date) ?? 0) + 1);
  }

  return (
    [...counts.entries()].sort(
      ([dateA, countA], [dateB, countB]) =>
        countB - countA || dateB.localeCompare(dateA)
    )[0]?.[0] ?? currentDateInTimeZone(DEFAULT_TIME_ZONE)
  );
}

export async function getCurrentGA4ProductRollupDates(
  now = new Date()
): Promise<ProductRollupDate[]> {
  const sources = await listActiveGA4SourceConfigs();
  return sources.flatMap((source) => {
    try {
      return [
        {
          productSlug: source.productSlug,
          rollupDate: currentDateInTimeZone(
            source.timezone || DEFAULT_TIME_ZONE,
            now
          )
        }
      ];
    } catch {
      return [];
    }
  });
}

export async function getCurrentCompanySummaryDate(
  now = new Date()
): Promise<string> {
  const rollupDates = await getCurrentGA4ProductRollupDates(now);
  return chooseCompanySummaryDate(
    rollupDates.map((rollupDate) => rollupDate.rollupDate)
  );
}
