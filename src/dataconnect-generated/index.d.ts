import { ConnectorConfig, DataConnect, QueryRef, QueryPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CoinByIdData {
  coinMetas2s: ({
    id: Int64String;
    muisId: Int64String;
    ref: string;
    name: string;
    date?: string | null;
    material?: string | null;
    diameter: number;
    region?: string | null;
    nomValue?: string | null;
    lemmaName?: string | null;
  } & CoinMetas2_Key)[];
}

export interface CoinByIdVariables {
  id: Int64String;
}

export interface CoinCountData {
  coinMetas2?: {
    id_count: number;
  };
}

export interface CoinMetas2_Key {
  id: Int64String;
  __typename?: 'CoinMetas2_Key';
}

interface CoinByIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CoinByIdVariables): QueryRef<CoinByIdData, CoinByIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CoinByIdVariables): QueryRef<CoinByIdData, CoinByIdVariables>;
  operationName: string;
}
export const coinByIdRef: CoinByIdRef;

export function coinById(vars: CoinByIdVariables): QueryPromise<CoinByIdData, CoinByIdVariables>;
export function coinById(dc: DataConnect, vars: CoinByIdVariables): QueryPromise<CoinByIdData, CoinByIdVariables>;

interface CoinCountRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<CoinCountData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<CoinCountData, undefined>;
  operationName: string;
}
export const coinCountRef: CoinCountRef;

export function coinCount(): QueryPromise<CoinCountData, undefined>;
export function coinCount(dc: DataConnect): QueryPromise<CoinCountData, undefined>;

