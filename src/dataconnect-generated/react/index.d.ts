import { CoinMeta2ByIdData, CoinMeta2ByIdVariables, CoinByIdData, CoinByIdVariables, CoinMeta2CountData, CoinCountData, ListCoinsByFilterData, ListCoinsByFilterVariables, CoinFilterDataData, MaterialStatsData, RegionStatsData, NominalStatsData, NameStatsData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCoinMeta2ById(vars: CoinMeta2ByIdVariables, options?: useDataConnectQueryOptions<CoinMeta2ByIdData>): UseDataConnectQueryResult<CoinMeta2ByIdData, CoinMeta2ByIdVariables>;
export function useCoinMeta2ById(dc: DataConnect, vars: CoinMeta2ByIdVariables, options?: useDataConnectQueryOptions<CoinMeta2ByIdData>): UseDataConnectQueryResult<CoinMeta2ByIdData, CoinMeta2ByIdVariables>;

export function useCoinById(vars: CoinByIdVariables, options?: useDataConnectQueryOptions<CoinByIdData>): UseDataConnectQueryResult<CoinByIdData, CoinByIdVariables>;
export function useCoinById(dc: DataConnect, vars: CoinByIdVariables, options?: useDataConnectQueryOptions<CoinByIdData>): UseDataConnectQueryResult<CoinByIdData, CoinByIdVariables>;

export function useCoinMeta2Count(options?: useDataConnectQueryOptions<CoinMeta2CountData>): UseDataConnectQueryResult<CoinMeta2CountData, undefined>;
export function useCoinMeta2Count(dc: DataConnect, options?: useDataConnectQueryOptions<CoinMeta2CountData>): UseDataConnectQueryResult<CoinMeta2CountData, undefined>;

export function useCoinCount(options?: useDataConnectQueryOptions<CoinCountData>): UseDataConnectQueryResult<CoinCountData, undefined>;
export function useCoinCount(dc: DataConnect, options?: useDataConnectQueryOptions<CoinCountData>): UseDataConnectQueryResult<CoinCountData, undefined>;

export function useListCoinsByFilter(vars?: ListCoinsByFilterVariables, options?: useDataConnectQueryOptions<ListCoinsByFilterData>): UseDataConnectQueryResult<ListCoinsByFilterData, ListCoinsByFilterVariables>;
export function useListCoinsByFilter(dc: DataConnect, vars?: ListCoinsByFilterVariables, options?: useDataConnectQueryOptions<ListCoinsByFilterData>): UseDataConnectQueryResult<ListCoinsByFilterData, ListCoinsByFilterVariables>;

export function useCoinFilterData(options?: useDataConnectQueryOptions<CoinFilterDataData>): UseDataConnectQueryResult<CoinFilterDataData, undefined>;
export function useCoinFilterData(dc: DataConnect, options?: useDataConnectQueryOptions<CoinFilterDataData>): UseDataConnectQueryResult<CoinFilterDataData, undefined>;

export function useMaterialStats(options?: useDataConnectQueryOptions<MaterialStatsData>): UseDataConnectQueryResult<MaterialStatsData, undefined>;
export function useMaterialStats(dc: DataConnect, options?: useDataConnectQueryOptions<MaterialStatsData>): UseDataConnectQueryResult<MaterialStatsData, undefined>;

export function useRegionStats(options?: useDataConnectQueryOptions<RegionStatsData>): UseDataConnectQueryResult<RegionStatsData, undefined>;
export function useRegionStats(dc: DataConnect, options?: useDataConnectQueryOptions<RegionStatsData>): UseDataConnectQueryResult<RegionStatsData, undefined>;

export function useNominalStats(options?: useDataConnectQueryOptions<NominalStatsData>): UseDataConnectQueryResult<NominalStatsData, undefined>;
export function useNominalStats(dc: DataConnect, options?: useDataConnectQueryOptions<NominalStatsData>): UseDataConnectQueryResult<NominalStatsData, undefined>;

export function useNameStats(options?: useDataConnectQueryOptions<NameStatsData>): UseDataConnectQueryResult<NameStatsData, undefined>;
export function useNameStats(dc: DataConnect, options?: useDataConnectQueryOptions<NameStatsData>): UseDataConnectQueryResult<NameStatsData, undefined>;
