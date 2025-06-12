exports.up = function(knex) {
  return knex.schema
    .createTable('produk', function(table) {
      table.increments('id');
      table.string('nama').notNullable();
      table.decimal('harga', 10, 2).notNullable();
      table.integer('stok').notNullable();
      table.text('deskripsi');
      table.timestamps(true, true);
    })
    .createTable('pelanggan', function(table) {
      table.increments('id');
      table.string('nama').notNullable();
      table.string('email').notNullable();
      table.text('alamat');
      table.string('telepon');
      table.timestamps(true, true);
    })
    .createTable('pesanan', function(table) {
      table.increments('id');
      table.integer('pelanggan_id').unsigned().notNullable();
      table.foreign('pelanggan_id').references('pelanggan.id');
      table.date('tanggal_pesanan').notNullable();
      table.string('status').notNullable();
      table.timestamps(true, true);
    })
    .createTable('pembayaran', function(table) {
      table.increments('id');
      table.integer('pesanan_id').unsigned().notNullable();
      table.foreign('pesanan_id').references('pesanan.id');
      table.string('metode').notNullable();
      table.decimal('jumlah', 10, 2).notNullable();
      table.datetime('tanggal_pembayaran').notNullable();
      table.string('status').notNullable();
      table.timestamps(true, true);
    })
    .createTable('pengiriman', function(table) {
      table.increments('id');
      table.integer('pesanan_id').unsigned().notNullable();
      table.foreign('pesanan_id').references('pesanan.id');
      table.text('alamat_tujuan').notNullable();
      table.string('kurir').notNullable();
      table.string('no_resi');
      table.datetime('tanggal_kirim');
      table.string('status').notNullable();
      table.timestamps(true, true);
    })
    .createTable('pesanan_has_produk', function(table) {
      table.increments('id');
      table.integer('pesanan_id').unsigned().notNullable();
      table.foreign('pesanan_id').references('pesanan.id');
      table.integer('produk_id').unsigned().notNullable();
      table.foreign('produk_id').references('produk.id');
      table.integer('jumlah').notNullable();
      table.decimal('harga_satuan', 10, 2).notNullable();
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('pesanan_has_produk')
    .dropTable('pengiriman')
    .dropTable('pembayaran')
    .dropTable('pesanan')
    .dropTable('pelanggan')
    .dropTable('produk');
};