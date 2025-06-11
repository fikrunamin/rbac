const User = require('../models/User');

class AuthController {
  static async showLogin(req, res) {
    res.render('auth/login', {
      error: req.flash('error'),
      success: req.flash('success')
    });
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // Validasi input
      if (!username || !password) {
        req.flash('error', 'Username dan password harus diisi');
        return res.redirect('/login');
      }

      // Cari user
      const user = await User.findByUsername(username);
      if (!user) {
        req.flash('error', 'Username atau password salah');
        return res.redirect('/login');
      }

      // Verifikasi password
      const isValid = await User.verifyPassword(user, password);
      if (!isValid) {
        req.flash('error', 'Username atau password salah');
        return res.redirect('/login');
      }

      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;
      
      req.flash('success', 'Login berhasil');
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      req.flash('error', 'Terjadi kesalahan saat login');
      res.redirect('/login');
    }
  }

  static async logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.redirect('/login');
    });
  }
}

module.exports = AuthController;