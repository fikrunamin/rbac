const Pesanan = require('../models/Pesanan');
const Produk = require('../models/Produk');
const Pelanggan = require('../models/Pelanggan');

class PesananController {
  static async index(req, res) {
    res.render('pesanan/index', {
      title: 'Daftar Pesanan',
      error: req.flash('error'),
      success: req.flash('success')
    });
  }

  static async datatable(req, res) {
    try {
      const { draw, order, start, length, search } = req.query;
      
      // Tambahkan pengecekan untuk memastikan order ada dan memiliki elemen
      const orderColumn = order && order[0] ? order[0].column : 'pesanan.id';
      const orderDir = order && order[0] ? order[0].dir : 'asc';
      const searchValue = search ? search.value : '';

      const result = await Pesanan.findAll({
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
    try {
      const pelanggan = await Pelanggan.findById(req.query.pelanggan_id);
      const produk = await Produk.findAll();

      if (!pelanggan) {
        req.flash('error', 'Pelanggan tidak ditemukan');
        return res.redirect('/pelanggan');
      }

      res.render('pesanan/create', {
        title: 'Buat Pesanan',
        pelanggan,
        produk: produk.data,
        error: req.flash('error')
      });
    } catch (error) {
      console.error('Error in create:', error);
      req.flash('error', 'Gagal memuat form pesanan');
      res.redirect('/pelanggan');
    }
  }

  static async store(req, res) {
    try {
      const { pelanggan_id, produk_items } = req.body;
      
      // Validasi stok produk
      for (const item of produk_items) {
        const produk = await Produk.findById(item.produk_id);
        if (produk.stok < item.jumlah) {
          req.flash('error', `Stok ${produk.nama} tidak mencukupi`);
          return res.redirect(`/pesanan/create?pelanggan_id=${pelanggan_id}`);
        }
      }

      // Buat pesanan baru
      const pesananId = await Pesanan.create({
        pelanggan_id,
        tanggal_pesanan: new Date(),
        status: 'pending'
      });

      // Tambahkan produk ke pesanan
      for (const item of produk_items) {
        const produk = await Produk.findById(item.produk_id);
        await Pesanan.addProduk(pesananId, item.produk_id, item.jumlah, produk.harga);
        
        // Update stok produk
        await Produk.update(item.produk_id, {
          stok: produk.stok - item.jumlah
        });
      }

      req.flash('success', 'Pesanan berhasil dibuat');
      res.redirect(`/pelanggan/${pelanggan_id}/pesanan`);
    } catch (error) {
      console.error('Error storing order:', error);
      req.flash('error', 'Gagal membuat pesanan');
      res.redirect(`/pesanan/create?pelanggan_id=${req.body.pelanggan_id}`);
    }
  }

  static async show(req, res) {
    try {
      const pesanan = await Pesanan.findById(req.params.id);
      if (!pesanan) {
        req.flash('error', 'Pesanan tidak ditemukan');
        return res.redirect('/pesanan');
      }

      const produk = await Pesanan.getProduk(req.params.id);

      res.render('pesanan/detail', {
        title: 'Detail Pesanan',
        pesanan,
        produk: produk.data,
        error: req.flash('error'),
        success: req.flash('success')
      });
    } catch (error) {
      console.error('Error showing order:', error);
      req.flash('error', 'Gagal memuat detail pesanan');
      res.redirect('/pesanan');
    }
  }

  static async delete(req, res) {
    try {
      const pesanan = await Pesanan.findById(req.params.id);
      if (!pesanan) {
        req.flash('error', 'Pesanan tidak ditemukan');
        return res.redirect('/pesanan');
      }

      await Pesanan.update(req.params.id, { status: 'dibatalkan' });
      
      req.flash('success', 'Pesanan berhasil dibatalkan');
      res.redirect(`/pelanggan/${pesanan.pelanggan_id}/pesanan`);
    } catch (error) {
      console.error('Error canceling order:', error);
      req.flash('error', 'Gagal membatalkan pesanan');
      res.redirect('/pesanan');
    }
  }

  static async produkDatatable(req, res) {
    try {
      const { draw, order, start, length, search } = req.query;
      
      // Tambahkan pengecekan untuk memastikan order ada dan memiliki elemen
      const orderColumn = order && order[0] ? order[0].column : 'produk.nama';
      const orderDir = order && order[0] ? order[0].dir : 'asc';
      const searchValue = search ? search.value : '';

      const result = await Pesanan.getProduk(req.params.id, {
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
      console.error('Error in produk datatable:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
  }
}

module.exports = PesananController;