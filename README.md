# Albion Workshop

Website statis gratis untuk kalkulator crafting dan refining Albion Online. Harga pasar, resep, RRR, dan biaya diinput pengguna; tidak ada API harga otomatis.

## Menjalankan dan menguji

Buka `index.html` di browser atau host folder ini sebagai website statis. Tidak ada dependency runtime. Jalankan test logika dengan Node.js: `npm test`.

## Kalkulator dan cara pakai

1. Pilih Crafting atau Refining, lalu isi jumlah output dan batch.
2. Tambahkan semua bahan resep. Isi kuantitas per batch dan harga per unit; matikan `Dapat return` untuk bahan yang tidak dikembalikan.
3. Masukkan RRR dari UI game, harga jual, dan biaya yang ingin dihitung. Biaya fokus adalah biaya peluang opsional; isi nilai per point hanya jika ingin memperhitungkannya.
4. Pilih model return dan hitung. Bila input diubah sesudah hasil muncul, hasil lama disembunyikan hingga dihitung ulang.

### Asumsi model

- RRR adalah persentase total yang pengguna baca dari game, bukan dihitung dari asumsi bonus kota atau mastery.
- **Ekspektasi pecahan** menunjukkan rata-rata matematis `kuantitas × RRR`; tidak menyatakan jumlah unit yang pasti diperoleh pada satu produksi.
- **Simulasi floor per batch** membulatkan ke bawah `kuantitas × RRR` untuk setiap baris bahan pada setiap batch. Ini hanya skenario what-if, bukan klaim pembulatan aktual game.
- Biaya bahan = nilai seluruh bahan awal dikurangi nilai bahan yang kembali.
- Pendapatan bersih = pendapatan kotor dikurangi persentase pajak dan biaya sell order yang pengguna masukkan. Pengguna bertanggung jawab memastikan tarif tersebut berlaku dan tidak memasukkan komponen yang sama dua kali.
- Profit = pendapatan bersih − bahan yang dikonsumsi − biaya stasiun − biaya peluang fokus opsional.
- Aritmetika menggunakan JavaScript Number; pajak/fee silver tidak dibulatkan menurut aturan game. Tidak ada recipe database, formula biaya fokus, journal return, item quality, transport, atau rekomendasi bonus kota.

## Akurasi dan verifikasi

Program melakukan aritmetika transparan berdasarkan input, tetapi belum mengklaim hasil game-exact. Informasi online yang ditinjau tidak konsisten mengenai bonus kota, RRR, pajak, dan cara rounding. Gunakan nilai yang ditampilkan game dan bandingkan skenario rounding dengan transaksi uji. Fitur otomatis hanya akan ditambahkan setelah datanya dapat diverifikasi terhadap bukti dalam game dan sumber yang bisa dirujuk.

## Tema dan aksesibilitas

Enam palet (Modern Minimalist, Albion Inspired, Soft & Comfortable, Maroon Elegance, Forest Harmony, Mocha Serenity) masing-masing bisa dipadukan dengan Light, Dark, atau System. Pilihan independen dan hanya preferensi tema disimpan di `localStorage`; tema tidak mengakses data kalkulator. Interface menyediakan semantic labels, keyboard focus indicator, skip link, reduced motion, serta token warna konsisten.
