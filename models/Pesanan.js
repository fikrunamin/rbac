const knex = require('knex')(require('../knexfile')[process.env.NODE_ENV || 'development']);

class Pesanan {
  static async findAll(options = {}) {
    const { searchValue, orderColumn = 'pesanan.id', orderDir = 'asc', start = 0, length = 10 } = options;
    
    const query = knex('pesanan')
      .join('pelanggan', 'pesanan.pelanggan_id', '=', 'pelanggan.id')
      .select(
        'pesanan.*',
        'pelanggan.nama as nama_pelanggan',
        'pelanggan.email as email_pelanggan'
      );
    
    if (searchValue) {
      query.where(function() {
        this.where('pesanan.id', 'like', `%${searchValue}%`)
            .orWhere('pelanggan.nama', 'like', `%${searchValue}%`)
            .orWhere('pesanan.status', 'like', `%${searchValue}%`);
      });
    }
    
    const total = await knex('pesanan').count('id as total').first();
    const filtered = await query.clone().count('pesanan.id as total').first();
    const data = await query
      .offset(start)
      .limit(length)
      .orderBy(orderColumn, orderDir);
    
    return {
      total: total.total,
      filtered: filtered.total,
      data
    };
  }

  static async findById(id) {
    return await knex('pesanan')
      .join('pelanggan', 'pesanan.pelanggan_id', '=', 'pelanggan.id')
      .select(
        'pesanan.*',
        'pelanggan.nama as nama_pelanggan',
        'pelanggan.email as email_pelanggan',
        'pelanggan.alamat as alamat_pelanggan',
        'pelanggan.telepon as telepon_pelanggan'
      )
      .where('pesanan.id', id)
      .first();
  }

  static async create(data) {
    const [id] = await knex('pesanan').insert(data);
    return id;
  }

  static async update(id, data) {
    return await knex('pesanan').where('id', id).update(data);
  }

  static async delete(id) {
    return await knex('pesanan').where('id', id).del();
  }

  static async getProduk(pesananId, options = {}) {
    const { searchValue, orderColumn = 'produk.nama', orderDir = 'asc', start = 0, length = 10 } = options;
    
    const query = knex('pesanan_has_produk as php')
      .join('produk', 'php.produk_id', '=', 'produk.id')
      .where('php.pesanan_id', pesananId)
      .select(
        'php.*',
        'produk.nama as nama_produk',
        'produk.deskripsi as deskripsi_produk'
      );

    if (searchValue) {
      query.where('produk.nama', 'like', `%${searchValue}%`);
    }

    const total = await query.clone().count('* as total').first();
    const filtered = await query.clone().count('* as total').first();
    const data = await query
      .offset(start)
      .limit(length)
      .orderBy(orderColumn, orderDir);

    return {
      total: total.total,
      filtered: filtered.total,
      data
    };
  }

  static async addProduk(pesananId, produkId, jumlah, hargaSatuan) {
    return await knex('pesanan_has_produk').insert({
      pesanan_id: pesananId,
      produk_id: produkId,
      jumlah,
      harga_satuan: hargaSatuan
    });
  }
}

module.exports = Pesanan;