const katch = require("../modules/katch");

const COOKIE = "user_token";

module.exports = (Router, AuthAccess) => {
  Router.post(
    "/signout",
    katch(async (req, res) => {
      AuthAccess.destroySession(req.cookies[COOKIE] || req.query[COOKIE]);
      return res.status(200).send({ success: true });
    })
  );

  return Router;
};
