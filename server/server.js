const AuthAccess = require("./modules/AuthAccess");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const next = require("next");
const path = require("path");

const PORT = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const dir = path.resolve("./client/");

const nextClient = next({ dev, dir });

nextClient.prepare().then(() => {
  const server = express();
  server.use(bodyParser.json({ extended: true }));
  server.use(cookieParser());
  server.expose = server.use; // Just for fun

  const r = express.Router();
  const authAccess = new AuthAccess();
  server.expose("/api", require("./api/get.self")(r, authAccess));
  server.expose("/api", require("./api/post.signin")(r, authAccess));

  server.get("*", ...requireAuth(authAccess), nextClient.getRequestHandler());

  server.listen(PORT, err => {
    if (err) throw err;
    console.log(`> Celebrating Us API listening on port ${PORT}!`);
  });
});

const WHITELISTED_ROUTES = [
  /\/signin/,
  /\/_next/,
];
const COOKIE = "user_token";
function requireAuth(authAccess) {
  return [
    cookieParser(),
    (req, res, next) => {
      console.log(req.path, WHITELISTED_ROUTES.indexOf(req.path));
      for (const route of WHITELISTED_ROUTES) {
        if (req.path.match()) {
          return next();
        }
      }

      if (authAccess.loggedInUser(req.cookies[COOKIE] || req.query[COOKIE])) {
        return next();
      }

      res.redirect("/signin");
    }
  ];
}
