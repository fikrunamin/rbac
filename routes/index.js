const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const todoController = require('../controllers/todoController');
const produkController = require('../controllers/produkController');
const pelangganController = require('../controllers/pelangganController');
const pesananController = require('../controllers/pesananController');
const auth = require('../middlewares/auth');

// Auth routes
router.get('/login', authController.loginForm);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Dashboard
router.get('/', auth.authenticate, (req, res) => {
  res.render('dashboard');
});

// Admin routes
router.get('/admin/users', auth.authenticate, auth.authorize('manage_users'), adminController.users);
router.get('/admin/permissions', auth.authenticate, auth.authorize('assign_permissions'), adminController.permissions);

// Todo routes
router.get('/todos', auth.authenticate, auth.authorize('view_todo'), todoController.index);
router.post('/todos', auth.authenticate, auth.authorize('create_todo'), todoController.create);
router.put('/todos/:id', auth.authenticate, auth.authorize('edit_todo'), todoController.update);
router.delete('/todos/:id', auth.authenticate, auth.authorize('delete_todo'), todoController.delete);

// Produk routes
router.get('/produk', auth.authenticate, auth.authorize('manage_products'), produkController.index);
router.get('/produk/create', auth.authenticate, auth.authorize('manage_products'), produkController.create);
router.post('/produk', auth.authenticate, auth.authorize('manage_products'), produkController.store);
router.get('/produk/edit/:id', auth.authenticate, auth.authorize('manage_products'), produkController.edit);
router.put('/produk/:id', auth.authenticate, auth.authorize('manage_products'), produkController.update);
router.delete('/produk/:id', auth.authenticate, auth.authorize('manage_products'), produkController.delete);

// Pelanggan routes
router.get('/pelanggan', auth.authenticate, auth.authorize('manage_customers'), pelangganController.index);
router.get('/pelanggan/create', auth.authenticate, auth.authorize('manage_customers'), pelangganController.create);
router.post('/pelanggan', auth.authenticate, auth.authorize('manage_customers'), pelangganController.store);
router.get('/pelanggan/edit/:id', auth.authenticate, auth.authorize('manage_customers'), pelangganController.edit);
router.put('/pelanggan/:id', auth.authenticate, auth.authorize('manage_customers'), pelangganController.update);
router.delete('/pelanggan/:id', auth.authenticate, auth.authorize('manage_customers'), pelangganController.delete);
router.get('/pelanggan/:id/pesanan', auth.authenticate, auth.authorize('manage_orders'), pelangganController.pesanan);

// Pesanan routes
router.get('/pesanan', auth.authenticate, auth.authorize('manage_orders'), pesananController.index);
router.get('/pesanan/create', auth.authenticate, auth.authorize('manage_orders'), pesananController.create);
router.post('/pesanan', auth.authenticate, auth.authorize('manage_orders'), pesananController.store);
router.get('/pesanan/:id', auth.authenticate, auth.authorize('manage_orders'), pesananController.detail);

// Pembayaran routes
router.get('/pembayaran/:pesanan_id', auth.authenticate, auth.authorize('manage_orders'), pesananController.pembayaran);
router.post('/pembayaran', auth.authenticate, auth.authorize('manage_orders'), pesananController.prosesPembayaran);

// Pengiriman routes
router.get('/pengiriman/:pesanan_id', auth.authenticate, auth.authorize('manage_orders'), pesananController.pengiriman);
router.post('/pengiriman', auth.authenticate, auth.authorize('manage_orders'), pesananController.prosesPengiriman);
router.put('/pengiriman/status', auth.authenticate, auth.authorize('manage_orders'), pesananController.updateStatusPengiriman);

module.exports = router;