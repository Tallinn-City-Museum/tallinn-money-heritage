import { ConnectorConfig, DataConnect, QueryRef, QueryPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CoinByIdData {
  coinMetas: ({
    id: Int64String;
    muisId: number;
    title: string;
    description?: string | null;
    date?: string | null;
    diameterMm: number;
  } & CoinMeta_Key)[];
}

export interface CoinByIdVariables {
  id: Int64String;
}

export interface CoinCountData {
  coinMeta?: {
    id_count: number;
  };
}

export interface CoinMeta2byIdData {
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

export interface CoinMeta2byIdVariables {
  id: Int64String;
}

export interface CoinMeta2countData {
  coinMetas2?: {
    id_count: number;
  };
}

export interface CoinMeta_Key {
  muisId: number;
  __typename?: 'CoinMeta_Key';
}

export interface CoinMetas2_Key {
  id: Int64String;
  __typename?: 'CoinMetas2_Key';
}

export interface MaterialStatsData {
  coinMetas2s: ({
    material?: string | null;
    _count: number;
  })[];
}

export interface NameStatsData {
  coinMetas2s: ({
    lemmaName?: string | null;
    _count: number;
  })[];
}

export interface NominalStatsData {
  coinMetas2s: ({
    nomValue?: string | null;
    _count: number;
  })[];
}

export interface RegionStatsData {
  coinMetas2s: ({
    region?: string | null;
    _count: number;
  })[];
}

interface MaterialStatsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<MaterialStatsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<MaterialStatsData, undefined>;
  operationName: string;
}
export const materialStatsRef: MaterialStatsRef;

export function materialStats(): QueryPromise<MaterialStatsData, undefined>;
export function materialStats(dc: DataConnect): QueryPromise<MaterialStatsData, undefined>;

interface RegionStatsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<RegionStatsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<RegionStatsData, undefined>;
  operationName: string;
}
export const regionStatsRef: RegionStatsRef;

export function regionStats(): QueryPromise<RegionStatsData, undefined>;
export function regionStats(dc: DataConnect): QueryPromise<RegionStatsData, undefined>;

interface NominalStatsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<NominalStatsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<NominalStatsData, undefined>;
  operationName: string;
}
export const nominalStatsRef: NominalStatsRef;

export function nominalStats(): QueryPromise<NominalStatsData, undefined>;
export function nominalStats(dc: DataConnect): QueryPromise<NominalStatsData, undefined>;

interface NameStatsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<NameStatsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<NameStatsData, undefined>;
  operationName: string;
}
export const nameStatsRef: NameStatsRef;

export function nameStats(): QueryPromise<NameStatsData, undefined>;
export function nameStats(dc: DataConnect): QueryPromise<NameStatsData, undefined>;

interface CoinMeta2byIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CoinMeta2byIdVariables): QueryRef<CoinMeta2byIdData, CoinMeta2byIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CoinMeta2byIdVariables): QueryRef<CoinMeta2byIdData, CoinMeta2byIdVariables>;
  operationName: string;
}
export const coinMeta2byIdRef: CoinMeta2byIdRef;

export function coinMeta2byId(vars: CoinMeta2byIdVariables): QueryPromise<CoinMeta2byIdData, CoinMeta2byIdVariables>;
export function coinMeta2byId(dc: DataConnect, vars: CoinMeta2byIdVariables): QueryPromise<CoinMeta2byIdData, CoinMeta2byIdVariables>;

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

interface CoinMeta2countRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<CoinMeta2countData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<CoinMeta2countData, undefined>;
  operationName: string;
}
export const coinMeta2countRef: CoinMeta2countRef;

export function coinMeta2count(): QueryPromise<CoinMeta2countData, undefined>;
export function coinMeta2count(dc: DataConnect): QueryPromise<CoinMeta2countData, undefined>;

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

