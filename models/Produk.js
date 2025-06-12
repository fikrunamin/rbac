const knex = require('knex');
const knexfile = require('../knexfile');
const db = knex(knexfile.development);

class Produk {
  static async getAll() {
    return await db('produk').select('*');
  }

  static async getById(id) {
    return await db('produk')
      .where('id', id)
      .first();
  }

  static async create(data) {
    const [id] = await db('produk')
      .insert({
        nama: data.nama,
        harga: data.harga,
        stok: data.stok,
        deskripsi: data.deskripsi
      })
      .returning('id');
    
    return this.getById(id);
  }

  static async update(id, data) {
    await db('produk')
      .where('id', id)
      .update({
        nama: data.nama,
        harga: data.harga,
        stok: data.stok,
        deskripsi: data.deskripsi
      });
    
    return this.getById(id);
  }

  static async delete(id) {
    return await db('produk')
      .where('id', id)
      .del();
  }

  static async updateStok(id, jumlah) {
    await db('produk')
      .where('id', id)
      .increment('stok', jumlah);
    
    return this.getById(id);
  }
}

module.exports = Produk;