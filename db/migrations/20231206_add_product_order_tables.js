exports.up = function(knex) {
  return knex.schema
    .createTable('produk', function(table) {
      table.increments('id').primary();
      table.string('nama').notNullable();
      table.decimal('harga', 10, 2).notNullable();
      table.integer('stok').notNullable().defaultTo(0);
      table.text('deskripsi');
      table.timestamps(true, true);
    })
    .createTable('pelanggan', function(table) {
      table.increments('id').primary();
      table.string('nama').notNullable();
      table.string('email').notNullable().unique();
      table.text('alamat');
      table.string('telepon');
      table.timestamps(true, true);
    })
    .createTable('pesanan', function(table) {
      table.increments('id').primary();
      table.integer('pelanggan_id').unsigned().references('id').inTable('pelanggan').onDelete('CASCADE');
      table.dateTime('tanggal_pesanan').notNullable().defaultTo(knex.fn.now());
      table.enum('status', ['pending', 'dibayar', 'dikirim', 'selesai']).defaultTo('pending');
      table.timestamps(true, true);
    })
    .createTable('pembayaran', function(table) {
      table.increments('id').primary();
      table.integer('pesanan_id').unsigned().references('id').inTable('pesanan').onDelete('CASCADE');
      table.string('metode').notNullable();
      table.decimal('jumlah', 10, 2).notNullable();
      table.dateTime('tanggal_pembayaran');
      table.enum('status', ['belum', 'berhasil', 'gagal']).defaultTo('belum');
      table.timestamps(true, true);
    })
    .createTable('pengiriman', function(table) {
      table.increments('id').primary();
      table.integer('pesanan_id').unsigned().references('id').inTable('pesanan').onDelete('CASCADE');
      table.text('alamat_tujuan').notNullable();
      table.string('kurir');
      table.string('no_resi');
      table.dateTime('tanggal_kirim');
      table.enum('status', ['diproses', 'dikirim', 'diterima']).defaultTo('diproses');
      table.timestamps(true, true);
    })
    .createTable('pesanan_has_produk', function(table) {
      table.increments('id').primary();
      table.integer('pesanan_id').unsigned().references('id').inTable('pesanan').onDelete('CASCADE');
      table.integer('produk_id').unsigned().references('id').inTable('produk').onDelete('CASCADE');
      table.integer('jumlah').notNullable();
      table.decimal('harga_satuan', 10, 2).notNullable();
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('pesanan_has_produk')
    .dropTableIfExists('pengiriman')
    .dropTableIfExists('pembayaran')
    .dropTableIfExists('pesanan')
    .dropTableIfExists('pelanggan')
    .dropTableIfExists('produk');
};