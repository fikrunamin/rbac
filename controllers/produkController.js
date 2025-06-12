const Produk = require('../models/Produk');

const produkController = {
  // Menampilkan daftar produk
  index: async (req, res) => {
    try {
      const produk = await Produk.getAll();
      res.render('produk/index', { produk });
    } catch (error) {
      req.flash('error', 'Gagal mengambil data produk');
      res.redirect('/');
    }
  },

  // Menampilkan form tambah produk
  create: (req, res) => {
    res.render('produk/create');
  },

  // Menyimpan produk baru
  store: async (req, res) => {
    try {
      const { nama, harga, stok, deskripsi } = req.body;

      // Validasi input
      if (!nama || !harga || !stok) {
        req.flash('error', 'Nama, harga, dan stok harus diisi');
        return res.redirect('/produk/create');
      }

      await Produk.create({
        nama,
        harga: parseFloat(harga),
        stok: parseInt(stok),
        deskripsi
      });

      req.flash('success', 'Produk berhasil ditambahkan');
      res.redirect('/produk');
    } catch (error) {
      req.flash('error', 'Gagal menambahkan produk');
      res.redirect('/produk/create');
    }
  },

  // Menampilkan form edit produk
  edit: async (req, res) => {
    try {
      const produk = await Produk.getById(req.params.id);
      if (!produk) {
        req.flash('error', 'Produk tidak ditemukan');
        return res.redirect('/produk');
      }
      res.render('produk/edit', { produk });
    } catch (error) {
      req.flash('error', 'Gagal mengambil data produk');
      res.redirect('/produk');
    }
  },

  // Mengupdate produk
  update: async (req, res) => {
    try {
      const { nama, harga, stok, deskripsi } = req.body;
      const { id } = req.params;

      // Validasi input
      if (!nama || !harga || !stok) {
        req.flash('error', 'Nama, harga, dan stok harus diisi');
        return res.redirect(`/produk/edit/${id}`);
      }

      await Produk.update(id, {
        nama,
        harga: parseFloat(harga),
        stok: parseInt(stok),
        deskripsi
      });

      req.flash('success', 'Produk berhasil diupdate');
      res.redirect('/produk');
    } catch (error) {
      req.flash('error', 'Gagal mengupdate produk');
      res.redirect(`/produk/edit/${req.params.id}`);
    }
  },

  // Menghapus produk
  delete: async (req, res) => {
    try {
      await Produk.delete(req.params.id);
      req.flash('success', 'Produk berhasil dihapus');
      res.redirect('/produk');
    } catch (error) {
      req.flash('error', 'Gagal menghapus produk');
      res.redirect('/produk');
    }
  }
};

module.exports = produkController;