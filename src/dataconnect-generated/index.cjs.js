const { queryRef, executeQuery, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'coin-discoverer-service',
  location: 'europe-north1'
};
exports.connectorConfig = connectorConfig;

const materialStatsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'MaterialStats');
}
materialStatsRef.operationName = 'MaterialStats';
exports.materialStatsRef = materialStatsRef;

exports.materialStats = function materialStats(dc) {
  return executeQuery(materialStatsRef(dc));
};

const regionStatsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'RegionStats');
}
regionStatsRef.operationName = 'RegionStats';
exports.regionStatsRef = regionStatsRef;

exports.regionStats = function regionStats(dc) {
  return executeQuery(regionStatsRef(dc));
};

const nominalStatsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'NominalStats');
}
nominalStatsRef.operationName = 'NominalStats';
exports.nominalStatsRef = nominalStatsRef;

exports.nominalStats = function nominalStats(dc) {
  return executeQuery(nominalStatsRef(dc));
};

const nameStatsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'NameStats');
}
nameStatsRef.operationName = 'NameStats';
exports.nameStatsRef = nameStatsRef;

exports.nameStats = function nameStats(dc) {
  return executeQuery(nameStatsRef(dc));
};

const coinMeta2byIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'CoinMeta2ById', inputVars);
}
coinMeta2byIdRef.operationName = 'CoinMeta2ById';
exports.coinMeta2byIdRef = coinMeta2byIdRef;

exports.coinMeta2byId = function coinMeta2byId(dcOrVars, vars) {
  return executeQuery(coinMeta2byIdRef(dcOrVars, vars));
};

const coinByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'CoinById', inputVars);
}
coinByIdRef.operationName = 'CoinById';
exports.coinByIdRef = coinByIdRef;

exports.coinById = function coinById(dcOrVars, vars) {
  return executeQuery(coinByIdRef(dcOrVars, vars));
};

const coinMeta2countRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'CoinMeta2Count');
}
coinMeta2countRef.operationName = 'CoinMeta2Count';
exports.coinMeta2countRef = coinMeta2countRef;

exports.coinMeta2count = function coinMeta2count(dc) {
  return executeQuery(coinMeta2countRef(dc));
};

const coinCountRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'CoinCount');
}
coinCountRef.operationName = 'CoinCount';
exports.coinCountRef = coinCountRef;

exports.coinCount = function coinCount(dc) {
  return executeQuery(coinCountRef(dc));
};
