const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const TodoController = require('../controllers/todoController');
const AdminController = require('../controllers/adminController');
const { authMiddleware, roleMiddleware, permissionMiddleware } = require('../middlewares/auth');
const PelangganController = require('../controllers/pelangganController');

// Auth routes
router.get('/login', AuthController.showLogin);
router.post('/login', AuthController.login);
router.get('/logout', AuthController.logout);

// Dashboard
router.get('/dashboard', authMiddleware, (req, res) => {
  res.render('dashboard', {
    username: req.session.username,
    error: req.flash('error'),
    success: req.flash('success')
  });
});

// Todo routes
router.get('/todos', 
  authMiddleware,
  permissionMiddleware('view_todo'),
  TodoController.index
);

router.post('/todos',
  authMiddleware,
  permissionMiddleware('create_todo'),
  TodoController.create
);

router.post('/todos/:id/update',
  authMiddleware,
  permissionMiddleware('edit_todo'),
  TodoController.update
);

router.post('/todos/:id/delete',
  authMiddleware,
  permissionMiddleware('delete_todo'),
  TodoController.delete
);

router.get('/pesanan', authMiddleware, permissionMiddleware('manage_pesanan'), PelangganController.index);
router.post('/pesanan/datatable', authMiddleware, permissionMiddleware('manage_pesanan'), PelangganController.datatable);

// Admin routes
router.get('/admin/users',
  authMiddleware,
  roleMiddleware('admin'),
  AdminController.userList
);

router.get('/admin/permissions',
  authMiddleware,
  roleMiddleware('super_admin'),
  AdminController.permissionList
);

router.post('/admin/permissions',
  authMiddleware,
  roleMiddleware('super_admin'),
  AdminController.updateRolePermissions
);

// Root redirect
router.get('/', (req, res) => {
  res.redirect('/dashboard');
});

module.exports = router;