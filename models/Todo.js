const knex = require('knex')(require('../knexfile').development);

class Todo {
  static async create(title, userId) {
    return await knex('todos').insert({
      title,
      user_id: userId
    });
  }

  static async getAllByUser(userId) {
    return await knex('todos')
      .where('user_id', userId)
      .select('*');
  }

  static async update(id, title, userId) {
    return await knex('todos')
      .where({ id, user_id: userId })
      .update({ title });
  }

  static async delete(id, userId) {
    return await knex('todos')
      .where({ id, user_id: userId })
      .del();
  }

  static async findById(id) {
    return await knex('todos')
      .where({ id })
      .first();
  }
}

module.exports = Todo;