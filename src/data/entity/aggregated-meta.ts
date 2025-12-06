/**
 * Base type for all aggregation 
 */
export type AggregatedCoinMeta = {
    key: string;
    label: string;
    count: number;
};

export type MaterialStat = AggregatedCoinMeta;
export type CountryStat = AggregatedCoinMeta;
export type NominalStat = AggregatedCoinMeta;
export type NameStat = AggregatedCoinMeta;