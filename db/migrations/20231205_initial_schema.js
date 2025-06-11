exports.up = function(knex) {
  return knex.schema
    .createTable('roles', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable().unique();
    })
    .createTable('permissions', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable().unique();
    })
    .createTable('role_permissions', function(table) {
      table.increments('id').primary();
      table.integer('role_id').unsigned().references('id').inTable('roles').onDelete('CASCADE');
      table.integer('permission_id').unsigned().references('id').inTable('permissions').onDelete('CASCADE');
      table.unique(['role_id', 'permission_id']);
    })
    .createTable('users', function(table) {
      table.increments('id').primary();
      table.string('username').notNullable().unique();
      table.string('password_hash').notNullable();
      table.integer('role_id').unsigned().references('id').inTable('roles').onDelete('SET NULL');
    })
    .createTable('todos', function(table) {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('todos')
    .dropTableIfExists('users')
    .dropTableIfExists('role_permissions')
    .dropTableIfExists('permissions')
    .dropTableIfExists('roles');
};