import { queryRef, executeQuery, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'coin-discoverer-service',
  location: 'europe-north1'
};

export const coinFilterDataRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'CoinFilterData');
}
coinFilterDataRef.operationName = 'CoinFilterData';

export function coinFilterData(dc) {
  return executeQuery(coinFilterDataRef(dc));
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

export const coinMeta2ByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'CoinMeta2ById', inputVars);
}
coinMeta2ByIdRef.operationName = 'CoinMeta2ById';

export function coinMeta2ById(dcOrVars, vars) {
  return executeQuery(coinMeta2ByIdRef(dcOrVars, vars));
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

export const coinMeta2CountRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'CoinMeta2Count');
}
coinMeta2CountRef.operationName = 'CoinMeta2Count';

export function coinMeta2Count(dc) {
  return executeQuery(coinMeta2CountRef(dc));
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

export const listCoinsByFilterRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListCoinsByFilter', inputVars);
}
listCoinsByFilterRef.operationName = 'ListCoinsByFilter';

export function listCoinsByFilter(dcOrVars, vars) {
  return executeQuery(listCoinsByFilterRef(dcOrVars, vars));
}

