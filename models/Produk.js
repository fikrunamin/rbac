const knex = require('knex')(require('../knexfile')[process.env.NODE_ENV || 'development']);

class Produk {
  static async findAll(options = {}) {
    const { searchValue, orderColumn = 'id', orderDir = 'asc', start = 0, length = 10 } = options;
    
    const query = knex('produk');
    
    if (searchValue) {
      query.where('nama', 'like', `%${searchValue}%`);
    }
    
    const total = await knex('produk').count('id as total').first();
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
    return await knex('produk').where('id', id).first();
  }

  static async create(data) {
    const [id] = await knex('produk').insert(data);
    return id;
  }

  static async update(id, data) {
    return await knex('produk').where('id', id).update(data);
  }

  static async delete(id) {
    return await knex('produk').where('id', id).del();
  }
}

module.exports = Produk;