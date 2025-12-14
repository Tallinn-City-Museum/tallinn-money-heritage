import { AggregatedCoinMeta } from "../data/entity/aggregated-meta";
import buildTreemapBuckets, { BACK_KEY, OTHER_KEY } from "../utils/treemap-bucketing";

/**
 * Simple unit test to verify whether treemap bucketing works as expected
 */
test('Bucketing works as expected', async () => {
    const testData: AggregatedCoinMeta[] = [
        {
            key: "key1",
            label: "label1",
            count: 19
        },
        {
            key: "key2",
            label: "label2",
            count: 21
        },
        {
            key: "key3",
            label: "label3",
            count: 1
        },
        {
            key: "key4",
            label: "label4",
            count: 50
        },
        {
            key: "key5",
            label: "label5",
            count: 100
        },
    ]

    const res = buildTreemapBuckets(testData, 2);
    expect(res.length).toEqual(3);
    expect(res.map(v => v.map(v2 => v2.key).filter(v => v != OTHER_KEY && v != BACK_KEY)).flat(1)).toEqual(["key5", "key4", "key2", "key1", "key3"])
});