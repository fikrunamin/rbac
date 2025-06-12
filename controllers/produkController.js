const Produk = require('../models/Produk');

class ProdukController {
  static async index(req, res) {
    res.render('produk/index', {
      title: 'Daftar Produk',
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

      const result = await Produk.findAll({
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
    res.render('produk/create', {
      title: 'Tambah Produk',
      error: req.flash('error')
    });
  }

  static async store(req, res) {
    try {
      const { nama, harga, stok, deskripsi } = req.body;
      
      await Produk.create({
        nama,
        harga: parseFloat(harga),
        stok: parseInt(stok),
        deskripsi
      });

      req.flash('success', 'Produk berhasil ditambahkan');
      res.redirect('/produk');
    } catch (error) {
      console.error('Error storing product:', error);
      req.flash('error', 'Gagal menambahkan produk');
      res.redirect('/produk/create');
    }
  }

  static async edit(req, res) {
    try {
      const produk = await Produk.findById(req.params.id);
      if (!produk) {
        req.flash('error', 'Produk tidak ditemukan');
        return res.redirect('/produk');
      }

      res.render('produk/edit', {
        title: 'Edit Produk',
        produk,
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error in edit:', error);
      req.flash('error', 'Gagal memuat data produk');
      res.redirect('/produk');
    }
  }

  static async update(req, res) {
    try {
      const { nama, harga, stok, deskripsi } = req.body;
      const id = req.params.id;

      await Produk.update(id, {
        nama,
        harga: parseFloat(harga),
        stok: parseInt(stok),
        deskripsi
      });

      req.flash('success', 'Produk berhasil diperbarui');
      res.redirect('/produk');
    } catch (error) {
      console.error('Error updating product:', error);
      req.flash('error', 'Gagal memperbarui produk');
      res.redirect(`/produk/edit/${req.params.id}`);
    }
  }

  static async delete(req, res) {
    try {
      await Produk.delete(req.params.id);
      req.flash('success', 'Produk berhasil dihapus');
      res.redirect('/produk');
    } catch (error) {
      console.error('Error deleting product:', error);
      req.flash('error', 'Gagal menghapus produk');
      res.redirect('/produk');
    }
  }
}

module.exports = ProdukController;