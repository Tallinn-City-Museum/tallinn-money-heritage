# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*CoinMeta2ById*](#coinmeta2byid)
  - [*CoinById*](#coinbyid)
  - [*CoinMeta2Count*](#coinmeta2count)
  - [*CoinCount*](#coincount)
  - [*CoinFilterData*](#coinfilterdata)
  - [*MaterialStats*](#materialstats)
  - [*RegionStats*](#regionstats)
  - [*NominalStats*](#nominalstats)
  - [*NameStats*](#namestats)
- [**Mutations**](#mutations)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## CoinMeta2ById
You can execute the `CoinMeta2ById` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
coinMeta2byId(vars: CoinMeta2byIdVariables): QueryPromise<CoinMeta2byIdData, CoinMeta2byIdVariables>;

interface CoinMeta2byIdRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CoinMeta2byIdVariables): QueryRef<CoinMeta2byIdData, CoinMeta2byIdVariables>;
}
export const coinMeta2byIdRef: CoinMeta2byIdRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
coinMeta2byId(dc: DataConnect, vars: CoinMeta2byIdVariables): QueryPromise<CoinMeta2byIdData, CoinMeta2byIdVariables>;

interface CoinMeta2byIdRef {
  ...
  (dc: DataConnect, vars: CoinMeta2byIdVariables): QueryRef<CoinMeta2byIdData, CoinMeta2byIdVariables>;
}
export const coinMeta2byIdRef: CoinMeta2byIdRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the coinMeta2byIdRef:
```typescript
const name = coinMeta2byIdRef.operationName;
console.log(name);
```

### Variables
The `CoinMeta2ById` query requires an argument of type `CoinMeta2byIdVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CoinMeta2byIdVariables {
  id: Int64String;
}
```
### Return Type
Recall that executing the `CoinMeta2ById` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CoinMeta2byIdData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `CoinMeta2ById`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, coinMeta2byId, CoinMeta2byIdVariables } from '@dataconnect/generated';

// The `CoinMeta2ById` query requires an argument of type `CoinMeta2byIdVariables`:
const coinMeta2byIdVars: CoinMeta2byIdVariables = {
  id: ..., 
};

// Call the `coinMeta2byId()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await coinMeta2byId(coinMeta2byIdVars);
// Variables can be defined inline as well.
const { data } = await coinMeta2byId({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await coinMeta2byId(dataConnect, coinMeta2byIdVars);

console.log(data.coinMetas2s);

// Or, you can use the `Promise` API.
coinMeta2byId(coinMeta2byIdVars).then((response) => {
  const data = response.data;
  console.log(data.coinMetas2s);
});
```

### Using `CoinMeta2ById`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, coinMeta2byIdRef, CoinMeta2byIdVariables } from '@dataconnect/generated';

// The `CoinMeta2ById` query requires an argument of type `CoinMeta2byIdVariables`:
const coinMeta2byIdVars: CoinMeta2byIdVariables = {
  id: ..., 
};

// Call the `coinMeta2byIdRef()` function to get a reference to the query.
const ref = coinMeta2byIdRef(coinMeta2byIdVars);
// Variables can be defined inline as well.
const ref = coinMeta2byIdRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = coinMeta2byIdRef(dataConnect, coinMeta2byIdVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.coinMetas2s);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.coinMetas2s);
});
```

## CoinById
You can execute the `CoinById` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
coinById(vars: CoinByIdVariables): QueryPromise<CoinByIdData, CoinByIdVariables>;

interface CoinByIdRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CoinByIdVariables): QueryRef<CoinByIdData, CoinByIdVariables>;
}
export const coinByIdRef: CoinByIdRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
coinById(dc: DataConnect, vars: CoinByIdVariables): QueryPromise<CoinByIdData, CoinByIdVariables>;

interface CoinByIdRef {
  ...
  (dc: DataConnect, vars: CoinByIdVariables): QueryRef<CoinByIdData, CoinByIdVariables>;
}
export const coinByIdRef: CoinByIdRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the coinByIdRef:
```typescript
const name = coinByIdRef.operationName;
console.log(name);
```

### Variables
The `CoinById` query requires an argument of type `CoinByIdVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CoinByIdVariables {
  id: Int64String;
}
```
### Return Type
Recall that executing the `CoinById` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CoinByIdData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `CoinById`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, coinById, CoinByIdVariables } from '@dataconnect/generated';

// The `CoinById` query requires an argument of type `CoinByIdVariables`:
const coinByIdVars: CoinByIdVariables = {
  id: ..., 
};

// Call the `coinById()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await coinById(coinByIdVars);
// Variables can be defined inline as well.
const { data } = await coinById({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await coinById(dataConnect, coinByIdVars);

console.log(data.coinMetas);

// Or, you can use the `Promise` API.
coinById(coinByIdVars).then((response) => {
  const data = response.data;
  console.log(data.coinMetas);
});
```

### Using `CoinById`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, coinByIdRef, CoinByIdVariables } from '@dataconnect/generated';

// The `CoinById` query requires an argument of type `CoinByIdVariables`:
const coinByIdVars: CoinByIdVariables = {
  id: ..., 
};

// Call the `coinByIdRef()` function to get a reference to the query.
const ref = coinByIdRef(coinByIdVars);
// Variables can be defined inline as well.
const ref = coinByIdRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = coinByIdRef(dataConnect, coinByIdVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.coinMetas);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.coinMetas);
});
```

## CoinMeta2Count
You can execute the `CoinMeta2Count` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
coinMeta2count(): QueryPromise<CoinMeta2countData, undefined>;

interface CoinMeta2countRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<CoinMeta2countData, undefined>;
}
export const coinMeta2countRef: CoinMeta2countRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
coinMeta2count(dc: DataConnect): QueryPromise<CoinMeta2countData, undefined>;

interface CoinMeta2countRef {
  ...
  (dc: DataConnect): QueryRef<CoinMeta2countData, undefined>;
}
export const coinMeta2countRef: CoinMeta2countRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the coinMeta2countRef:
```typescript
const name = coinMeta2countRef.operationName;
console.log(name);
```

### Variables
The `CoinMeta2Count` query has no variables.
### Return Type
Recall that executing the `CoinMeta2Count` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CoinMeta2countData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CoinMeta2countData {
  coinMetas2?: {
    id_count: number;
  };
}
```
### Using `CoinMeta2Count`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, coinMeta2count } from '@dataconnect/generated';


// Call the `coinMeta2count()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await coinMeta2count();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await coinMeta2count(dataConnect);

console.log(data.coinMetas2);

// Or, you can use the `Promise` API.
coinMeta2count().then((response) => {
  const data = response.data;
  console.log(data.coinMetas2);
});
```

### Using `CoinMeta2Count`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, coinMeta2countRef } from '@dataconnect/generated';


// Call the `coinMeta2countRef()` function to get a reference to the query.
const ref = coinMeta2countRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = coinMeta2countRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.coinMetas2);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.coinMetas2);
});
```

## CoinCount
You can execute the `CoinCount` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
coinCount(): QueryPromise<CoinCountData, undefined>;

interface CoinCountRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<CoinCountData, undefined>;
}
export const coinCountRef: CoinCountRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
coinCount(dc: DataConnect): QueryPromise<CoinCountData, undefined>;

interface CoinCountRef {
  ...
  (dc: DataConnect): QueryRef<CoinCountData, undefined>;
}
export const coinCountRef: CoinCountRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the coinCountRef:
```typescript
const name = coinCountRef.operationName;
console.log(name);
```

### Variables
The `CoinCount` query has no variables.
### Return Type
Recall that executing the `CoinCount` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CoinCountData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CoinCountData {
  coinMeta?: {
    id_count: number;
  };
}
```
### Using `CoinCount`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, coinCount } from '@dataconnect/generated';


// Call the `coinCount()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await coinCount();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await coinCount(dataConnect);

console.log(data.coinMeta);

// Or, you can use the `Promise` API.
coinCount().then((response) => {
  const data = response.data;
  console.log(data.coinMeta);
});
```

### Using `CoinCount`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, coinCountRef } from '@dataconnect/generated';


// Call the `coinCountRef()` function to get a reference to the query.
const ref = coinCountRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = coinCountRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.coinMeta);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.coinMeta);
});
```

## CoinFilterData
You can execute the `CoinFilterData` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
coinFilterData(): QueryPromise<CoinFilterDataData, undefined>;

interface CoinFilterDataRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<CoinFilterDataData, undefined>;
}
export const coinFilterDataRef: CoinFilterDataRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
coinFilterData(dc: DataConnect): QueryPromise<CoinFilterDataData, undefined>;

interface CoinFilterDataRef {
  ...
  (dc: DataConnect): QueryRef<CoinFilterDataData, undefined>;
}
export const coinFilterDataRef: CoinFilterDataRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the coinFilterDataRef:
```typescript
const name = coinFilterDataRef.operationName;
console.log(name);
```

### Variables
The `CoinFilterData` query has no variables.
### Return Type
Recall that executing the `CoinFilterData` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CoinFilterDataData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CoinFilterDataData {
  coinMetas2s: ({
    region?: string | null;
    material?: string | null;
    nomValue?: string | null;
    lemmaName?: string | null;
    dateCluster?: string | null;
  })[];
}
```
### Using `CoinFilterData`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, coinFilterData } from '@dataconnect/generated';


// Call the `coinFilterData()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await coinFilterData();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await coinFilterData(dataConnect);

console.log(data.coinMetas2s);

// Or, you can use the `Promise` API.
coinFilterData().then((response) => {
  const data = response.data;
  console.log(data.coinMetas2s);
});
```

### Using `CoinFilterData`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, coinFilterDataRef } from '@dataconnect/generated';


// Call the `coinFilterDataRef()` function to get a reference to the query.
const ref = coinFilterDataRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = coinFilterDataRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.coinMetas2s);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.coinMetas2s);
});
```

## MaterialStats
You can execute the `MaterialStats` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
materialStats(): QueryPromise<MaterialStatsData, undefined>;

interface MaterialStatsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<MaterialStatsData, undefined>;
}
export const materialStatsRef: MaterialStatsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
materialStats(dc: DataConnect): QueryPromise<MaterialStatsData, undefined>;

interface MaterialStatsRef {
  ...
  (dc: DataConnect): QueryRef<MaterialStatsData, undefined>;
}
export const materialStatsRef: MaterialStatsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the materialStatsRef:
```typescript
const name = materialStatsRef.operationName;
console.log(name);
```

### Variables
The `MaterialStats` query has no variables.
### Return Type
Recall that executing the `MaterialStats` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `MaterialStatsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface MaterialStatsData {
  coinMetas2s: ({
    material?: string | null;
    _count: number;
  })[];
}
```
### Using `MaterialStats`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, materialStats } from '@dataconnect/generated';


// Call the `materialStats()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await materialStats();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await materialStats(dataConnect);

console.log(data.coinMetas2s);

// Or, you can use the `Promise` API.
materialStats().then((response) => {
  const data = response.data;
  console.log(data.coinMetas2s);
});
```

### Using `MaterialStats`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, materialStatsRef } from '@dataconnect/generated';


// Call the `materialStatsRef()` function to get a reference to the query.
const ref = materialStatsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = materialStatsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.coinMetas2s);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.coinMetas2s);
});
```

## RegionStats
You can execute the `RegionStats` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
regionStats(): QueryPromise<RegionStatsData, undefined>;

interface RegionStatsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<RegionStatsData, undefined>;
}
export const regionStatsRef: RegionStatsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
regionStats(dc: DataConnect): QueryPromise<RegionStatsData, undefined>;

interface RegionStatsRef {
  ...
  (dc: DataConnect): QueryRef<RegionStatsData, undefined>;
}
export const regionStatsRef: RegionStatsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the regionStatsRef:
```typescript
const name = regionStatsRef.operationName;
console.log(name);
```

### Variables
The `RegionStats` query has no variables.
### Return Type
Recall that executing the `RegionStats` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `RegionStatsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface RegionStatsData {
  coinMetas2s: ({
    region?: string | null;
    _count: number;
  })[];
}
```
### Using `RegionStats`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, regionStats } from '@dataconnect/generated';


// Call the `regionStats()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await regionStats();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await regionStats(dataConnect);

console.log(data.coinMetas2s);

// Or, you can use the `Promise` API.
regionStats().then((response) => {
  const data = response.data;
  console.log(data.coinMetas2s);
});
```

### Using `RegionStats`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, regionStatsRef } from '@dataconnect/generated';


// Call the `regionStatsRef()` function to get a reference to the query.
const ref = regionStatsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = regionStatsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.coinMetas2s);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.coinMetas2s);
});
```

## NominalStats
You can execute the `NominalStats` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
nominalStats(): QueryPromise<NominalStatsData, undefined>;

interface NominalStatsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<NominalStatsData, undefined>;
}
export const nominalStatsRef: NominalStatsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
nominalStats(dc: DataConnect): QueryPromise<NominalStatsData, undefined>;

interface NominalStatsRef {
  ...
  (dc: DataConnect): QueryRef<NominalStatsData, undefined>;
}
export const nominalStatsRef: NominalStatsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the nominalStatsRef:
```typescript
const name = nominalStatsRef.operationName;
console.log(name);
```

### Variables
The `NominalStats` query has no variables.
### Return Type
Recall that executing the `NominalStats` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `NominalStatsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface NominalStatsData {
  coinMetas2s: ({
    nomValue?: string | null;
    _count: number;
  })[];
}
```
### Using `NominalStats`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, nominalStats } from '@dataconnect/generated';


// Call the `nominalStats()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await nominalStats();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await nominalStats(dataConnect);

console.log(data.coinMetas2s);

// Or, you can use the `Promise` API.
nominalStats().then((response) => {
  const data = response.data;
  console.log(data.coinMetas2s);
});
```

### Using `NominalStats`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, nominalStatsRef } from '@dataconnect/generated';


// Call the `nominalStatsRef()` function to get a reference to the query.
const ref = nominalStatsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = nominalStatsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.coinMetas2s);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.coinMetas2s);
});
```

## NameStats
You can execute the `NameStats` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
nameStats(): QueryPromise<NameStatsData, undefined>;

interface NameStatsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<NameStatsData, undefined>;
}
export const nameStatsRef: NameStatsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
nameStats(dc: DataConnect): QueryPromise<NameStatsData, undefined>;

interface NameStatsRef {
  ...
  (dc: DataConnect): QueryRef<NameStatsData, undefined>;
}
export const nameStatsRef: NameStatsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the nameStatsRef:
```typescript
const name = nameStatsRef.operationName;
console.log(name);
```

### Variables
The `NameStats` query has no variables.
### Return Type
Recall that executing the `NameStats` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `NameStatsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface NameStatsData {
  coinMetas2s: ({
    lemmaName?: string | null;
    _count: number;
  })[];
}
```
### Using `NameStats`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, nameStats } from '@dataconnect/generated';


// Call the `nameStats()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await nameStats();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await nameStats(dataConnect);

console.log(data.coinMetas2s);

// Or, you can use the `Promise` API.
nameStats().then((response) => {
  const data = response.data;
  console.log(data.coinMetas2s);
});
```

### Using `NameStats`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, nameStatsRef } from '@dataconnect/generated';


// Call the `nameStatsRef()` function to get a reference to the query.
const ref = nameStatsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = nameStatsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.coinMetas2s);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.coinMetas2s);
});
```

# Mutations

No mutations were generated for the `example` connector.

If you want to learn more about how to use mutations in Data Connect, you can follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

