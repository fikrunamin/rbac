const Pelanggan = require('../models/Pelanggan');
const Pesanan = require('../models/Pesanan');

const pelangganController = {
  // Menampilkan daftar pelanggan
  index: async (req, res) => {
    try {
      const pelanggan = await Pelanggan.getAll();
      
      // Mengambil total pesanan dan nilai pembayaran untuk setiap pelanggan
      const pelangganData = await Promise.all(pelanggan.map(async (p) => {
        const totalPesanan = await Pelanggan.getTotalPesanan(p.id);
        const totalNilaiPembayaran = await Pelanggan.getTotalNilaiPembayaran(p.id);
        return {
          ...p,
          totalPesanan,
          totalNilaiPembayaran
        };
      }));

      res.render('pelanggan/index', { pelanggan: pelangganData });
    } catch (error) {
      req.flash('error', 'Gagal mengambil data pelanggan');
      res.redirect('/');
    }
  },

  // Menampilkan form tambah pelanggan
  create: (req, res) => {
    res.render('pelanggan/create');
  },

  // Menyimpan pelanggan baru
  store: async (req, res) => {
    try {
      const { nama, email, alamat, telepon } = req.body;

      // Validasi input
      if (!nama || !email) {
        req.flash('error', 'Nama dan email harus diisi');
        return res.redirect('/pelanggan/create');
      }

      // Cek email unik
      const existingPelanggan = await Pelanggan.getByEmail(email);
      if (existingPelanggan) {
        req.flash('error', 'Email sudah digunakan');
        return res.redirect('/pelanggan/create');
      }

      await Pelanggan.create({
        nama,
        email,
        alamat,
        telepon
      });

      req.flash('success', 'Pelanggan berhasil ditambahkan');
      res.redirect('/pelanggan');
    } catch (error) {
      req.flash('error', 'Gagal menambahkan pelanggan');
      res.redirect('/pelanggan/create');
    }
  },

  // Menampilkan form edit pelanggan
  edit: async (req, res) => {
    try {
      const pelanggan = await Pelanggan.getById(req.params.id);
      if (!pelanggan) {
        req.flash('error', 'Pelanggan tidak ditemukan');
        return res.redirect('/pelanggan');
      }
      res.render('pelanggan/edit', { pelanggan });
    } catch (error) {
      req.flash('error', 'Gagal mengambil data pelanggan');
      res.redirect('/pelanggan');
    }
  },

  // Mengupdate pelanggan
  update: async (req, res) => {
    try {
      const { nama, email, alamat, telepon } = req.body;
      const { id } = req.params;

      // Validasi input
      if (!nama || !email) {
        req.flash('error', 'Nama dan email harus diisi');
        return res.redirect(`/pelanggan/edit/${id}`);
      }

      // Cek email unik kecuali untuk pelanggan yang sedang diedit
      const existingPelanggan = await Pelanggan.getByEmail(email);
      if (existingPelanggan && existingPelanggan.id !== parseInt(id)) {
        req.flash('error', 'Email sudah digunakan');
        return res.redirect(`/pelanggan/edit/${id}`);
      }

      await Pelanggan.update(id, {
        nama,
        email,
        alamat,
        telepon
      });

      req.flash('success', 'Pelanggan berhasil diupdate');
      res.redirect('/pelanggan');
    } catch (error) {
      req.flash('error', 'Gagal mengupdate pelanggan');
      res.redirect(`/pelanggan/edit/${req.params.id}`);
    }
  },

  // Menghapus pelanggan
  delete: async (req, res) => {
    try {
      await Pelanggan.delete(req.params.id);
      req.flash('success', 'Pelanggan berhasil dihapus');
      res.redirect('/pelanggan');
    } catch (error) {
      req.flash('error', 'Gagal menghapus pelanggan');
      res.redirect('/pelanggan');
    }
  },

  // Menampilkan daftar pesanan pelanggan
  pesanan: async (req, res) => {
    try {
      const pelanggan = await Pelanggan.getById(req.params.id);
      if (!pelanggan) {
        req.flash('error', 'Pelanggan tidak ditemukan');
        return res.redirect('/pelanggan');
      }

      const pesanan = await Pelanggan.getPesanan(req.params.id);
      res.render('pelanggan/pesanan', { pelanggan, pesanan });
    } catch (error) {
      req.flash('error', 'Gagal mengambil data pesanan');
      res.redirect('/pelanggan');
    }
  }
};

module.exports = pelangganController;