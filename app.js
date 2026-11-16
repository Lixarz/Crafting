(() => {
  'use strict';

  const THEME_KEY = 'albion-workshop-theme-v1';
  const palettes = ['modern-minimalist', 'albion-inspired', 'soft-comfortable', 'maroon-elegance', 'forest-harmony', 'mocha-serenity'];
  const modes = ['light', 'dark', 'system'];
  const paletteSelect = document.querySelector('#palette-select');
  const modeSelect = document.querySelector('#mode-select');
  const body = document.body;

  function loadTheme() {
    try {
      const saved = JSON.parse(localStorage.getItem(THEME_KEY) || '{}');
      return {
        palette: palettes.includes(saved.palette) ? saved.palette : 'modern-minimalist',
        mode: modes.includes(saved.mode) ? saved.mode : 'system'
      };
    } catch {
      return { palette: 'modern-minimalist', mode: 'system' };
    }
  }

  function applyTheme(theme) {
    body.dataset.palette = theme.palette;
    body.dataset.mode = theme.mode;
    if (paletteSelect) paletteSelect.value = theme.palette;
    if (modeSelect) modeSelect.value = theme.mode;
    try {
      localStorage.setItem(THEME_KEY, JSON.stringify(theme));
    } catch {
      // storage may be blocked; continue gracefully
    }
  }

  applyTheme(loadTheme());
  paletteSelect.addEventListener('change', () => applyTheme({ palette: paletteSelect.value, mode: modeSelect.value }));
  modeSelect.addEventListener('change', () => applyTheme({ palette: paletteSelect.value, mode: modeSelect.value }));

  const MATERIAL_ROW_TEMPLATE = `
    <div class="field">
      <label>Nama bahan</label>
      <input class="material-name" type="text" placeholder="Nama bahan" autocomplete="off">
    </div>
    <div class="field">
      <label>Jumlah / batch</label>
      <input class="material-quantity" type="number" min="0" step="any" value="0" inputmode="decimal">
    </div>
    <div class="field">
      <label>Harga / unit</label>
      <input class="material-price" type="number" min="0" step="any" value="0" inputmode="decimal">
    </div>
    <label class="returnable-control"><input class="material-returnable" type="checkbox" checked><span>Dapat return</span></label>
    <button class="remove-material" type="button" aria-label="Hapus bahan">Hapus</button>
  `;

  const form = document.querySelector('#calculator-form');
  const materialsList = document.querySelector('#materials-list');
  const validation = document.querySelector('#validation-message');
  const resultPanel = document.querySelector('#results');
  const emptyState = document.querySelector('#empty-state');
  const copyButton = document.querySelector('#copy-results');
  const copyStatus = document.querySelector('#copy-status');
  const money = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });
  const quantity = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 3 });
  let materialId = 0;
  let latestSummary = '';

  function setValidation(message) {
    if (!message) {
      validation.hidden = true;
      validation.textContent = '';
      return;
    }
    validation.hidden = false;
    validation.textContent = message;
  }

  function resetResult(message = 'Isi bahan resep, harga, dan biaya, lalu pilih Hitung estimasi.') {
    emptyState.textContent = message;
    emptyState.hidden = false;
    resultPanel.hidden = true;
    copyButton.disabled = true;
    copyStatus.textContent = '';
    latestSummary = '';
  }

  function applyPreset(presetName) {
    const presets = {
      starter: {
        itemName: 'Hasil refining',
        city: 'Martlock',
        outputQuantity: 1,
        batches: 10,
        returnRate: 25,
        returnModel: 'expected',
        outputPrice: 1600,
        stationFee: 120,
        marketTax: 2,
        sellOrderFee: 1,
        focusPoints: 0,
        focusValue: 0,
        materials: [
          { name: 'Ore', quantity: 12, price: 120, returnable: true },
          { name: 'Stone', quantity: 8, price: 90, returnable: true },
          { name: 'T2 material', quantity: 4, price: 210, returnable: false }
        ]
      },
      'refining-heavy': {
        process: 'refining',
        itemName: 'Refined Batch',
        city: 'Fort Sterling',
        outputQuantity: 1,
        batches: 25,
        returnRate: 35,
        returnModel: 'expected',
        outputPrice: 2100,
        stationFee: 220,
        marketTax: 2.5,
        sellOrderFee: 1,
        focusPoints: 25,
        focusValue: 12,
        materials: [
          { name: 'Ore', quantity: 18, price: 150, returnable: true },
          { name: 'Stone', quantity: 12, price: 110, returnable: true },
          { name: 'Wood', quantity: 7, price: 95, returnable: true }
        ]
      },
      'crafting-economy': {
        process: 'crafting',
        itemName: 'Crafted Set',
        city: 'Bridgewatch',
        outputQuantity: 2,
        batches: 8,
        returnRate: 30,
        returnModel: 'expected',
        outputPrice: 2800,
        stationFee: 180,
        marketTax: 2,
        sellOrderFee: 1.5,
        focusPoints: 15,
        focusValue: 10,
        materials: [
          { name: 'Hide', quantity: 16, price: 130, returnable: true },
          { name: 'Fiber', quantity: 10, price: 98, returnable: true },
          { name: 'Crafting reagent', quantity: 5, price: 220, returnable: false }
        ]
      }
    };

    const preset = presets[presetName];
    if (!preset) return;

    const processRadio = form.querySelector(`input[name="process"][value="${preset.process || 'refining'}"]`);
    if (processRadio) processRadio.checked = true;

    form.elements.itemName.value = preset.itemName || '';
    form.elements.city.value = preset.city || '';
    form.elements.outputQuantity.value = preset.outputQuantity ?? 1;
    form.elements.batches.value = preset.batches ?? 1;
    form.elements.returnRate.value = preset.returnRate ?? 0;
    form.elements.returnModel.value = preset.returnModel || 'expected';
    form.elements.outputPrice.value = preset.outputPrice ?? 0;
    form.elements.stationFee.value = preset.stationFee ?? 0;
    form.elements.marketTax.value = preset.marketTax ?? 0;
    form.elements.sellOrderFee.value = preset.sellOrderFee ?? 0;
    form.elements.focusPoints.value = preset.focusPoints ?? 0;
    form.elements.focusValue.value = preset.focusValue ?? 0;

    materialsList.replaceChildren();
    materialId = 0;
    (preset.materials || []).forEach((material) => addMaterialRow(material));
    if (!preset.materials || preset.materials.length === 0) addMaterialRow();
    setValidation('');
    resetResult('Preset masuk. Hitung ulang untuk memperbarui estimasi.');
  }

  function addMaterialRow(defaults = {}) {
    const id = ++materialId;
    const row = document.createElement('div');
    row.className = 'materials-row';
    row.innerHTML = MATERIAL_ROW_TEMPLATE;
    const nameInput = row.querySelector('.material-name');
    const quantityInput = row.querySelector('.material-quantity');
    const priceInput = row.querySelector('.material-price');
    const returnInput = row.querySelector('.material-returnable');
    const removeButton = row.querySelector('.remove-material');

    nameInput.value = defaults.name || '';
    quantityInput.value = defaults.quantity ?? 0;
    priceInput.value = defaults.price ?? 0;
    returnInput.checked = defaults.returnable !== false;

    removeButton.addEventListener('click', () => {
      row.remove();
      setValidation('');
      if (!materialsList.querySelectorAll('.materials-row').length) {
        resetResult('Minimal ada satu bahan. Tambahkan bahan untuk menghitung estimasi.');
      }
    });

    materialsList.append(row);
  }

  function resetCalculator() {
    form.reset();
    form.elements.process.value = 'refining';
    form.elements.outputQuantity.value = 1;
    form.elements.batches.value = 1;
    form.elements.returnRate.value = 25;
    form.elements.returnModel.value = 'expected';
    form.elements.outputPrice.value = 0;
    form.elements.stationFee.value = 0;
    form.elements.marketTax.value = 0;
    form.elements.sellOrderFee.value = 0;
    form.elements.focusPoints.value = 0;
    form.elements.focusValue.value = 0;
    materialsList.replaceChildren();
    materialId = 0;
    addMaterialRow({ name: 'Ore', quantity: 10, price: 100, returnable: true });
    addMaterialRow({ name: 'Stone', quantity: 8, price: 80, returnable: true });
    setValidation('');
    resetResult();
  }

  document.querySelector('#add-material').addEventListener('click', () => {
    addMaterialRow();
    setValidation('');
    if (resultPanel.hidden === false) {
      resetResult('Input berubah. Hitung ulang untuk melihat hasil terbaru.');
    }
  });

  document.querySelector('#reset-calculator').addEventListener('click', resetCalculator);
  document.querySelectorAll('[data-preset-apply]').forEach(button => {
    button.addEventListener('click', () => applyPreset('starter'));
  });
  document.querySelectorAll('[data-preset]').forEach(button => {
    button.addEventListener('click', () => applyPreset(button.dataset.preset));
  });

  form.addEventListener('input', () => {
    if (!resultPanel.hidden) {
      resetResult('Input berubah. Hitung ulang untuk melihat hasil terbaru.');
    }
  });
  form.addEventListener('change', () => {
    if (!resultPanel.hidden) {
      resetResult('Input berubah. Hitung ulang untuk melihat hasil terbaru.');
    }
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    setValidation('');
    if (!form.reportValidity()) return;

    const rows = [...materialsList.querySelectorAll('.materials-row')];
    const materials = rows.map(row => ({
      name: row.querySelector('.material-name').value.trim() || 'Bahan',
      quantityPerBatch: Number(row.querySelector('.material-quantity').value || 0),
      unitPrice: Number(row.querySelector('.material-price').value || 0),
      returnable: row.querySelector('.material-returnable').checked
    }));

    if (!materials.some(material => material.quantityPerBatch > 0)) {
      setValidation('Tambahkan minimal satu bahan dengan jumlah per batch lebih dari 0.');
      rows[0]?.querySelector('.material-quantity').focus();
      return;
    }

    const process = form.querySelector('input[name="process"]:checked').value;
    const itemName = form.elements.itemName.value.trim() || (process === 'refining' ? 'Hasil refining' : 'Hasil crafting');

    try {
      const result = AlbionCalculator.calculate({
        outputPerBatch: Number(form.elements.outputQuantity.value),
        batches: Number(form.elements.batches.value),
        returnRatePercent: Number(form.elements.returnRate.value),
        returnModel: form.elements.returnModel.value,
        stationFeePerBatch: Number(form.elements.stationFee.value),
        focusPointsPerBatch: Number(form.elements.focusPoints.value || 0),
        focusValuePerPoint: Number(form.elements.focusValue.value || 0),
        outputUnitPrice: Number(form.elements.outputPrice.value),
        marketTaxPercent: Number(form.elements.marketTax.value || 0),
        sellOrderFeePercent: Number(form.elements.sellOrderFee.value || 0),
        materials
      });

      resultPanel.hidden = false;
      emptyState.hidden = true;
      copyButton.disabled = false;

      document.querySelector('#result-item-name').textContent = `${itemName} · ${form.elements.city.value.trim() || 'Kota belum dipilih'}`;
      document.querySelector('#result-quantity').textContent = quantity.format(result.totalOutput);
      document.querySelector('#result-gross-material').textContent = `${money.format(result.grossMaterialValue)} silver`;
      document.querySelector('#result-returned-material').textContent = `${money.format(result.returnedMaterialValue)} silver`;
      document.querySelector('#result-material-cost').textContent = `${money.format(result.materialCost)} silver`;
      document.querySelector('#result-station-cost').textContent = `${money.format(result.stationCost)} silver`;
      document.querySelector('#result-focus-cost').textContent = `${money.format(result.focusCost)} silver`;
      document.querySelector('#result-gross-revenue').textContent = `${money.format(result.grossRevenue)} silver`;
      document.querySelector('#result-market-tax').textContent = `${money.format(result.marketTax)} silver`;
      document.querySelector('#result-sell-fee').textContent = `${money.format(result.sellOrderFee)} silver`;
      document.querySelector('#result-revenue').textContent = `${money.format(result.netRevenue)} silver`;
      const profitBox = document.querySelector('#result-profit');
      profitBox.textContent = `${result.profit < 0 ? '−' : ''}${money.format(Math.abs(result.profit))} silver`;
      profitBox.classList.toggle('negative', result.profit < 0);

      const marginText = result.netRevenue === 0 ? 'Margin belum tersedia — pendapatan bersih 0.' : `${((result.profit / result.netRevenue) * 100).toFixed(2)}%`;
      const roiText = result.totalProductionCost === 0 ? 'ROI belum tersedia — biaya produksi 0.' : `${((result.profit / result.totalProductionCost) * 100).toFixed(2)}%`;
      document.querySelector('#result-margin').textContent = `Margin: ${marginText} · ROI biaya produksi: ${roiText}`;

      const rowsResult = document.querySelector('#result-material-rows');
      rowsResult.replaceChildren();
      result.materialDetails.forEach(item => {
        const tr = document.createElement('tr');
        [item.name, quantity.format(item.grossQuantity), quantity.format(item.returnedQuantity), quantity.format(item.consumedQuantity), `${money.format(item.consumedValue)} silver`].forEach(value => {
          const td = document.createElement('td');
          td.textContent = value;
          tr.append(td);
        });
        rowsResult.append(tr);
      });

      const modelNote = result.returnModel === 'floor-batch' ? 'simulasi floor per bahan per batch' : 'ekspektasi pecahan';
      document.querySelector('#formula-note').textContent = `RRR ${money.format(result.returnRatePercent)}% · model ${modelNote}. Bahan non-returnable tidak menerima pengembalian. Biaya bahan = bahan kotor − bahan kembali. Pendapatan bersih = pendapatan kotor − pajak − biaya sell order.`;

      latestSummary = `${itemName} (${process}) — ${form.elements.city.value.trim() || 'Kota belum dipilih'}\nJumlah hasil: ${quantity.format(result.totalOutput)}\nNilai bahan kotor: ${money.format(result.grossMaterialValue)} silver\nNilai bahan kembali: ${money.format(result.returnedMaterialValue)} silver\nBiaya bahan: ${money.format(result.materialCost)} silver\nBiaya stasiun: ${money.format(result.stationCost)} silver\nBiaya fokus: ${money.format(result.focusCost)} silver\nPendapatan bersih: ${money.format(result.netRevenue)} silver\nProfit: ${money.format(result.profit)} silver\nRRR: ${money.format(result.returnRatePercent)}% (${modelNote})`;
      copyStatus.textContent = '';
    } catch (error) {
      setValidation(error.message || 'Ada kesalahan perhitungan.');
      resultPanel.hidden = false;
      emptyState.hidden = true;
    }
  });

  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(latestSummary);
      copyStatus.textContent = 'Ringkasan berhasil disalin.';
    } catch {
      copyStatus.textContent = 'Clipboard tidak tersedia; salin ringkasan secara manual.';
    }
  });

  resetCalculator();
})();
