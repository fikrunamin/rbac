const knex = require('knex')(require('../knexfile').development);

const permissionMiddleware = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // Pastikan user sudah login
      if (!req.session.userId) {
        req.flash('error', 'Silakan login terlebih dahulu');
        return res.redirect('/login');
      }

      // Ambil data user dan role
      const user = await knex('users')
        .select('users.*', 'roles.name as role_name')
        .leftJoin('roles', 'users.role_id', 'roles.id')
        .where('users.id', req.session.userId)
        .first();

      if (!user) {
        req.flash('error', 'User tidak ditemukan');
        return res.redirect('/login');
      }

      // Ambil permissions untuk role user
      const permissions = await knex('role_has_permissions')
        .join('permissions', 'role_has_permissions.permission_id', 'permissions.id')
        .where('role_has_permissions.role_id', user.role_id)
        .pluck('permissions.name');

      // Tambahkan data user dan permissions ke res.locals
      res.locals.user = user;
      res.locals.userPermissions = permissions;

      // Helper function untuk mengecek permission
      res.locals.userHasPermission = (permission) => {
        return permissions.includes(permission);
      };

      // Jika user adalah super_admin, berikan akses penuh
      if (user.role_name === 'super_admin') {
        return next();
      }

      // Cek apakah user memiliki permission yang diperlukan
      if (!permissions.includes(requiredPermission)) {
        req.flash('error', 'Anda tidak memiliki akses ke halaman ini');
        return res.redirect('/dashboard');
      }

      next();
    } catch (error) {
      console.error('Error in permission middleware:', error);
      req.flash('error', 'Terjadi kesalahan saat memverifikasi akses');
      res.redirect('/login');
    }
  };
};

module.exports = permissionMiddleware;