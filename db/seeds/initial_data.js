const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  // Deleting existing entries
  await knex('todos').del();
  await knex('users').del();
  await knex('role_permissions').del();
  await knex('permissions').del();
  await knex('roles').del();

  // Insert roles
  await knex('roles').insert([
    { name: 'super_admin' },
    { name: 'admin' },
    { name: 'user' }
  ]);

  // Get inserted roles
  const roles = await knex('roles').select('*');

  // Insert permissions
  await knex('permissions').insert([
    { name: 'manage_users' },
    { name: 'assign_permissions' },
    { name: 'create_todo' },
    { name: 'edit_todo' },
    { name: 'delete_todo' },
    { name: 'view_todo' },
    { name: 'manage_pesanan' }
  ]);

  // Get inserted permissions
  const permissions = await knex('permissions').select('*');

  // Create role-permission mappings
  const rolePermissionMappings = {
    super_admin: ['manage_users', 'assign_permissions', 'create_todo', 'edit_todo', 'delete_todo', 'view_todo', 'manage_pesanan'],
    admin: ['manage_users', 'create_todo', 'edit_todo', 'delete_todo', 'view_todo'],
    user: ['create_todo', 'edit_todo', 'delete_todo', 'view_todo']
  };

  // Insert role permissions
  for (const [roleName, permissionNames] of Object.entries(rolePermissionMappings)) {
    const role = roles.find(r => r.name === roleName);
    const rolePermissions = permissionNames.map(permName => {
      const permission = permissions.find(p => p.name === permName);
      return {
        role_id: role.id,
        permission_id: permission.id
      };
    });
    await knex('role_permissions').insert(rolePermissions);
  }

  // Insert users
  const users = [
    { username: 'superadmin', password: 'super123', role: 'super_admin' },
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'user', password: 'user123', role: 'user' }
  ];

  for (const user of users) {
    const role = roles.find(r => r.name === user.role);
    const passwordHash = await bcrypt.hash(user.password, 10);
    await knex('users').insert({
      username: user.username,
      password_hash: passwordHash,
      role_id: role.id
    });
  }
};