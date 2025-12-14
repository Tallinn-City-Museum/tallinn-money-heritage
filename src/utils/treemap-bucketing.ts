import { AggregatedCoinMeta } from "../data/entity/aggregated-meta";

const DEFAULT_CHUNK_SIZE = 6;

export const OTHER_KEY = "__other__"
export const BACK_KEY = "__back__"

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

    // calculate the so called "others" count for each bucket
    let countSums = items.map(v => v.count);
    for (let i = countSums.length - 1; i >= 0; i--)
        if (i != countSums.length - 1)
            countSums[i] += countSums[i+1]

    const buckets: AggregatedCoinMeta[][] = []
    let currentBucket: AggregatedCoinMeta[] = []
    for (let i = 0; i < items.length; i++) {
        // flush the currentBucket if new bucket should be created
        if (i % chunkSize === 0 && currentBucket.length !== 0) {
            currentBucket.push({
                key: OTHER_KEY,
                label: "Muud",
                count: countSums[i],
                available: true
            });
            buckets.push(currentBucket);
            currentBucket = [];
        }

        currentBucket.push(items[i]);
    }

    if (currentBucket.length !== 0) {
        currentBucket.push({
            key: BACK_KEY,
            label: "Tagasi",
            count: currentBucket.length > 0 ? currentBucket[currentBucket.length-1].count : 1,
            available: true
        })
        buckets.push(currentBucket)
    }

    return buckets;
}