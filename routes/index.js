const express = require('express');
const router = express.Router();
const {authMiddleware, permissionMiddleware} = require('../middlewares/auth');
// const permissionMiddleware = require('../middleware/permissionMiddleware');

// Controllers
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const produkController = require('../controllers/produkController');
const pelangganController = require('../controllers/pelangganController');
const pesananController = require('../controllers/pesananController');
const pembayaranController = require('../controllers/pembayaranController');
const pengirimanController = require('../controllers/pengirimanController');

// Auth Routes
router.get('/login', authController.showLogin);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Dashboard
router.get('/dashboard', authMiddleware, (req, res) => {
  res.render('dashboard', { title: 'Dashboard' });
});

// Admin Routes
router.get('/admin/users', authMiddleware, permissionMiddleware('manage_users'), adminController.userList);
router.get('/admin/roles', authMiddleware, permissionMiddleware('assign_permissions'), adminController.permissionList);

// Produk Routes
router.get('/produk', authMiddleware, permissionMiddleware('manage_products'), produkController.index);
router.get('/produk/create', authMiddleware, permissionMiddleware('manage_products'), produkController.create);
router.post('/produk', authMiddleware, permissionMiddleware('manage_products'), produkController.store);
router.get('/produk/datatable', authMiddleware, permissionMiddleware('manage_products'), produkController.datatable);
router.get('/produk/:id/edit', authMiddleware, permissionMiddleware('manage_products'), produkController.edit);
router.put('/produk/:id', authMiddleware, permissionMiddleware('manage_products'), produkController.update);
router.delete('/produk/:id', authMiddleware, permissionMiddleware('manage_products'), produkController.delete);

// Pelanggan Routes
router.get('/pelanggan', authMiddleware, permissionMiddleware('manage_customers'), pelangganController.index);
router.get('/pelanggan/create', authMiddleware, permissionMiddleware('manage_customers'), pelangganController.create);
router.post('/pelanggan', authMiddleware, permissionMiddleware('manage_customers'), pelangganController.store);
router.get('/pelanggan/datatable', authMiddleware, permissionMiddleware('manage_customers'), pelangganController.datatable);
router.get('/pelanggan/:id/edit', authMiddleware, permissionMiddleware('manage_customers'), pelangganController.edit);
router.put('/pelanggan/:id', authMiddleware, permissionMiddleware('manage_customers'), pelangganController.update);
router.delete('/pelanggan/:id', authMiddleware, permissionMiddleware('manage_customers'), pelangganController.delete);
router.get('/pelanggan/:id/pesanan', authMiddleware, permissionMiddleware('manage_customers'), pelangganController.pesanan);

// Pesanan Routes
router.get('/pesanan', authMiddleware, permissionMiddleware('manage_orders'), pesananController.index);
router.get('/pesanan/create', authMiddleware, permissionMiddleware('manage_orders'), pesananController.create);
router.post('/pesanan', authMiddleware, permissionMiddleware('manage_orders'), pesananController.store);
router.get('/pesanan/datatable', authMiddleware, permissionMiddleware('manage_orders'), pesananController.datatable);
router.get('/pesanan/:id', authMiddleware, permissionMiddleware('manage_orders'), pesananController.show);
router.delete('/pesanan/:id', authMiddleware, permissionMiddleware('manage_orders'), pesananController.delete);
router.get('/pesanan/:id/produk/datatable', authMiddleware, permissionMiddleware('manage_orders'), pesananController.produkDatatable);

// Pembayaran Routes
router.get('/pembayaran/:pesanan_id', authMiddleware, permissionMiddleware('manage_orders'), pembayaranController.index);
router.post('/pembayaran/:pesanan_id', authMiddleware, permissionMiddleware('manage_orders'), pembayaranController.store);
router.put('/pembayaran/:id/:pesanan_id', authMiddleware, permissionMiddleware('manage_orders'), pembayaranController.update);
router.get('/pembayaran/:pesanan_id/datatable', authMiddleware, permissionMiddleware('manage_orders'), pembayaranController.datatable);

// Pengiriman Routes
router.get('/pengiriman/:pesanan_id', authMiddleware, permissionMiddleware('manage_orders'), pengirimanController.index);
router.post('/pengiriman/:pesanan_id', authMiddleware, permissionMiddleware('manage_orders'), pengirimanController.store);
router.put('/pengiriman/:id/:pesanan_id', authMiddleware, permissionMiddleware('manage_orders'), pengirimanController.update);
router.get('/pengiriman/:pesanan_id/datatable', authMiddleware, permissionMiddleware('manage_orders'), pengirimanController.datatable);

// Error handling
router.use((req, res, next) => {
  res.status(404).render('error', {
    title: 'Halaman Tidak Ditemukan',
    message: 'Halaman yang Anda cari tidak ditemukan.'
  });
});

router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Terjadi Kesalahan',
    message: 'Terjadi kesalahan pada server.'
  });
});

module.exports = router;