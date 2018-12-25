const katch = require("../modules/katch");

module.exports = (Router, AuthAccess) => {
  Router.get("/self", ...AuthAccess.withLoggedInUser(), katch(async (req, res) => {
    const {loggedInUser} = req;
    if (loggedInUser)
      return res.status(200).send({user: loggedInUser});
    else {
      return res.status(200).send({});
    }
  }));

  return Router;
}
