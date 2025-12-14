import { AggregatedCoinMeta } from "../data/entity/aggregated-meta";

const DEFAULT_CHUNK_SIZE = 6;

/**
 * Utility function, which splits provided items into buckets
 * by descending count order
 *
 * @param items specifies the array of AggregatedCoinMetas to bucket
 * @param chunkSize specifies the maximum bucket size
 * @returns a 2D array of bucketed items
 */
export default function buildTreemapBuckets(
    items: AggregatedCoinMeta[],
    chunkSize: number = DEFAULT_CHUNK_SIZE
): AggregatedCoinMeta[][] {
    // sort the array in descending order by its count
    items.sort((a, b) => b.count - a.count);

    const buckets: AggregatedCoinMeta[][] = []
    let currentBucket: AggregatedCoinMeta[] = []
    for (let i = 0; i < items.length; i++) {
        // flush the currentBucket if new bucket should be created
        if (i % chunkSize === 0 && currentBucket.length !== 0) {
            buckets.push(currentBucket);
            currentBucket = [];
        }

        currentBucket.push(items[i]);
    }

    if (currentBucket.length !== 0)
        buckets.push(currentBucket)

    return buckets;
}