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
router.get('/login', (req, res) => {
    res.render('auth/login', { layout: 'auth/layout' });
});
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Dashboard
router.get('/', auth.authMiddleware, (req, res) => {
    res.render('dashboard');
});

router.get('/dashboard', auth.authMiddleware, (req, res) => {
    res.render('dashboard');
});

// Admin routes
router.get('/admin/users', auth.authMiddleware, auth.permissionMiddleware('manage_users'), adminController.userList);
router.get('/admin/permissions', auth.authMiddleware, auth.permissionMiddleware('assign_permissions'), adminController.permissionList);

// Todo routes
router.get('/todos', auth.authMiddleware, auth.permissionMiddleware('view_todo'), todoController.index);
router.post('/todos', auth.authMiddleware, auth.permissionMiddleware('create_todo'), todoController.create);
router.put('/todos/:id', auth.authMiddleware, auth.permissionMiddleware('edit_todo'), todoController.update);
router.delete('/todos/:id', auth.authMiddleware, auth.permissionMiddleware('delete_todo'), todoController.delete);

// Produk routes
router.get('/produk', auth.authMiddleware, auth.permissionMiddleware('manage_products'), produkController.index);
router.get('/produk/create', auth.authMiddleware, auth.permissionMiddleware('manage_products'), produkController.create);
router.post('/produk', auth.authMiddleware, auth.permissionMiddleware('manage_products'), produkController.store);
router.get('/produk/edit/:id', auth.authMiddleware, auth.permissionMiddleware('manage_products'), produkController.edit);
router.put('/produk/:id', auth.authMiddleware, auth.permissionMiddleware('manage_products'), produkController.update);
router.delete('/produk/:id', auth.authMiddleware, auth.permissionMiddleware('manage_products'), produkController.delete);

// Pelanggan routes
router.get('/pelanggan', auth.authMiddleware, auth.permissionMiddleware('manage_customers'), pelangganController.index);
router.get('/pelanggan/create', auth.authMiddleware, auth.permissionMiddleware('manage_customers'), pelangganController.create);
router.post('/pelanggan', auth.authMiddleware, auth.permissionMiddleware('manage_customers'), pelangganController.store);
router.get('/pelanggan/edit/:id', auth.authMiddleware, auth.permissionMiddleware('manage_customers'), pelangganController.edit);
router.put('/pelanggan/:id', auth.authMiddleware, auth.permissionMiddleware('manage_customers'), pelangganController.update);
router.delete('/pelanggan/:id', auth.authMiddleware, auth.permissionMiddleware('manage_customers'), pelangganController.delete);
router.get('/pelanggan/:id/pesanan', auth.authMiddleware, auth.permissionMiddleware('manage_orders'), pelangganController.pesanan);

// Pesanan routes
router.get('/pesanan', auth.authMiddleware, auth.permissionMiddleware('manage_orders'), pesananController.index);
router.get('/pesanan/create', auth.authMiddleware, auth.permissionMiddleware('manage_orders'), pesananController.create);
router.post('/pesanan', auth.authMiddleware, auth.permissionMiddleware('manage_orders'), pesananController.store);
router.get('/pesanan/:id', auth.authMiddleware, auth.permissionMiddleware('manage_orders'), pesananController.detail);

// Pembayaran routes
router.get('/pembayaran/:pesanan_id', auth.authMiddleware, auth.permissionMiddleware('manage_orders'), pesananController.pembayaran);
router.post('/pembayaran', auth.authMiddleware, auth.permissionMiddleware('manage_orders'), pesananController.prosesPembayaran);

// Pengiriman routes
router.get('/pengiriman/:pesanan_id', auth.authMiddleware, auth.permissionMiddleware('manage_orders'), pesananController.pengiriman);
router.post('/pengiriman', auth.authMiddleware, auth.permissionMiddleware('manage_orders'), pesananController.prosesPengiriman);
router.put('/pengiriman/status', auth.authMiddleware, auth.permissionMiddleware('manage_orders'), pesananController.updateStatusPengiriman);

module.exports = router;