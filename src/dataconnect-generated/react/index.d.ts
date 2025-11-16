import { CoinByIdData, CoinByIdVariables, CoinCountData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCoinById(vars: CoinByIdVariables, options?: useDataConnectQueryOptions<CoinByIdData>): UseDataConnectQueryResult<CoinByIdData, CoinByIdVariables>;
export function useCoinById(dc: DataConnect, vars: CoinByIdVariables, options?: useDataConnectQueryOptions<CoinByIdData>): UseDataConnectQueryResult<CoinByIdData, CoinByIdVariables>;

export function useCoinCount(options?: useDataConnectQueryOptions<CoinCountData>): UseDataConnectQueryResult<CoinCountData, undefined>;
export function useCoinCount(dc: DataConnect, options?: useDataConnectQueryOptions<CoinCountData>): UseDataConnectQueryResult<CoinCountData, undefined>;
