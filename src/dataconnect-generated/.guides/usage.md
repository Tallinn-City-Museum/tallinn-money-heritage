# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCoinMeta2ById, useCoinById, useCoinMeta2Count, useCoinCount, useListCoinsByFilter, useCoinFilterData, useMaterialStats, useRegionStats, useNominalStats, useNameStats } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCoinMeta2ById(coinMeta2ByIdVars);

const { data, isPending, isSuccess, isError, error } = useCoinById(coinByIdVars);

const { data, isPending, isSuccess, isError, error } = useCoinMeta2Count();

const { data, isPending, isSuccess, isError, error } = useCoinCount();

const { data, isPending, isSuccess, isError, error } = useListCoinsByFilter(listCoinsByFilterVars);

const { data, isPending, isSuccess, isError, error } = useCoinFilterData();

const { data, isPending, isSuccess, isError, error } = useMaterialStats();

const { data, isPending, isSuccess, isError, error } = useRegionStats();

const { data, isPending, isSuccess, isError, error } = useNominalStats();

const { data, isPending, isSuccess, isError, error } = useNameStats();

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { coinMeta2ById, coinById, coinMeta2Count, coinCount, listCoinsByFilter, coinFilterData, materialStats, regionStats, nominalStats, nameStats } from '@dataconnect/generated';


// Operation CoinMeta2ById:  For variables, look at type CoinMeta2ByIdVars in ../index.d.ts
const { data } = await CoinMeta2ById(dataConnect, coinMeta2ByIdVars);

// Operation CoinById:  For variables, look at type CoinByIdVars in ../index.d.ts
const { data } = await CoinById(dataConnect, coinByIdVars);

// Operation CoinMeta2Count: 
const { data } = await CoinMeta2Count(dataConnect);

// Operation CoinCount: 
const { data } = await CoinCount(dataConnect);

// Operation ListCoinsByFilter:  For variables, look at type ListCoinsByFilterVars in ../index.d.ts
const { data } = await ListCoinsByFilter(dataConnect, listCoinsByFilterVars);

// Operation CoinFilterData: 
const { data } = await CoinFilterData(dataConnect);

// Operation MaterialStats: 
const { data } = await MaterialStats(dataConnect);

// Operation RegionStats: 
const { data } = await RegionStats(dataConnect);

// Operation NominalStats: 
const { data } = await NominalStats(dataConnect);

// Operation NameStats: 
const { data } = await NameStats(dataConnect);


```