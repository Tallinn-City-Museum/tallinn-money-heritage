import { AggregatedCoinMeta } from "../data/entity/aggregated-meta";

const CHUNK_SIZE = 6;

const chunkArray = <T,>(items: T[], size = CHUNK_SIZE) => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const sumCounts = (items: AggregatedCoinMeta[]) =>
  items.reduce((sum, item) => sum + (item.count || 1), 0);

const sumAvailableCounts = (items: AggregatedCoinMeta[]) =>
  items.reduce((sum, item) => sum + (item.availableCount ?? 0), 0);

const normalizeCount = (count: number) => Math.max(1, count);

export type LayeredBuckets = {
  primary: AggregatedCoinMeta[];
  pages: AggregatedCoinMeta[][];
  moreIndicators: (AggregatedCoinMeta | null)[];
  normalizedActive: string;
  hasOthers: boolean;
};

export const buildLayeredBuckets = (
  items: AggregatedCoinMeta[],
  activeKey: string,
  primarySize = 6
): LayeredBuckets => {
  const filtered = [...items];
  const primary = filtered.slice(0, primarySize);
  const others = filtered.slice(primarySize);
  const pages = chunkArray(others, primarySize);

  const totalOtherCount = normalizeCount(sumCounts(others));
  const otherAvailableCount = sumAvailableCounts(others);

  const aggregatedOther =
    others.length > 0
      ? {
          key: "__other__",
          label: "Muud",
          count: totalOtherCount,
          available: otherAvailableCount > 0,
          availableCount: otherAvailableCount,
        }
      : null;

  const primaryWithOther = aggregatedOther ? [...primary, aggregatedOther] : primary;

  const normalizedActive = primaryWithOther.some((item) => item.key === activeKey)
    ? activeKey
    : others.some((item) => item.key === activeKey)
    ? "__other__"
    : activeKey;

  const moreIndicators = pages.map((_, idx) => {
    const remaining = pages.slice(idx + 1).reduce<AggregatedCoinMeta[]>(
      (acc, page) => acc.concat(page),
      []
    );
    if (!remaining.length) return null;
    const remainingCount = normalizeCount(sumCounts(remaining));
    const remainingAvailable = sumAvailableCounts(remaining);
    return {
      key: "__more__",
      label: "Muud",
      count: remainingCount,
      available: remainingAvailable > 0,
      availableCount: remainingAvailable,
    };
  });

  return {
    primary: primaryWithOther,
    pages,
    moreIndicators,
    normalizedActive,
    hasOthers: others.length > 0,
  };
};
