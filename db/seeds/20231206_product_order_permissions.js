exports.seed = async function(knex) {
  // Get existing roles
  const roles = await knex('roles').select('*');

  // Insert new permissions if they don't exist
  const newPermissions = [
    { name: 'manage_products' },
    { name: 'manage_customers' },
    { name: 'manage_orders' }
  ];

  for (const permission of newPermissions) {
    const exists = await knex('permissions')
      .where('name', permission.name)
      .first();
    
    if (!exists) {
      await knex('permissions').insert(permission);
    }
  }

  // Get all permissions including new ones
  const permissions = await knex('permissions').select('*');

  // Update role-permission mappings
  const rolePermissionMappings = {
    super_admin: ['manage_products', 'manage_customers', 'manage_orders'],
    admin: ['manage_products', 'manage_customers', 'manage_orders'],
    user: []
  };

  // Insert new role permissions
  for (const [roleName, permissionNames] of Object.entries(rolePermissionMappings)) {
    const role = roles.find(r => r.name === roleName);
    
    for (const permName of permissionNames) {
      const permission = permissions.find(p => p.name === permName);
      
      // Check if role-permission mapping already exists
      const exists = await knex('role_permissions')
        .where({
          role_id: role.id,
          permission_id: permission.id
        })
        .first();
      
      if (!exists) {
        await knex('role_permissions').insert({
          role_id: role.id,
          permission_id: permission.id
        });
      }
    }
  }

  // Delete existing sample data
  await knex('pesanan_has_produk').del();
  await knex('pengiriman').del();
  await knex('pembayaran').del();
  await knex('pesanan').del();
  await knex('pelanggan').del();
  await knex('produk').del();

  // Insert sample products
  await knex('produk').insert([
    {
      nama: 'Laptop Gaming',
      harga: 15000000,
      stok: 10,
      deskripsi: 'Laptop gaming performa tinggi'
    },
    {
      nama: 'Smartphone Android',
      harga: 5000000,
      stok: 20,
      deskripsi: 'Smartphone dengan spesifikasi menengah'
    },
    {
      nama: 'Headphone Bluetooth',
      harga: 1000000,
      stok: 30,
      deskripsi: 'Headphone wireless dengan noise cancelling'
    }
  ]);

  // Insert sample customers
  await knex('pelanggan').insert([
    {
      nama: 'John Doe',
      email: 'john@example.com',
      alamat: 'Jl. Contoh No. 123',
      telepon: '08123456789'
    },
    {
      nama: 'Jane Smith',
      email: 'jane@example.com',
      alamat: 'Jl. Sample No. 456',
      telepon: '08234567890'
    }
  ]);
};