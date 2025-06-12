const knex = require('knex')(require('../knexfile').development);
// const datatableHelper = require('../utils/datatable');
const { Editor, Field } = require('datatables.net-editor-server');

class PesananController {
  static async index(req, res) {
    try {
      res.render('pesanan/index', {
        error: req.flash('error'),
        success: req.flash('success')
      });
    } catch (error) {
      console.error('Error fetching todos:', error);
      req.flash('error', 'Gagal mengambil daftar pesanan');
      res.redirect('/dashboard');
    }
  }

  static async datatable(req, res) {
    try {
      let editor = new Editor(knex, 'pesanan', 'pesanan.id_pesanan')
        .fields(
          new Field('pesanan.id_pesanan'),
          new Field('pesanan.tanggal_pesanan'),
          new Field('pesanan.status'),
          new Field('pesanan.total_harga'),
          new Field('pelanggan.nama'),
          new Field('pelanggan.alamat'),
          new Field('pengiriman.nomor_resi'),
          new Field('pengiriman.status_pengiriman'),
          new Field('pembayaran.metode_pembayaran'),
          new Field('pembayaran.status'),
        )
        .leftJoin('pelanggan', 'pesanan.id_pelanggan', '=', 'pelanggan.id_pelanggan')
        .leftJoin('pengiriman', 'pesanan.id_pesanan', '=', 'pengiriman.id_pesanan')
        .leftJoin('pembayaran', 'pesanan.id_pesanan', '=', 'pembayaran.id_pesanan');

      await editor.process(req.body);

      res.json(editor.data());
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to process data', detail: error.message });
    }
  }
}

module.exports = PesananController;