# Albion Workshop

Website statis gratis untuk kalkulator crafting dan refining Albion Online. Tidak memakai API harga pasar; pengguna memasukkan harga bahan/hasil secara manual.

## Menjalankan

Buka `index.html` langsung di browser, atau sajikan folder ini dengan web server statis. Tidak ada dependency/build step.

## Yang sudah dibuat

- Landing page responsif berbahasa Indonesia.
- Kalkulator generic crafting/refining: jumlah hasil, batch, resep/bahan, harga, RRR, biaya stasiun dan biaya jual diinput pengguna.
- Enam palet warna (Modern Minimalist, Albion Inspired, Soft & Comfortable, Maroon Elegance, Forest Harmony, Mocha Serenity), masing-masing dengan mode Light, Dark, dan System.
- Palet dan mode adalah preferensi independen; disimpan bersama hanya pada key tema `albion-workshop-theme-v1` di `localStorage`. Tema tidak membaca/menulis data kalkulator.
- Token konsisten untuk surface, teks, border, tombol, input, stripe tabel, status, dan focus ring. Ada skip link, semantic labels, focus-visible, dan reduced-motion.

## Keakuratan game data dan batasan saat ini

Kota rekomendasi dan nilai bonus **belum diaktifkan**. Sumber online yang ditemukan memberi pemetaan kota/angka yang saling bertentangan, jadi website sengaja tidak menebak atau menyajikan data itu sebagai fakta. Sebelum menampilkan rekomendasi kota, verifikasi tabel spesialisasi crafting/refining dan mekanik RRR terhadap tooltip dalam game serta sumber komunitas primer yang bisa dirujuk; catat tanggal verifikasi/patch dan buat test untuk setiap mapping/rumus.

Kalkulator pada tahap ini menggunakan RRR yang dimasukkan pengguna dan rumus estimasi sederhana: biaya material efektif = biaya bahan × (1 − RRR); profit estimasi = pendapatan setelah biaya jual − biaya material efektif − biaya stasiun. Rumus ini **tidak** mengasumsikan pembulatan return ke unit game, biaya fokus, pajak/premi spesifik, quality chance, atau bonus yang belum dimodelkan. Jangan gunakan hasilnya sebagai angka game-exact sampai semantik RRR, pembulatan, resep per item, dan biaya lain diverifikasi.

## Catatan aksesibilitas dan QA lanjutan

Struktur dan warna disiapkan dengan target WCAG 2.2 AA; sebelum rilis, jalankan contrast checks pada semua 18 kombinasi tema dan pengujian keyboard/screen reader. Kalkulator memerlukan unit test dan test pembanding dengan beberapa resep/hasil tooltip dalam game sebelum dianggap akurat.
