const knex = require('knex');
const knexfile = require('../knexfile');
const db = knex(knexfile.development);

class Pesanan {
  static async getAll() {
    return await db('pesanan')
      .join('pelanggan', 'pesanan.pelanggan_id', 'pelanggan.id')
      .select(
        'pesanan.*',
        'pelanggan.nama as nama_pelanggan',
        'pelanggan.email as email_pelanggan'
      );
  }

  static async getById(id) {
    const pesanan = await db('pesanan')
      .join('pelanggan', 'pesanan.pelanggan_id', 'pelanggan.id')
      .where('pesanan.id', id)
      .select(
        'pesanan.*',
        'pelanggan.nama as nama_pelanggan',
        'pelanggan.email as email_pelanggan'
      )
      .first();

    if (pesanan) {
      pesanan.produk = await this.getProdukPesanan(id);
      pesanan.pembayaran = await this.getPembayaran(id);
      pesanan.pengiriman = await this.getPengiriman(id);
    }

    return pesanan;
  }

  static async create(data) {
    const trx = await db.transaction();

    try {
      // Insert pesanan
      const [pesananId] = await trx('pesanan')
        .insert({
          pelanggan_id: data.pelanggan_id,
          tanggal_pesanan: new Date(),
          status: 'pending'
        })
        .returning('id');

      // Insert produk pesanan
      const produkPesanan = data.produk.map(item => ({
        pesanan_id: pesananId,
        produk_id: item.produk_id,
        jumlah: item.jumlah,
        harga_satuan: item.harga_satuan
      }));

      await trx('pesanan_has_produk').insert(produkPesanan);

      // Commit transaction
      await trx.commit();

      return this.getById(pesananId);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async updateStatus(id, status) {
    await db('pesanan')
      .where('id', id)
      .update({ status });
    
    return this.getById(id);
  }

  static async getProdukPesanan(pesananId) {
    return await db('pesanan_has_produk')
      .join('produk', 'pesanan_has_produk.produk_id', 'produk.id')
      .where('pesanan_id', pesananId)
      .select(
        'pesanan_has_produk.*',
        'produk.nama as nama_produk',
        'produk.deskripsi'
      );
  }

  static async getPembayaran(pesananId) {
    return await db('pembayaran')
      .where('pesanan_id', pesananId)
      .first();
  }

  static async getPengiriman(pesananId) {
    return await db('pengiriman')
      .where('pesanan_id', pesananId)
      .first();
  }

  static async createPembayaran(data) {
    const [id] = await db('pembayaran')
      .insert({
        pesanan_id: data.pesanan_id,
        metode: data.metode,
        jumlah: data.jumlah,
        tanggal_pembayaran: new Date(),
        status: data.status || 'belum'
      })
      .returning('id');

    if (data.status === 'berhasil') {
      await this.updateStatus(data.pesanan_id, 'dibayar');
    }

    return await db('pembayaran').where('id', id).first();
  }

  static async createPengiriman(data) {
    const [id] = await db('pengiriman')
      .insert({
        pesanan_id: data.pesanan_id,
        alamat_tujuan: data.alamat_tujuan,
        kurir: data.kurir,
        no_resi: data.no_resi,
        tanggal_kirim: new Date(),
        status: 'diproses'
      })
      .returning('id');

    await this.updateStatus(data.pesanan_id, 'dikirim');

    return await db('pengiriman').where('id', id).first();
  }

  static async updatePengirimanStatus(id, status) {
    const pengiriman = await db('pengiriman')
      .where('id', id)
      .update({ status })
      .returning('*')
      .first();

    if (status === 'diterima') {
      await this.updateStatus(pengiriman.pesanan_id, 'selesai');
    }

    return pengiriman;
  }
}

module.exports = Pesanan;