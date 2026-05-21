const ok = (res, message, data = null, status = 200, pagination = null) => {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  if (pagination) body.pagination = pagination;
  res.status(status).json(body);
};

const fail = (res, message, status = 500, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  res.status(status).json(body);
};

export { ok, fail };
