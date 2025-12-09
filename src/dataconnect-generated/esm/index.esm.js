import { queryRef, executeQuery, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'coin-discoverer-service',
  location: 'europe-north1'
};

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

export const materialStatsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'MaterialStats');
}
materialStatsRef.operationName = 'MaterialStats';

export function materialStats(dc) {
  return executeQuery(materialStatsRef(dc));
}

export const regionStatsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'RegionStats');
}
regionStatsRef.operationName = 'RegionStats';

export function regionStats(dc) {
  return executeQuery(regionStatsRef(dc));
}

export const nominalStatsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'NominalStats');
}
nominalStatsRef.operationName = 'NominalStats';

export function nominalStats(dc) {
  return executeQuery(nominalStatsRef(dc));
}

export const nameStatsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'NameStats');
}
nameStatsRef.operationName = 'NameStats';

export function nameStats(dc) {
  return executeQuery(nameStatsRef(dc));
}

