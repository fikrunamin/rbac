const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

// User data middleware
app.use(async (req, res, next) => {
  // Pastikan title selalu tersedia dengan nilai default
  res.locals.title = res.locals.title || 'RBAC System';
  
  // Pastikan flash messages selalu tersedia
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  
  if (req.session.userId) {
    try {
      const User = require('./models/User');
      const userData = await User.getUserData(req.session.userId);
      
      if (userData) {
        res.locals.user = userData;
        res.locals.userHasPermission = (permission) => {
          return userData.role === 'super_admin' || userData.permissions.includes(permission);
        };
      } else {
        // Jika user tidak ditemukan di database
        res.locals.user = null;
        res.locals.userHasPermission = () => false;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.locals.user = null;
      res.locals.userHasPermission = () => false;
    }
  } else {
    res.locals.user = null;
    res.locals.userHasPermission = () => false;
  }
  next();
});

// View engine setup
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');

// Routes
app.use('/', require('./routes'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  req.flash('error', 'Terjadi kesalahan internal');
  res.redirect('/dashboard');
});

// 404 handler
app.use((req, res) => {
  req.flash('error', 'Halaman tidak ditemukan');
  res.redirect('/dashboard');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});