/**
 * Base type for all aggregation 
 */
export type AggregatedCoinMeta = {
    key: string;
    label: string;
    count: number;
    available?: boolean;
    availableCount?: number;
};

export type CoinFilterRow = {
    country?: string;
    material?: string;
    nominal?: string;
    name?: string;
    period?: string;
}

export type MaterialStat = AggregatedCoinMeta;
export type CountryStat = AggregatedCoinMeta;
export type NominalStat = AggregatedCoinMeta;
export type NameStat = AggregatedCoinMeta;
export type PeriodStat = AggregatedCoinMeta;
