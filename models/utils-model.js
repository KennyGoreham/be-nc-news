exports.handlePagination = (data, limit, page) => {

  if(data.length === 0 || data.length < limit) return [...data];

  const firstIndex = (page - 1) * limit;
  const lastIndex = page * limit;

  const paginatedData = data.slice(firstIndex, lastIndex);

  return paginatedData;
};
