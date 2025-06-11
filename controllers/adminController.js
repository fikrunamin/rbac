const knex = require('knex')(require('../knexfile').development);
const User = require('../models/User');

class AdminController {
  static async userList(req, res) {
    try {
      const users = await User.getAllUsers();
      res.render('admin/users', {
        users,
        error: req.flash('error'),
        success: req.flash('success')
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      req.flash('error', 'Gagal mengambil daftar pengguna');
      res.redirect('/dashboard');
    }
  }

  static async permissionList(req, res) {
    try {
      const roles = await knex('roles').select('*');
      const permissions = await knex('permissions').select('*');
      const rolePermissions = await knex('role_permissions')
        .join('permissions', 'role_permissions.permission_id', 'permissions.id')
        .select('role_permissions.role_id', 'permissions.name as permission_name');

      // Format role permissions untuk tampilan
      const formattedRoles = roles.map(role => ({
        ...role,
        permissions: rolePermissions
          .filter(rp => rp.role_id === role.id)
          .map(rp => rp.permission_name)
      }));

      res.render('admin/permissions', {
        roles: formattedRoles,
        permissions,
        error: req.flash('error'),
        success: req.flash('success')
      });
    } catch (error) {
      console.error('Error fetching permissions:', error);
      req.flash('error', 'Gagal mengambil daftar permission');
      res.redirect('/dashboard');
    }
  }

  static async updateRolePermissions(req, res) {
    try {
      const { roleId, permissions } = req.body;

      // Validasi input
      if (!roleId || !Array.isArray(permissions)) {
        req.flash('error', 'Data tidak valid');
        return res.redirect('/admin/permissions');
      }

      // Hapus permission yang ada
      await knex('role_permissions')
        .where('role_id', roleId)
        .del();

      // Tambah permission baru
      if (permissions.length > 0) {
        const permissionRecords = await knex('permissions')
          .whereIn('name', permissions)
          .select('id');

        const rolePermissions = permissionRecords.map(p => ({
          role_id: roleId,
          permission_id: p.id
        }));

        await knex('role_permissions').insert(rolePermissions);
      }

      req.flash('success', 'Permission berhasil diupdate');
      res.redirect('/admin/permissions');
    } catch (error) {
      console.error('Error updating permissions:', error);
      req.flash('error', 'Gagal mengupdate permission');
      res.redirect('/admin/permissions');
    }
  }
}

module.exports = AdminController;