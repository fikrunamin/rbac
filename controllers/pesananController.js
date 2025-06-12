const Pesanan = require('../models/Pesanan');
const Pelanggan = require('../models/Pelanggan');
const Produk = require('../models/Produk');

const pesananController = {
  // Menampilkan daftar pesanan
  index: async (req, res) => {
    try {
      const pesanan = await Pesanan.getAll();
      res.render('pesanan/index', { pesanan });
    } catch (error) {
      req.flash('error', 'Gagal mengambil data pesanan');
      res.redirect('/');
    }
  },

  // Menampilkan form tambah pesanan
  create: async (req, res) => {
    try {
      const pelanggan = await Pelanggan.getAll();
      const produk = await Produk.getAll();
      res.render('pesanan/create', { pelanggan, produk });
    } catch (error) {
      req.flash('error', 'Gagal memuat form pesanan');
      res.redirect('/pesanan');
    }
  },

  // Menyimpan pesanan baru
  store: async (req, res) => {
    try {
      const { pelanggan_id, produk } = req.body;

      // Validasi input
      if (!pelanggan_id || !produk || !produk.length) {
        req.flash('error', 'Data pesanan tidak lengkap');
        return res.redirect('/pesanan/create');
      }

      // Validasi stok produk
      for (const item of produk) {
        const produkData = await Produk.getById(item.produk_id);
        if (!produkData || produkData.stok < item.jumlah) {
          req.flash('error', `Stok ${produkData.nama} tidak mencukupi`);
          return res.redirect('/pesanan/create');
        }
      }

      // Buat pesanan
      const pesanan = await Pesanan.create({
        pelanggan_id,
        produk: produk.map(item => ({
          ...item,
          harga_satuan: parseFloat(item.harga_satuan)
        }))
      });

      // Update stok produk
      for (const item of produk) {
        await Produk.updateStok(item.produk_id, -item.jumlah);
      }

      req.flash('success', 'Pesanan berhasil dibuat');
      res.redirect(`/pesanan/${pesanan.id}`);
    } catch (error) {
      req.flash('error', 'Gagal membuat pesanan');
      res.redirect('/pesanan/create');
    }
  },

  // Menampilkan detail pesanan
  detail: async (req, res) => {
    try {
      const pesanan = await Pesanan.getById(req.params.id);
      if (!pesanan) {
        req.flash('error', 'Pesanan tidak ditemukan');
        return res.redirect('/pesanan');
      }
      res.render('pesanan/detail', { pesanan });
    } catch (error) {
      req.flash('error', 'Gagal mengambil detail pesanan');
      res.redirect('/pesanan');
    }
  },

  // Menampilkan form pembayaran
  pembayaran: async (req, res) => {
    try {
      const pesanan = await Pesanan.getById(req.params.pesanan_id);
      if (!pesanan) {
        req.flash('error', 'Pesanan tidak ditemukan');
        return res.redirect('/pesanan');
      }
      res.render('pembayaran/form', { pesanan });
    } catch (error) {
      req.flash('error', 'Gagal memuat form pembayaran');
      res.redirect('/pesanan');
    }
  },

  // Memproses pembayaran
  prosesPembayaran: async (req, res) => {
    try {
      const { pesanan_id, metode, jumlah, status } = req.body;

      // Validasi input
      if (!metode || !jumlah) {
        req.flash('error', 'Data pembayaran tidak lengkap');
        return res.redirect(`/pembayaran/${pesanan_id}`);
      }

      await Pesanan.createPembayaran({
        pesanan_id,
        metode,
        jumlah: parseFloat(jumlah),
        status
      });

      req.flash('success', 'Pembayaran berhasil diproses');
      res.redirect(`/pesanan/${pesanan_id}`);
    } catch (error) {
      req.flash('error', 'Gagal memproses pembayaran');
      res.redirect(`/pembayaran/${req.body.pesanan_id}`);
    }
  },

  // Menampilkan form pengiriman
  pengiriman: async (req, res) => {
    try {
      const pesanan = await Pesanan.getById(req.params.pesanan_id);
      if (!pesanan) {
        req.flash('error', 'Pesanan tidak ditemukan');
        return res.redirect('/pesanan');
      }
      res.render('pengiriman/form', { pesanan });
    } catch (error) {
      req.flash('error', 'Gagal memuat form pengiriman');
      res.redirect('/pesanan');
    }
  },

  // Memproses pengiriman
  prosesPengiriman: async (req, res) => {
    try {
      const { pesanan_id, alamat_tujuan, kurir, no_resi } = req.body;

      // Validasi input
      if (!alamat_tujuan || !kurir) {
        req.flash('error', 'Data pengiriman tidak lengkap');
        return res.redirect(`/pengiriman/${pesanan_id}`);
      }

      await Pesanan.createPengiriman({
        pesanan_id,
        alamat_tujuan,
        kurir,
        no_resi
      });

      req.flash('success', 'Pengiriman berhasil diproses');
      res.redirect(`/pesanan/${pesanan_id}`);
    } catch (error) {
      req.flash('error', 'Gagal memproses pengiriman');
      res.redirect(`/pengiriman/${req.body.pesanan_id}`);
    }
  },

  // Update status pengiriman
  updateStatusPengiriman: async (req, res) => {
    try {
      const { id, status } = req.body;
      await Pesanan.updatePengirimanStatus(id, status);
      req.flash('success', 'Status pengiriman berhasil diupdate');
      res.redirect('back');
    } catch (error) {
      req.flash('error', 'Gagal mengupdate status pengiriman');
      res.redirect('back');
    }
  }
};

module.exports = pesananController;