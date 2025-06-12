const knex = require('knex')(require('../knexfile').development);

class PengirimanController {
  static async index(req, res) {
    try {
      const pesanan = await knex('pesanan')
        .join('pelanggan', 'pesanan.pelanggan_id', 'pelanggan.id')
        .select(
          'pesanan.*',
          'pelanggan.nama as pelanggan_nama',
          'pelanggan.email as pelanggan_email',
          'pelanggan.alamat as pelanggan_alamat',
          'pelanggan.telepon as pelanggan_telepon'
        )
        .where('pesanan.id', req.params.pesanan_id)
        .first();

      if (!pesanan) {
        req.flash('error', 'Pesanan tidak ditemukan');
        return res.redirect('/pesanan');
      }

      res.render('pengiriman/index', {
        title: 'Pengiriman Pesanan',
        pesanan,
        error: req.flash('error'),
        success: req.flash('success')
      });
    } catch (error) {
      console.error('Error in pengiriman index:', error);
      req.flash('error', 'Gagal memuat halaman pengiriman');
      res.redirect('/pesanan');
    }
  }

  static async datatable(req, res) {
    try {
      const { draw, order, start, length, search } = req.query;
      const pesanan_id = req.params.pesanan_id;
      
      const query = knex('pengiriman')
        .where('pesanan_id', pesanan_id);

      // Search
      if (search && search.value) {
        const searchValue = search.value.toLowerCase();
        query.where(function() {
          this.whereRaw('LOWER(kurir) LIKE ?', [`%${searchValue}%`])
              .orWhereRaw('LOWER(no_resi) LIKE ?', [`%${searchValue}%`])
              .orWhereRaw('LOWER(status) LIKE ?', [`%${searchValue}%`]);
        });
      }

      // Count total records
      const total = await knex('pengiriman')
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
        const columns = ['id', 'kurir', 'no_resi', 'tanggal_kirim', 'status'];
        if (columns[column]) {
          query.orderBy(columns[column], dir);
        }
      } else {
        query.orderBy('tanggal_kirim', 'desc');
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
      console.error('Error in pengiriman datatable:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
  }

  static async store(req, res) {
    try {
      const { pesanan_id } = req.params;
      const { kurir, alamat_tujuan } = req.body;

      // Validasi pesanan
      const pesanan = await knex('pesanan')
        .where('id', pesanan_id)
        .first();

      if (!pesanan) {
        req.flash('error', 'Pesanan tidak ditemukan');
        return res.redirect('/pesanan');
      }

      if (pesanan.status === 'dibatalkan') {
        req.flash('error', 'Tidak dapat membuat pengiriman untuk pesanan yang dibatalkan');
        return res.redirect(`/pengiriman/${pesanan_id}`);
      }

      // Validasi pembayaran
      const totalBayar = await knex('pembayaran')
        .where('pesanan_id', pesanan_id)
        .where('status', 'diterima')
        .sum('jumlah as total')
        .first();

      const totalPesanan = await knex('pesanan_has_produk')
        .where('pesanan_id', pesanan_id)
        .sum('jumlah * harga_satuan as total')
        .first();

      if (!totalBayar.total || totalBayar.total < totalPesanan.total) {
        req.flash('error', 'Pembayaran belum lunas');
        return res.redirect(`/pengiriman/${pesanan_id}`);
      }

      // Buat pengiriman baru
      await knex('pengiriman').insert({
        pesanan_id,
        kurir,
        alamat_tujuan,
        tanggal_kirim: new Date(),
        status: 'diproses'
      });

      // Update status pesanan
      await knex('pesanan')
        .where('id', pesanan_id)
        .update({
          status: 'diproses'
        });

      req.flash('success', 'Pengiriman berhasil dibuat');
      res.redirect(`/pengiriman/${pesanan_id}`);
    } catch (error) {
      console.error('Error creating shipment:', error);
      req.flash('error', 'Gagal membuat pengiriman');
      res.redirect(`/pengiriman/${req.params.pesanan_id}`);
    }
  }

  static async update(req, res) {
    try {
      const { id, pesanan_id } = req.params;
      const { no_resi, status } = req.body;

      // Update pengiriman
      await knex('pengiriman')
        .where('id', id)
        .update({
          no_resi,
          status
        });

      // Jika pengiriman selesai, update status pesanan
      if (status === 'selesai') {
        await knex('pesanan')
          .where('id', pesanan_id)
          .update({
            status: 'selesai'
          });
      }

      req.flash('success', 'Status pengiriman berhasil diperbarui');
      res.redirect(`/pengiriman/${pesanan_id}`);
    } catch (error) {
      console.error('Error updating shipment:', error);
      req.flash('error', 'Gagal memperbarui status pengiriman');
      res.redirect(`/pengiriman/${req.params.pesanan_id}`);
    }
  }
}

module.exports = PengirimanController;