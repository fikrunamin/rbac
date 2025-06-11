const User = require('../models/User');

const authMiddleware = (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error', 'Silakan login terlebih dahulu');
    return res.redirect('/login');
  }
  next();
};

const roleMiddleware = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const userRole = await User.getRole(req.session.userId);
      if (!userRole || userRole !== requiredRole) {
        if (userRole === 'super_admin') {
          return next(); // super_admin memiliki akses ke semua role
        }
        req.flash('error', 'Anda tidak memiliki akses ke halaman ini');
        return res.redirect('/dashboard');
      }
      next();
    } catch (error) {
      req.flash('error', 'Terjadi kesalahan saat memeriksa role');
      res.redirect('/dashboard');
    }
  };
};

const permissionMiddleware = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const hasPermission = await User.hasPermission(req.session.userId, requiredPermission);
      if (!hasPermission) {
        req.flash('error', 'Anda tidak memiliki izin untuk melakukan aksi ini');
        return res.redirect('/dashboard');
      }
      next();
    } catch (error) {
      req.flash('error', 'Terjadi kesalahan saat memeriksa permission');
      res.redirect('/dashboard');
    }
  };
};

module.exports = {
  authMiddleware,
  roleMiddleware,
  permissionMiddleware
};