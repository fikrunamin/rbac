exports.seed = async function(knex) {
  // Tambah permissions baru
  const permissions = [
    { name: 'manage_products', description: 'Akses produk' },
    { name: 'manage_customers', description: 'Akses pelanggan' },
    { name: 'manage_orders', description: 'Akses pesanan, pembayaran, pengiriman' },
    { name: 'manage_users', description: 'Akses user & role' },
    { name: 'assign_permissions', description: 'Super admin-only' }
  ];

  for (const permission of permissions) {
    await knex('permissions').insert(permission).onConflict('name').ignore();
  }

  // Ambil semua permission
  const allPermissions = await knex('permissions').select('id', 'name');
  const permissionMap = allPermissions.reduce((map, perm) => {
    map[perm.name] = perm.id;
    return map;
  }, {});

  // Tambah roles baru
  const roles = [
    { name: 'super_admin', description: 'Super Administrator' },
    { name: 'admin', description: 'Administrator' },
    { name: 'staff', description: 'Staff' },
    { name: 'customer', description: 'Customer' }
  ];

  for (const role of roles) {
    await knex('roles').insert(role).onConflict('name').ignore();
  }

  // Ambil semua role
  const allRoles = await knex('roles').select('id', 'name');
  const roleMap = allRoles.reduce((map, role) => {
    map[role.name] = role.id;
    return map;
  }, {});

  // Assign permissions ke roles
  const rolePermissions = [
    // Super Admin mendapat semua permission
    ...allPermissions.map(perm => ({
      role_id: roleMap.super_admin,
      permission_id: perm.id
    })),
    // Admin
    {
      role_id: roleMap.admin,
      permission_id: permissionMap.manage_products
    },
    {
      role_id: roleMap.admin,
      permission_id: permissionMap.manage_customers
    },
    {
      role_id: roleMap.admin,
      permission_id: permissionMap.manage_orders
    },
    {
      role_id: roleMap.admin,
      permission_id: permissionMap.manage_users
    },
    // Staff
    {
      role_id: roleMap.staff,
      permission_id: permissionMap.manage_orders
    },
    {
      role_id: roleMap.staff,
      permission_id: permissionMap.manage_customers
    }
    // Customer tidak memiliki permission backend
  ];

  // Insert role_permissions
  for (const rp of rolePermissions) {
    await knex('role_permissions')
      .insert(rp)
      .onConflict(['role_id', 'permission_id'])
      .ignore();
  }
};