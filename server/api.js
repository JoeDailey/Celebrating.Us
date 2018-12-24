const express = require("express");
const cookieParser = require("cookie-parser");
const api = express();
api.use(cookieParser());

const PORT = 3001;

const path = require("path");
const DB_DEST = path.join(__dirname, "/data.sqlite");

const fs = require("fs");
if (fs.existsSync(DB_DEST) === false) {
  throw Error(`DB does not yet exist at ${DB_DEST}`);
}

const db = require("better-sqlite3")(DB_DEST);
const AuthAccess = require("./modules/AuthAccess");


api.get("/self", (req, res) => {
  try {
    const {JSONCookie} = res;
    if (JSONCookie == null) {
      const user = db.prepare(`
        SELECT
          display_name,
          email
        FROM users
        WHERE email = @email
      `).get({email: 'test@example.com'});
      res.status(200).send(user);
      return;
    }
    const user = (new AuthAccess(db)).loggedInUser(JSONCookie)
    return res.status(200).send({user});
  } catch (e) {
    console.error('Server Error', e);
    res.status(500).send(e);
  }
});

api.listen(
  PORT,
  () => console.log(`Celebrating Us API listening on port ${PORT}!`),
);
