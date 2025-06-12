const Pelanggan = require('../models/Pelanggan');

class PelangganController {
  static async index(req, res) {
    res.render('pelanggan/index', {
      title: 'Daftar Pelanggan',
      error: req.flash('error'),
      success: req.flash('success')
    });
  }

  static async datatable(req, res) {
    try {
      const { draw, order, start, length, search } = req.query;
      
      // Tambahkan pengecekan untuk memastikan order ada dan memiliki elemen
      const orderColumn = order && order[0] ? order[0].column : 'id';
      const orderDir = order && order[0] ? order[0].dir : 'asc';
      const searchValue = search ? search.value : '';

      const result = await Pelanggan.findAll({
        searchValue,
        orderColumn,
        orderDir,
        start: parseInt(start),
        length: parseInt(length)
      });

      res.json({
        draw: parseInt(draw),
        recordsTotal: result.total,
        recordsFiltered: result.filtered,
        data: result.data
      });
    } catch (error) {
      console.error('Error in datatable:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
  }

  static async create(req, res) {
    res.render('pelanggan/create', {
      title: 'Tambah Pelanggan',
      error: req.flash('error')
    });
  }

  static async store(req, res) {
    try {
      const { nama, email, alamat, telepon } = req.body;
      
      await Pelanggan.create({
        nama,
        email,
        alamat,
        telepon
      });

      req.flash('success', 'Pelanggan berhasil ditambahkan');
      res.redirect('/pelanggan');
    } catch (error) {
      console.error('Error storing customer:', error);
      req.flash('error', 'Gagal menambahkan pelanggan');
      res.redirect('/pelanggan/create');
    }
  }

  static async edit(req, res) {
    try {
      const pelanggan = await Pelanggan.findById(req.params.id);
      if (!pelanggan) {
        req.flash('error', 'Pelanggan tidak ditemukan');
        return res.redirect('/pelanggan');
      }

      res.render('pelanggan/edit', {
        title: 'Edit Pelanggan',
        pelanggan,
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error in edit:', error);
      req.flash('error', 'Gagal memuat data pelanggan');
      res.redirect('/pelanggan');
    }
  }

  static async update(req, res) {
    try {
      const { nama, email, alamat, telepon } = req.body;
      const id = req.params.id;

      await Pelanggan.update(id, {
        nama,
        email,
        alamat,
        telepon
      });

      req.flash('success', 'Pelanggan berhasil diperbarui');
      res.redirect('/pelanggan');
    } catch (error) {
      console.error('Error updating customer:', error);
      req.flash('error', 'Gagal memperbarui pelanggan');
      res.redirect(`/pelanggan/edit/${req.params.id}`);
    }
  }

  static async delete(req, res) {
    try {
      await Pelanggan.delete(req.params.id);
      req.flash('success', 'Pelanggan berhasil dihapus');
      res.redirect('/pelanggan');
    } catch (error) {
      console.error('Error deleting customer:', error);
      req.flash('error', 'Gagal menghapus pelanggan');
      res.redirect('/pelanggan');
    }
  }

  static async pesanan(req, res) {
    try {
      const pelanggan = await Pelanggan.findById(req.params.id);
      if (!pelanggan) {
        req.flash('error', 'Pelanggan tidak ditemukan');
        return res.redirect('/pelanggan');
      }

      const pesanan = await Pelanggan.getPesanan(req.params.id);

      res.render('pelanggan/pesanan', {
        title: 'Daftar Pesanan Pelanggan',
        pelanggan,
        pesanan,
        error: req.flash('error'),
        success: req.flash('success')
      });
    } catch (error) {
      console.error('Error getting customer orders:', error);
      req.flash('error', 'Gagal memuat daftar pesanan');
      res.redirect('/pelanggan');
    }
  }
}

module.exports = PelangganController;