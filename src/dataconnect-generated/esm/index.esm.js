import { queryRef, executeQuery, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'coin-discoverer-service',
  location: 'europe-north1'
};

export const coinMeta2countRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'CoinMeta2Count');
}
coinMeta2countRef.operationName = 'CoinMeta2Count';

export function coinMeta2count(dc) {
  return executeQuery(coinMeta2countRef(dc));
}

export const coinCountRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'CoinCount');
}
coinCountRef.operationName = 'CoinCount';

export function coinCount(dc) {
  return executeQuery(coinCountRef(dc));
}

export const coinMeta2byIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'CoinMeta2ById', inputVars);
}
coinMeta2byIdRef.operationName = 'CoinMeta2ById';

export function coinMeta2byId(dcOrVars, vars) {
  return executeQuery(coinMeta2byIdRef(dcOrVars, vars));
}

export const coinByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'CoinById', inputVars);
}
coinByIdRef.operationName = 'CoinById';

export function coinById(dcOrVars, vars) {
  return executeQuery(coinByIdRef(dcOrVars, vars));
}

