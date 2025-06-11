# RBAC (Role-Based Access Control) Application

Aplikasi web sederhana yang mengimplementasikan sistem Role-Based Access Control (RBAC) menggunakan Express.js dan MySQL.

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
- MySQL (dengan Knex.js)
- EJS Template Engine
- Express Session
- Bootstrap 5

## Struktur Database

### Tabel

1. `roles`
   - `id` (primary key)
   - `name` (unique) - nama role

2. `permissions`
   - `id` (primary key)
   - `name` (unique) - nama permission

3. `role_permissions`
   - `id` (primary key)
   - `role_id` (foreign key ke roles)
   - `permission_id` (foreign key ke permissions)

4. `users`
   - `id` (primary key)
   - `username` (unique)
   - `password_hash` (hash dari password)
   - `role_id` (foreign key ke roles)

5. `todos`
   - `id` (primary key)
   - `title` (judul todo)
   - `user_id` (foreign key ke users)
   - `timestamps` (created_at dan updated_at)

### Data Awal

1. Roles:
   - super_admin
   - admin
   - user

2. Permissions:
   - manage_users
   - assign_permissions
   - create_todo
   - edit_todo
   - delete_todo
   - view_todo

3. Users default:
   - superadmin (role: super_admin)
   - admin (role: admin)
   - user (role: user)

### Hak Akses Role

- super_admin: semua permission
- admin: semua kecuali assign_permissions
- user: hanya permission terkait todo

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

3. Setup database:
   ```bash
   # Buat database MySQL
   mysql -u root -e "CREATE DATABASE rbac_db"

   # Jalankan migrasi untuk membuat tabel
   npx knex migrate:latest

   # Jalankan seeder untuk mengisi data awal
   npx knex seed:run
   ```

4. Jalankan aplikasi:
   ```bash
   node index.js
   ```

5. Buka browser dan akses `http://localhost:3000`

## Akun Default

1. Super Admin
   - Username: superadmin
   - Password: super123

2. Admin
   - Username: admin
   - Password: admin123

3. User
   - Username: user
   - Password: user123