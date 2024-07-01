module.exports = (req, res, next) => {
  if (req.method === "GET") {
    const _page = parseInt(req.query._page) || 1;
    const _limit = parseInt(req.query._limit) || 10;
    const start = (_page - 1) * _limit;
    const end = _page * _limit;
    const totalItems = res.locals.data.length;
    const totalPages = Math.ceil(totalItems / _limit);

    const paginatedData = res.locals.data.slice(start, end);

    res.json({
      data: paginatedData,
      meta: {
        _page,
        _limit,
        totalItems,
        totalPages,
      },
    });
  } else {
    next();
  }
};
