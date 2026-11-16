'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { calculate } = require('../calculator.js');
const base = {
  outputPerBatch: 1, batches: 1, returnRatePercent: 0, returnModel: 'expected',
  stationFeePerBatch: 0, focusPointsPerBatch: 0, focusValuePerPoint: 0,
  outputUnitPrice: 0, marketTaxPercent: 0, sellOrderFeePercent: 0,
  materials: [{ name: 'material', quantityPerBatch: 10, unitPrice: 2, returnable: true }]
};
test('calculates cost, revenue, fees and profit without return', () => {
  const result = calculate({ ...base, outputPerBatch: 2, outputUnitPrice: 20, stationFeePerBatch: 3, marketTaxPercent: 5, sellOrderFeePercent: 2 });
  assert.equal(result.materialCost, 20); assert.equal(result.grossRevenue, 40); assert.equal(result.marketTax, 2);
  assert.equal(result.sellOrderFee, 0.8); assert.equal(result.netRevenue, 37.2); assert.equal(result.profit, 14.2);
});
test('expected mode returns fractional resources and charges only consumed value', () => {
  const result = calculate({ ...base, batches: 2, returnRatePercent: 25 });
  assert.equal(result.grossMaterialQuantity, 20); assert.equal(result.returnedMaterialQuantity, 5);
  assert.equal(result.materialCost, 30); assert.equal(result.returnedMaterialValue, 10);
});
test('floor simulation rounds each ingredient batch separately', () => {
  const result = calculate({ ...base, batches: 3, returnRatePercent: 25, returnModel: 'floor-batch' });
  assert.equal(result.returnedMaterialQuantity, 6); assert.equal(result.materialCost, 48);
});
test('non-returnable materials are never returned', () => {
  const result = calculate({ ...base, returnRatePercent: 50, materials: [{ ...base.materials[0], returnable: false }] });
  assert.equal(result.returnedMaterialQuantity, 0); assert.equal(result.materialCost, 20);
});
test('accounts for opportunity cost of focus points', () => {
  const result = calculate({ ...base, focusPointsPerBatch: 100, focusValuePerPoint: 3, batches: 2 });
  assert.equal(result.focusPoints, 200); assert.equal(result.focusCost, 600); assert.equal(result.profit, -620);
});
test('rejects invalid rate and zero or fractional production size', () => {
  assert.throws(() => calculate({ ...base, returnRatePercent: 101 }), /tidak boleh lebih/);
  assert.throws(() => calculate({ ...base, batches: 0 }), /bilangan bulat lebih dari 0/);
  assert.throws(() => calculate({ ...base, batches: 1.5 }), /bilangan bulat lebih dari 0/);
});
test('keeps returnable flags separate per ingredient', () => {
  const result = calculate({ ...base, returnRatePercent: 50, materials: [
    { name: 'resource', quantityPerBatch: 8, unitPrice: 5, returnable: true },
    { name: 'artifact', quantityPerBatch: 2, unitPrice: 100, returnable: false }
  ] });
  assert.deepEqual(result.materialDetails.map(item => item.returnedQuantity), [4, 0]);
  assert.equal(result.grossMaterialValue, 240); assert.equal(result.returnedMaterialValue, 20); assert.equal(result.materialCost, 220);
});
test('rejects NaN, infinity and negative material values', () => {
  assert.throws(() => calculate({ ...base, outputUnitPrice: NaN }), /angka nol atau lebih/);
  assert.throws(() => calculate({ ...base, outputUnitPrice: Infinity }), /angka nol atau lebih/);
  assert.throws(() => calculate({ ...base, materials: [{ ...base.materials[0], unitPrice: -1 }] }), /angka nol atau lebih/);
});
test('calculates zero-fee and zero-revenue cases without division errors', () => {
  const result = calculate({ ...base });
  assert.equal(result.netRevenue, 0); assert.equal(result.profit, -20);
});
