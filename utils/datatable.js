async function datatableHelper({ req, knexQuery, columns }) {
    const draw = parseInt(req.query.draw) || 1;
    const start = parseInt(req.query.start) || 0;
    const length = parseInt(req.query.length) || 10;
    const searchValue = req.query.search?.value || '';
    const order = req.query.order?.[0] || {};
    const orderColumnIndex = parseInt(order.column || 0);
    const orderDir = order.dir === 'desc' ? 'desc' : 'asc';
  
    const totalQuery = knexQuery.clone().clearSelect().count({ count: '*' }).first();
    const recordsTotal = parseInt((await totalQuery).count || 0);
  
    if (searchValue && columns.length > 0) {
      knexQuery.where((builder) => {
        columns.forEach((col) => {
          builder.orWhere(col, 'like', `%${searchValue}%`);
        });
      });
    }
  
    const orderColumn = columns[orderColumnIndex] || columns[0];
    knexQuery.orderBy(orderColumn, orderDir);
  
    knexQuery.offset(start).limit(length);
  
    const data = await knexQuery;
  
    const filteredQuery = knexQuery.clone().clearSelect().clearOrder().count({ count: '*' }).first();
    const recordsFiltered = parseInt((await filteredQuery).count || 0);
  
    return {
      draw,
      recordsTotal,
      recordsFiltered,
      data
    };
  }
  
  module.exports = datatableHelper;
  