module.exports = (asyncRoute) => {
  return (req, res, next) => {
    Promise.resolve(asyncRoute(req, res, next)).catch((e) => {
      console.error(e);
      next(e);
    });
  };
};
