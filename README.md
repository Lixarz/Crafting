# Albion Workshop

Website statis gratis untuk kalkulator crafting dan refining Albion Online. Harga pasar, resep, RRR, dan biaya diinput pengguna; tidak ada API harga otomatis.

## Menjalankan dan menguji

Buka `index.html` di browser atau host folder ini sebagai website statis. Tidak ada dependency runtime. Jalankan test logika dengan Node.js: `npm test`.

## Kalkulator

- Input crafting/refining, jumlah hasil, batch, kota (label saja), harga hasil, harga bahan, dan biaya manual.
- Tiap bahan memiliki jumlah resep per batch, harga unit, dan pilihan returnable. Bahan yang ditandai tidak mendapat pengembalian RRR.
- RRR adalah persentase total dari UI game yang pengguna masukkan. Situs tidak menebak bonus kota, fokus, atau bonus lain.
- **Ekspektasi pecahan** menunjukkan return matematis rata-rata (quantity × RRR); ini bukan jumlah unit pasti.
- **Simulasi floor per batch** membulatkan quantity × RRR ke bawah per input bahan dan per batch. Ini hanya model simulasi dan belum diklaim sama dengan urutan pembulatan game.
- Biaya bahan yang dikonsumsi, biaya stasiun, biaya peluang fokus (opsional), pendapatan kotor, pajak penjualan, biaya setup sell order, pendapatan bersih, margin, ROI, dan profit ditampilkan terpisah.
- Tabel rincian bahan dan tombol salin ringkasan disediakan. Harga/recipe tidak tersimpan atau diambil otomatis.
- Belum ada database resep, jurnal, kualitas item, formula biaya fokus, biaya transport, atau rekomendasi bonus kota. Biaya stasiun dan pajak bersifat manual karena konteks/aturan akun dapat beragam.

## Batas akurasi game

Kalkulator memberi aritmetika yang transparan untuk data input, tetapi belum dapat mengklaim hasil game-exact. Sumber online yang ditinjau tidak konsisten pada angka bonus kota, formula RRR, pajak/fee, dan pembulatan. Untuk itu, masukkan RRR yang ditunjukkan game, tandai komponen resep yang tidak returnable, dan cocokkan simulasi dengan hasil dalam game. Kita akan menambah data bawaan hanya setelah diverifikasi dengan bukti game dan sumber yang bisa dirujuk.

## Tema dan aksesibilitas

Enam palet (Modern Minimalist, Albion Inspired, Soft & Comfortable, Maroon Elegance, Forest Harmony, Mocha Serenity) masing-masing bisa dipadukan dengan Light, Dark, atau System. Pilihan independen dan hanya preferensi tema disimpan di `localStorage`; tema tidak mengakses data kalkulator. Interface menyediakan semantic labels, keyboard focus indicator, skip link, reduced motion, dan token warna konsisten.
