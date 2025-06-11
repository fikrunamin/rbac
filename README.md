# RBAC (Role-Based Access Control) Application

Aplikasi web sederhana yang mengimplementasikan sistem Role-Based Access Control (RBAC) menggunakan Express.js dan SQLite.

## Fitur

- Autentikasi (Login/Logout)
- Manajemen Todo (CRUD)
- Manajemen User (Admin)
- Manajemen Permission (Super Admin)
- Role-Based Access Control dengan 3 level:
  - Super Admin: Akses penuh ke semua fitur
  - Admin: Manajemen user dan todo
  - User: Manajemen todo pribadi

## Teknologi

- Express.js
- SQLite (dengan Knex.js)
- EJS Template Engine
- Express Session
- Bootstrap 5

## Cara Menjalankan Proyek

1. Clone repositori:
   ```bash
   git clone <repository-url>
   cd rbac
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Jalankan migrasi database:
   ```bash
   npx knex migrate:latest
   ```

4. Jalankan seeder untuk data awal:
   ```bash
   npx knex seed:run
   ```

5. Jalankan aplikasi:
   ```bash
   node index.js
   ```

6. Buka browser dan akses `http://localhost:3000`

## Akun Default

1. Super Admin
   - Username: super_admin
   - Password: password123

2. Admin
   - Username: admin
   - Password: password123

3. User
   - Username: user
   - Password: password123