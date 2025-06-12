exports.seed = async function(knex) {
  // Tambah permissions baru untuk pesanan
  const orderPermissions = [
    { name: 'view_orders' },
    { name: 'create_orders' },
    { name: 'edit_orders' },
    { name: 'delete_orders' },
    { name: 'manage_payments' },
    { name: 'manage_shipments' },
    { name: 'view_order_reports' }
  ];

  // Insert permissions baru
  for (const permission of orderPermissions) {
    await knex('permissions').insert(permission).onConflict('name').ignore();
  }

  // Ambil semua permission
  const allPermissions = await knex('permissions').select('id', 'name');
  
  // Ambil role super_admin
  const superAdminRole = await knex('roles').where('name', 'super_admin').first();
  
  if (!superAdminRole) {
    console.log('Super admin role not found');
    return;
  }

  // Assign semua permission ke super_admin
  const rolePermissions = allPermissions.map(perm => ({
    role_id: superAdminRole.id,
    permission_id: perm.id
  }));

  // Insert role_permissions untuk super_admin
  for (const rp of rolePermissions) {
    await knex('role_permissions')
      .insert(rp)
      .onConflict(['role_id', 'permission_id'])
      .ignore();
  }

  // Ambil role admin dan staff
  const adminRole = await knex('roles').where('name', 'admin').first();
  const staffRole = await knex('roles').where('name', 'staff').first();

  if (adminRole) {
    // Assign permission pesanan ke admin
    for (const perm of orderPermissions) {
      const permission = allPermissions.find(p => p.name === perm.name);
      if (permission) {
        await knex('role_permissions')
          .insert({
            role_id: adminRole.id,
            permission_id: permission.id
          })
          .onConflict(['role_id', 'permission_id'])
          .ignore();
      }
    }
  }

  if (staffRole) {
    // Assign permission terbatas untuk staff
    const staffPermissions = ['view_orders', 'create_orders', 'manage_shipments'];
    for (const permName of staffPermissions) {
      const permission = allPermissions.find(p => p.name === permName);
      if (permission) {
        await knex('role_permissions')
          .insert({
            role_id: staffRole.id,
            permission_id: permission.id
          })
          .onConflict(['role_id', 'permission_id'])
          .ignore();
      }
    }
  }

  console.log('Order permissions seeded successfully');
};