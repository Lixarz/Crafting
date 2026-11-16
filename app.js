(() => {
  'use strict';
  const THEME_KEY = 'albion-workshop-theme-v1';
  const paletteSelect = document.querySelector('#palette-select');
  const modeSelect = document.querySelector('#mode-select');
  const body = document.body;
  const palettes = ['modern-minimalist', 'albion-inspired', 'soft-comfortable', 'maroon-elegance', 'forest-harmony', 'mocha-serenity'];
  const modes = ['light', 'dark', 'system'];

  // Theme state is intentionally isolated from every calculator input and result.
  function loadTheme() {
    try {
      const saved = JSON.parse(localStorage.getItem(THEME_KEY) || '{}');
      return {
        palette: palettes.includes(saved.palette) ? saved.palette : 'modern-minimalist',
        mode: modes.includes(saved.mode) ? saved.mode : 'system'
      };
    } catch { return { palette: 'modern-minimalist', mode: 'system' }; }
  }
  function applyTheme(theme) {
    body.dataset.palette = theme.palette;
    body.dataset.mode = theme.mode;
    paletteSelect.value = theme.palette;
    modeSelect.value = theme.mode;
    try { localStorage.setItem(THEME_KEY, JSON.stringify(theme)); } catch { /* Continue without persistence if storage is unavailable. */ }
  }
  const theme = loadTheme();
  applyTheme(theme);
  paletteSelect.addEventListener('change', () => applyTheme({ palette: paletteSelect.value, mode: modeSelect.value }));
  modeSelect.addEventListener('change', () => applyTheme({ palette: paletteSelect.value, mode: modeSelect.value }));

  const materialsList = document.querySelector('#materials-list');
  let materialId = 0;
  const currency = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });
  function materialRow() {
    const id = ++materialId;
    const row = document.createElement('div');
    row.className = 'materials-row';
    row.innerHTML = `<div class="field"><label for="material-name-${id}">Nama bahan</label><input id="material-name-${id}" type="text" placeholder="Nama bahan" autocomplete="off"></div>
      <div class="field"><label for="material-quantity-${id}">Jumlah / batch</label><input id="material-quantity-${id}" type="number" min="0" step="any" value="0" inputmode="decimal"></div>
      <div class="field"><label for="material-price-${id}">Harga / unit</label><input id="material-price-${id}" type="number" min="0" step="any" value="0" inputmode="decimal"></div>
      <button class="remove-material" type="button" aria-label="Hapus baris bahan" title="Hapus bahan">×</button>`;
    row.querySelector('.remove-material').addEventListener('click', () => row.remove());
    materialsList.append(row);
  }
  document.querySelector('#add-material').addEventListener('click', materialRow);
  materialRow();

  const form = document.querySelector('#calculator-form');
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const outputPerBatch = Number(form.elements.outputQuantity.value);
    const batches = Number(form.elements.batches.value);
    const rrr = Number(form.elements.returnRate.value) / 100;
    const feePerBatch = Number(form.elements.stationFee.value);
    const outputPrice = Number(form.elements.outputPrice.value);
    const saleFee = Number(form.elements.saleFee.value) / 100;
    const rows = [...materialsList.querySelectorAll('.materials-row')];
    const materialCostPerBatch = rows.reduce((total, row) => {
      const inputs = row.querySelectorAll('input');
      const quantity = Number(inputs[1].value || 0);
      const price = Number(inputs[2].value || 0);
      return total + quantity * price;
    }, 0);
    const returnedCost = materialCostPerBatch * rrr * batches;
    const totalMaterialCost = materialCostPerBatch * batches - returnedCost;
    const totalStationCost = feePerBatch * batches;
    const totalOutput = outputPerBatch * batches;
    const grossRevenue = totalOutput * outputPrice;
    const netRevenue = grossRevenue * (1 - saleFee);
    const profit = netRevenue - totalMaterialCost - totalStationCost;
    const process = form.querySelector('input[name="process"]:checked').value;
    const itemName = form.elements.itemName.value.trim() || (process === 'refining' ? 'Hasil refining' : 'Hasil crafting');
    document.querySelector('#empty-state').hidden = true;
    document.querySelector('#results').hidden = false;
    document.querySelector('#result-item-name').textContent = `${itemName} · ${form.elements.city.value || 'Kota belum dipilih'}`;
    document.querySelector('#result-quantity').textContent = currency.format(totalOutput);
    document.querySelector('#result-material-cost').textContent = currency.format(totalMaterialCost);
    document.querySelector('#result-station-cost').textContent = currency.format(totalStationCost);
    document.querySelector('#result-revenue').textContent = currency.format(netRevenue);
    const profitElement = document.querySelector('#result-profit');
    profitElement.textContent = `${profit < 0 ? '−' : ''}${currency.format(Math.abs(profit))}`;
    profitElement.classList.toggle('negative', profit < 0);
    document.querySelector('#formula-note').textContent = `Rumus estimasi: bahan ${currency.format(materialCostPerBatch * batches)} − pengembalian bahan ${currency.format(returnedCost)} + biaya stasiun ${currency.format(totalStationCost)}; pendapatan ${currency.format(grossRevenue)} − biaya jual ${currency.format(grossRevenue * saleFee)}. Mengasumsikan RRR berlaku proporsional pada total bahan dan belum membulatkan hasil ke unit game.`;
  });
})();
