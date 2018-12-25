const katch = require("../modules/katch");

module.exports = (Router, AuthAccess) => {
  Router.post("/signin", katch(async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    const {email, password} = req.body;
    try {
      const cookie = AuthAccess.createSession(email, password, res);
      return res.status(200).send({success: true, cookie});
    } catch (e) {
      res.status(200).send({success: false, e});
      throw e;
    }
  }));

  return Router;
}
