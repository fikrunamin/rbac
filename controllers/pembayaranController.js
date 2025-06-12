const knex = require('knex')(require('../knexfile').development);

class PembayaranController {
  static async index(req, res) {
    try {
      const pesanan = await knex('pesanan')
        .join('pelanggan', 'pesanan.pelanggan_id', 'pelanggan.id')
        .select(
          'pesanan.*',
          'pelanggan.nama as pelanggan_nama',
          'pelanggan.email as pelanggan_email'
        )
        .where('pesanan.id', req.params.pesanan_id)
        .first();

      if (!pesanan) {
        req.flash('error', 'Pesanan tidak ditemukan');
        return res.redirect('/pesanan');
      }

      // Hitung total pesanan
      const totalPesanan = await knex('pesanan_has_produk')
        .where('pesanan_id', pesanan.id)
        .sum('jumlah * harga_satuan as total')
        .first();

      res.render('pembayaran/index', {
        title: 'Pembayaran Pesanan',
        pesanan,
        totalPesanan: totalPesanan.total,
        error: req.flash('error'),
        success: req.flash('success')
      });
    } catch (error) {
      console.error('Error in pembayaran index:', error);
      req.flash('error', 'Gagal memuat halaman pembayaran');
      res.redirect('/pesanan');
    }
  }

  static async datatable(req, res) {
    try {
      const { draw, order, start, length, search } = req.query;
      const pesanan_id = req.params.pesanan_id;
      
      const query = knex('pembayaran')
        .where('pesanan_id', pesanan_id);

      // Search
      if (search && search.value) {
        const searchValue = search.value.toLowerCase();
        query.where(function() {
          this.whereRaw('LOWER(metode) LIKE ?', [`%${searchValue}%`])
              .orWhereRaw('LOWER(status) LIKE ?', [`%${searchValue}%`]);
        });
      }

      // Count total records
      const total = await knex('pembayaran')
        .where('pesanan_id', pesanan_id)
        .count('* as count')
        .first();

      // Count filtered records
      const filtered = await query.clone()
        .count('* as count')
        .first();

      // Ordering
      // Tambahkan pengecekan untuk memastikan order ada dan memiliki elemen
      if (order && order[0]) {
        const column = order[0].column;
        const dir = order[0].dir;
        const columns = ['id', 'metode', 'jumlah', 'tanggal_pembayaran', 'status'];
        if (columns[column]) {
          query.orderBy(columns[column], dir);
        }
      } else {
        query.orderBy('tanggal_pembayaran', 'desc');
      }

      // Pagination
      const data = await query
        .offset(parseInt(start))
        .limit(parseInt(length));

      res.json({
        draw: parseInt(draw),
        recordsTotal: total.count,
        recordsFiltered: filtered.count,
        data: data
      });
    } catch (error) {
      console.error('Error in pembayaran datatable:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
  }

  static async store(req, res) {
    try {
      const { pesanan_id } = req.params;
      const { metode, jumlah } = req.body;

      // Validasi pesanan
      const pesanan = await knex('pesanan')
        .where('id', pesanan_id)
        .first();

      if (!pesanan) {
        req.flash('error', 'Pesanan tidak ditemukan');
        return res.redirect('/pesanan');
      }

      if (pesanan.status === 'dibatalkan') {
        req.flash('error', 'Tidak dapat menambah pembayaran untuk pesanan yang dibatalkan');
        return res.redirect(`/pembayaran/${pesanan_id}`);
      }

      // Hitung total yang sudah dibayar
      const totalBayar = await knex('pembayaran')
        .where('pesanan_id', pesanan_id)
        .where('status', 'diterima')
        .sum('jumlah as total')
        .first();

      // Hitung total pesanan
      const totalPesanan = await knex('pesanan_has_produk')
        .where('pesanan_id', pesanan_id)
        .sum('jumlah * harga_satuan as total')
        .first();

      const sisaTagihan = totalPesanan.total - (totalBayar.total || 0);

      if (jumlah > sisaTagihan) {
        req.flash('error', 'Jumlah pembayaran melebihi sisa tagihan');
        return res.redirect(`/pembayaran/${pesanan_id}`);
      }

      // Tambah pembayaran baru
      await knex('pembayaran').insert({
        pesanan_id,
        metode,
        jumlah,
        tanggal_pembayaran: new Date(),
        status: 'pending'
      });

      req.flash('success', 'Pembayaran berhasil ditambahkan');
      res.redirect(`/pembayaran/${pesanan_id}`);
    } catch (error) {
      console.error('Error storing payment:', error);
      req.flash('error', 'Gagal menambah pembayaran');
      res.redirect(`/pembayaran/${req.params.pesanan_id}`);
    }
  }

  static async update(req, res) {
    try {
      const { id, pesanan_id } = req.params;
      const { status } = req.body;

      // Update status pembayaran
      await knex('pembayaran')
        .where('id', id)
        .update({
          status
        });

      // Jika pembayaran diterima, cek apakah total pembayaran sudah mencukupi
      if (status === 'diterima') {
        const totalBayar = await knex('pembayaran')
          .where('pesanan_id', pesanan_id)
          .where('status', 'diterima')
          .sum('jumlah as total')
          .first();

        const totalPesanan = await knex('pesanan_has_produk')
          .where('pesanan_id', pesanan_id)
          .sum('jumlah * harga_satuan as total')
          .first();

        // Jika pembayaran sudah lunas, update status pesanan
        if (totalBayar.total >= totalPesanan.total) {
          await knex('pesanan')
            .where('id', pesanan_id)
            .update({
              status: 'diproses'
            });
        }
      }

      req.flash('success', 'Status pembayaran berhasil diperbarui');
      res.redirect(`/pembayaran/${pesanan_id}`);
    } catch (error) {
      console.error('Error updating payment:', error);
      req.flash('error', 'Gagal memperbarui status pembayaran');
      res.redirect(`/pembayaran/${req.params.pesanan_id}`);
    }
  }
}

module.exports = PembayaranController;