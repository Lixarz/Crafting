/* Pure, testable estimate model. Game-specific recipes, RRR, fees, and rounding are user-supplied. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AlbionCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function finiteNonNegative(value, label) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) throw new Error(`${label} harus berupa angka nol atau lebih.`);
    return n;
  }
  function calculate(input) {
    const outputPerBatch = finiteNonNegative(input.outputPerBatch, 'Jumlah hasil per batch');
    const batches = finiteNonNegative(input.batches, 'Jumlah batch');
    const returnRatePercent = finiteNonNegative(input.returnRatePercent, 'RRR');
    const stationFeePerBatch = finiteNonNegative(input.stationFeePerBatch ?? 0, 'Biaya stasiun');
    const focusPointsPerBatch = finiteNonNegative(input.focusPointsPerBatch ?? 0, 'Focus point');
    const focusValuePerPoint = finiteNonNegative(input.focusValuePerPoint ?? 0, 'Nilai biaya fokus');
    const outputUnitPrice = finiteNonNegative(input.outputUnitPrice, 'Harga jual');
    const marketTaxPercent = finiteNonNegative(input.marketTaxPercent ?? 0, 'Pajak penjualan');
    const sellOrderFeePercent = finiteNonNegative(input.sellOrderFeePercent ?? 0, 'Biaya sell order');
    if (!Number.isInteger(outputPerBatch) || !Number.isInteger(batches) || outputPerBatch <= 0 || batches <= 0) {
      throw new Error('Jumlah hasil dan batch harus berupa bilangan bulat lebih dari 0.');
    }
    if (returnRatePercent > 100 || marketTaxPercent > 100 || sellOrderFeePercent > 100) throw new Error('Persentase tidak boleh lebih dari 100%.');
    if (!['expected', 'floor-batch'].includes(input.returnModel)) throw new Error('Pilih model pengembalian bahan yang valid.');
    if (!Array.isArray(input.materials) || input.materials.length === 0) throw new Error('Tambahkan setidaknya satu bahan resep.');
    const rate = returnRatePercent / 100;
    const materialDetails = input.materials.map((material, index) => {
      const quantityPerBatch = finiteNonNegative(material.quantityPerBatch, `Jumlah bahan ${index + 1}`);
      const unitPrice = finiteNonNegative(material.unitPrice, `Harga bahan ${index + 1}`);
      const grossQuantity = quantityPerBatch * batches;
      const returnedQuantity = material.returnable === false ? 0 : input.returnModel === 'floor-batch'
        ? Math.floor(quantityPerBatch * rate) * batches
        : grossQuantity * rate;
      const consumedQuantity = grossQuantity - returnedQuantity;
      return {
        name: String(material.name || `Bahan ${index + 1}`),
        returnable: material.returnable !== false,
        grossQuantity,
        returnedQuantity,
        consumedQuantity,
        grossValue: grossQuantity * unitPrice,
        returnedValue: returnedQuantity * unitPrice,
        consumedValue: consumedQuantity * unitPrice
      };
    });
    const sum = field => materialDetails.reduce((total, item) => total + item[field], 0);
    const grossMaterialQuantity = sum('grossQuantity');
    const returnedMaterialQuantity = sum('returnedQuantity');
    const grossMaterialValue = sum('grossValue');
    const returnedMaterialValue = sum('returnedValue');
    const materialCost = sum('consumedValue');
    const totalOutput = outputPerBatch * batches;
    const stationCost = stationFeePerBatch * batches;
    const focusPoints = focusPointsPerBatch * batches;
    const focusCost = focusPoints * focusValuePerPoint;
    const grossRevenue = totalOutput * outputUnitPrice;
    const marketTax = grossRevenue * marketTaxPercent / 100;
    const sellOrderFee = grossRevenue * sellOrderFeePercent / 100;
    const netRevenue = grossRevenue - marketTax - sellOrderFee;
    const totalProductionCost = materialCost + stationCost + focusCost;
    return {
      returnModel: input.returnModel,
      returnRatePercent,
      materialDetails,
      grossMaterialQuantity,
      returnedMaterialQuantity,
      consumedMaterialQuantity: grossMaterialQuantity - returnedMaterialQuantity,
      grossMaterialValue,
      returnedMaterialValue,
      materialCost,
      totalOutput,
      stationCost,
      focusPoints,
      focusCost,
      grossRevenue,
      marketTax,
      sellOrderFee,
      netRevenue,
      totalProductionCost,
      profit: netRevenue - totalProductionCost
    };
  }
  return Object.freeze({ calculate });
});
