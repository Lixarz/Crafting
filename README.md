# Albion Workshop

Website statis gratis untuk kalkulator crafting dan refining Albion Online. Harga pasar, resep, RRR, dan biaya diinput pengguna; tidak ada API harga otomatis.

## Menjalankan dan menguji

Buka `index.html` di browser atau host folder ini sebagai website statis. Tidak ada dependency runtime. Jalankan test logika dengan Node.js: `npm test`.

## Model kalkulasi

- Tiap bahan memiliki jumlah resep per batch, harga unit, dan pilihan apakah bahan itu returnable. Bahan yang ditandai tidak dapat return tidak dikurangi RRR.
- RRR adalah persentase total yang pengguna baca dari game, bukan dihitung dari asumsi bonus kota/fokus.
- Model **Ekspektasi pecahan** menghitung return teoritis sebagai jumlah bahan × RRR; cocok untuk estimasi rata-rata, bukan jumlah item pasti.
- Model **Bulatkan ke bawah per batch** mensimulasikan floor(quantity per batch × RRR) pada setiap batch. Ini sengaja diberi label simulasi karena perilaku pembulatan spesifik game perlu diuji pada recipe/batch aktual.
- Biaya bahan = nilai bahan awal − nilai bahan kembali. Biaya stasiun dimasukkan sebagai silver per batch aktual/estimasi pengguna.
- Pendapatan kotor = hasil × harga jual. Pajak dan biaya sell order dimasukkan manual sebagai persentase terpisah; profit = pendapatan bersih − bahan yang dikonsumsi − stasiun − opportunity cost fokus opsional.
- Focus point dan nilai per point opsional. Ini membantu menghitung opportunity cost, tetapi tool tidak menebak focus efficiency/mastery.
- Belum memodelkan recipe database, item quality, journal return, crafting quality, travel/transport, nutrition formula, usage fee otomatis atau bonus kota. Angka-angka itu tidak boleh dianggap inbegrepen secara otomatis.

## Catatan akurasi game

Panduan dan kalkulator komunitas yang ditemukan menyepakati pendekatan umum: input harga, recipe, RRR, lalu bedakan bahan kembali dan biaya stasiun/pajak. Tetapi hasil pencarian untuk angka bonus kota, rumus RRR dan pembulatan tidak konsisten satu sama lain. Karena itu nilai bonus/rumus fokus tidak di-hardcode. Gunakan RRR yang terlihat pada UI game dan cocokkan estimasi pembulatan dengan beberapa percobaan dalam game sebelum menganggap hasil sebagai nilai tepat.

## Tema dan aksesibilitas

Enam palet (Modern Minimalist, Albion Inspired, Soft & Comfortable, Maroon Elegance, Forest Harmony, Mocha Serenity) masing-masing bisa dipadukan dengan Light, Dark, atau System. Pilihan independen dan hanya preferensi tema disimpan di `localStorage`; tema tidak mengakses data kalkulator. Interface menyediakan semantic labels, keyboard focus indicator, skip link, reduced motion, dan token warna konsisten.
