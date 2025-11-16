const { queryRef, executeQuery, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'coin-discoverer-service',
  location: 'europe-north1'
};
exports.connectorConfig = connectorConfig;

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
