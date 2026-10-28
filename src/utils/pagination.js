/**
 * Calculate pagination limit and offset from page & size query params
 */
const getPagination = (page = 1, size = 10) => {
  const limit = Math.max(1, Math.min(parseInt(size, 10) || 10, 100));
  const offset = (Math.max(1, parseInt(page, 10) || 1) - 1) * limit;
  return { limit, offset };
};

/**
 * Format paginated data for response
 */
const getPagingData = (data, page = 1, limit = 10) => {
  const { count: totalItems, rows: items } = data;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const totalPages = Math.ceil(totalItems / limit);
  return {
    items,
    pagination: {
      totalItems,
      totalPages,
      currentPage,
      itemsPerPage: limit,
    },
  };
};

module.exports = { getPagination, getPagingData };
