(() => {
  'use strict';
  const THEME_KEY = 'albion-workshop-theme-v1';
  const paletteSelect = document.querySelector('#palette-select');
  const modeSelect = document.querySelector('#mode-select');
  const body = document.body;
  const palettes = ['modern-minimalist', 'albion-inspired', 'soft-comfortable', 'maroon-elegance', 'forest-harmony', 'mocha-serenity'];
  const modes = ['light', 'dark', 'system'];
  function loadTheme() {
    try {
      const saved = JSON.parse(localStorage.getItem(THEME_KEY) || '{}');
      return { palette: palettes.includes(saved.palette) ? saved.palette : 'modern-minimalist', mode: modes.includes(saved.mode) ? saved.mode : 'system' };
    } catch { return { palette: 'modern-minimalist', mode: 'system' }; }
  }
  function applyTheme(theme) {
    body.dataset.palette = theme.palette;
    body.dataset.mode = theme.mode;
    paletteSelect.value = theme.palette;
    modeSelect.value = theme.mode;
    try { localStorage.setItem(THEME_KEY, JSON.stringify(theme)); } catch { /* Continue without persistence if storage is unavailable. */ }
  }
  applyTheme(loadTheme());
  paletteSelect.addEventListener('change', () => applyTheme({ palette: paletteSelect.value, mode: modeSelect.value }));
  modeSelect.addEventListener('change', () => applyTheme({ palette: paletteSelect.value, mode: modeSelect.value }));

  const materialsList = document.querySelector('#materials-list');
  let materialId = 0;
  const money = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });
  const quantityFormat = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 3 });
  function addMaterialRow() {
    const id = ++materialId;
    const row = document.createElement('fieldset');
    row.className = 'materials-row';
    row.innerHTML = `<legend class="visually-hidden">Bahan resep ${id}</legend>
      <div class="field"><label for="material-name-${id}">Nama bahan</label><input id="material-name-${id}" class="material-name" type="text" placeholder="Nama bahan" autocomplete="off"></div>
      <div class="field"><label for="material-quantity-${id}">Jumlah / batch</label><input id="material-quantity-${id}" class="material-quantity" type="number" min="0" step="any" value="0" inputmode="decimal"></div>
      <div class="field"><label for="material-price-${id}">Harga / unit</label><input id="material-price-${id}" class="material-price" type="number" min="0" step="any" value="0" inputmode="decimal"></div>
      <label class="returnable-control" for="material-returnable-${id}"><input id="material-returnable-${id}" class="material-returnable" type="checkbox" checked><span>Dapat return</span></label>
      <button class="remove-material" type="button" aria-label="Hapus bahan ${id}" title="Hapus bahan">Hapus</button>`;
    row.querySelector('.remove-material').addEventListener('click', () => row.remove());
    materialsList.append(row);
  }
  document.querySelector('#add-material').addEventListener('click', addMaterialRow);
  addMaterialRow();
  const form = document.querySelector('#calculator-form');
  const validation = document.querySelector('#validation-message');
  const setText = (selector, value) => { document.querySelector(selector).textContent = value; };
  form.addEventListener('submit', event => {
    event.preventDefault();
    validation.hidden = true;
    if (!form.reportValidity()) return;
    const rows = [...materialsList.querySelectorAll('.materials-row')];
    const materials = rows.map(row => ({
      name: row.querySelector('.material-name').value.trim(),
      quantityPerBatch: Number(row.querySelector('.material-quantity').value),
      unitPrice: Number(row.querySelector('.material-price').value),
      returnable: row.querySelector('.material-returnable').checked
    }));
    if (!materials.some(material => material.quantityPerBatch > 0)) {
      validation.textContent = 'Tambahkan minimal satu bahan dengan jumlah per batch lebih dari 0.';
      validation.hidden = false;
      rows[0]?.querySelector('.material-quantity').focus();
      return;
    }
    const process = form.querySelector('input[name="process"]:checked').value;
    const itemName = form.elements.itemName.value.trim() || (process === 'refining' ? 'Hasil refining' : 'Hasil crafting');
    let result;
    try {
      result = AlbionCalculator.calculate({
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
    } catch (error) {
      validation.textContent = error.message;
      validation.hidden = false;
      return;
    }
    document.querySelector('#empty-state').hidden = true;
    document.querySelector('#results').hidden = false;
    setText('#result-item-name', `${itemName} · ${form.elements.city.value || 'Kota belum dipilih'}`);
    setText('#result-quantity', quantityFormat.format(result.totalOutput));
    setText('#result-gross-material', `${quantityFormat.format(result.grossMaterialQuantity)} unit`);
    setText('#result-returned-material', `${quantityFormat.format(result.returnedMaterialQuantity)} unit · ${money.format(result.returnedMaterialValue)} silver`);
    setText('#result-material-cost', `${money.format(result.materialCost)} silver`);
    setText('#result-station-cost', `${money.format(result.stationCost)} silver`);
    setText('#result-focus-cost', `${money.format(result.focusCost)} silver`);
    setText('#result-gross-revenue', `${money.format(result.grossRevenue)} silver`);
    setText('#result-market-tax', `${money.format(result.marketTax)} silver`);
    setText('#result-sell-fee', `${money.format(result.sellOrderFee)} silver`);
    setText('#result-revenue', `${money.format(result.netRevenue)} silver`);
    const profitElement = document.querySelector('#result-profit');
    profitElement.textContent = `${result.profit < 0 ? '−' : ''}${money.format(Math.abs(result.profit))} silver`;
    profitElement.classList.toggle('negative', result.profit < 0);
    setText('#result-margin', `Margin estimasi: ${result.netRevenue === 0 ? '—' : `${(result.profit / result.netRevenue * 100).toFixed(2)}%`} · ROI atas biaya produksi: ${result.totalProductionCost === 0 ? '—' : `${(result.profit / result.totalProductionCost * 100).toFixed(2)}%`}`);
    const modelDescription = result.returnModel === 'floor-batch' ? 'simulasi bulat ke bawah untuk setiap batch' : 'ekspektasi pecahan (rata-rata teoritis)';
    setText('#formula-note', `RRR input ${money.format(result.returnRatePercent)}%; model ${modelDescription}. Bahan non-returnable tidak mendapat pengembalian. Biaya material = nilai bahan awal − nilai bahan kembali; pendapatan bersih = kotor − pajak − biaya sell order. Total produksi = bahan + stasiun + biaya fokus opsional. Pecahan hasil return bukan klaim jumlah item pasti yang diberikan game.`);
  });
})();
