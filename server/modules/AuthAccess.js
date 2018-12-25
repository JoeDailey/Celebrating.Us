const cookieParser = require("cookie-parser");
const fs = require("fs");
const hash = require("../modules/hash.js");
const path = require("path");
const sqlite = require("better-sqlite3");

const SESSION_LENGTH = 60 * 60 * 3; // seconds (3 hours)
const COOKIE = "user_token";
const WHITELISTED_ROUTES = [/\/signin/, /\/_next/];

class AuthAccess {
  loggedInUser(cookie) {
    if (!cookie) {
      return null;
    }

    const { email, token } = JSON.parse(cookie);
    const timenow = Date.now();
    const session = Q.SESSION.get({ email, token, timenow });
    return session && Q.USER.get({ email });
  }

  createSession(email, password, res) {
    const password_hash = hash(password);
    const validatedUser = Q.ATTEMPT.get({ email, password_hash });
    if (!validatedUser) {
      throw Error("Login Mismatch");
    }

    const expiration = Date.now() + SESSION_LENGTH;
    const token = hash(email + expiration + Math.random());
    Q.LOGIN.run({ token, expiration, email });
    res.cookie(COOKIE, JSON.stringify({ email, token }), { expiration });
    return JSON.stringify({ email, token });
  }

  withLoggedInUser() {
    return [
      cookieParser(),
      (req, res, next) => {
        req["loggedInUser"] = this.loggedInUser(
          req.cookies[COOKIE] || req.query[COOKIE]
        );
        next();
      }
    ];
  }

  gate() {
    return [
      cookieParser(),
      (req, res, next) => {
        for (const route of WHITELISTED_ROUTES) {
          if (req.path.match(route)) {
            return next();
          }
        }

        if (this.loggedInUser(req.cookies[COOKIE] || req.query[COOKIE])) {
          return next();
        }

        res.redirect("/signin");
      }
    ];
  }

  destroySession(cookie) {
    if (!cookie) {
      throw new Error('Cannot log out. No authentication cookie.')
    }

    const { email, token } = JSON.parse(cookie);
    const timenow = Date.now();
    const session = Q.LOGOUT.run({ email, token, timenow });
  }
}

const DB_DEST = path.join(__dirname, "../data.sqlite");
if (fs.existsSync(DB_DEST) === false) {
  throw Error(`DB does not yet exist at ${DB_DEST}`);
}

const DB = sqlite(DB_DEST);
const Q = {
  SESSION: DB.prepare(`
    SELECT * FROM sessions
    WHERE
      email=@email AND
      token=@token AND
      exp_date>@timenow;
  `),
  USER: DB.prepare(`
    SELECT
      display_name,
      email
    FROM users
    WHERE email=@email;
  `),
  ATTEMPT: DB.prepare(`
    SELECT
      display_name,
      email
    FROM users
    WHERE
      email=@email AND
      password_hash=@password_hash;
  `),
  LOGIN: DB.prepare(`
    INSERT INTO sessions (token, email, exp_date) VALUES (
      @token, @email, @expiration
    );
  `),
  LOGOUT: DB.prepare(`
    UPDATE sessions
    SET exp_date=@timenow
    WHERE token=@token AND email=@email;
  `)
};

module.exports = AuthAccess;
