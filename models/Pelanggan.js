const knex = require('knex')(require('../knexfile')[process.env.NODE_ENV || 'development']);

class Pelanggan {
  static async findAll(options = {}) {
    const { searchValue, orderColumn = 'id', orderDir = 'asc', start = 0, length = 10 } = options;
    
    const query = knex('pelanggan');
    
    if (searchValue) {
      query.where(function() {
        this.where('nama', 'like', `%${searchValue}%`)
            .orWhere('email', 'like', `%${searchValue}%`)
            .orWhere('telepon', 'like', `%${searchValue}%`);
      });
    }
    
    const total = await knex('pelanggan').count('id as total').first();
    const filtered = await query.clone().count('id as total').first();
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
    return await knex('pelanggan').where('id', id).first();
  }

  static async create(data) {
    const [id] = await knex('pelanggan').insert(data);
    return id;
  }

  static async update(id, data) {
    return await knex('pelanggan').where('id', id).update(data);
  }

  static async delete(id) {
    return await knex('pelanggan').where('id', id).del();
  }

  static async getPesanan(id) {
    return await knex('pesanan')
      .where('pelanggan_id', id)
      .orderBy('tanggal_pesanan', 'desc');
  }
}

module.exports = Pelanggan;