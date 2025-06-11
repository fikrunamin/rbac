const knex = require('knex')(require('../knexfile').development);
const bcrypt = require('bcrypt');

class User {
  static async findByUsername(username) {
    return await knex('users')
      .where({ username })
      .first();
  }

  static async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password_hash);
  }

  static async getRole(userId) {
    const user = await knex('users')
      .join('roles', 'users.role_id', 'roles.id')
      .where('users.id', userId)
      .select('roles.name as role')
      .first();
    return user ? user.role : null;
  }

  static async hasPermission(userId, permissionName) {
    const result = await knex('users')
      .join('roles', 'users.role_id', 'roles.id')
      .join('role_permissions', 'roles.id', 'role_permissions.role_id')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('users.id', userId)
      .where('permissions.name', permissionName)
      .first();
    return !!result;
  }

  static async getAllUsers() {
    return await knex('users')
      .join('roles', 'users.role_id', 'roles.id')
      .select('users.id', 'users.username', 'roles.name as role');
  }
}

module.exports = User;