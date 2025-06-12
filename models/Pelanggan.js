const knex = require('knex');
const knexfile = require('../knexfile');
const db = knex(knexfile.development);

class Pelanggan {
  static async getAll() {
    return await db('pelanggan').select('*');
  }

  static async getById(id) {
    return await db('pelanggan')
      .where('id', id)
      .first();
  }

  static async getByEmail(email) {
    return await db('pelanggan')
      .where('email', email)
      .first();
  }

  static async create(data) {
    const [id] = await db('pelanggan')
      .insert({
        nama: data.nama,
        email: data.email,
        alamat: data.alamat,
        telepon: data.telepon
      })
      .returning('id');
    
    return this.getById(id);
  }

  static async update(id, data) {
    await db('pelanggan')
      .where('id', id)
      .update({
        nama: data.nama,
        email: data.email,
        alamat: data.alamat,
        telepon: data.telepon
      });
    
    return this.getById(id);
  }

  static async delete(id) {
    return await db('pelanggan')
      .where('id', id)
      .del();
  }

  static async getPesanan(id) {
    return await db('pesanan')
      .where('pelanggan_id', id)
      .select('*');
  }

  static async getTotalPesanan(id) {
    const result = await db('pesanan')
      .where('pelanggan_id', id)
      .count('id as total')
      .first();
    return result.total;
  }

  static async getTotalNilaiPembayaran(id) {
    const result = await db('pesanan')
      .join('pembayaran', 'pesanan.id', 'pembayaran.pesanan_id')
      .where('pesanan.pelanggan_id', id)
      .where('pembayaran.status', 'berhasil')
      .sum('pembayaran.jumlah as total')
      .first();
    return result.total || 0;
  }
}

module.exports = Pelanggan;