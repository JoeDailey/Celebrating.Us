class AuthAccess {
  constructor(db) {
    this.db = db;
  }

  loggedInUser(cookie) {
    const { email, token } = cookie;
    const session = Q.SESSION.get({ email, token, timenow: new Data().time() });
    return session && Q.USER.get({email});
  }
}

const Q = db => ({
  SESSION: db.prepare(`
    SELECT * FROM sessions
    WHERE
      email=@email AND
      token=@token AND
      exp_date>@timenow;
  `),
  USER: db.prepare(`
    SELECT
      display_name,
      email
    FROM users
    WHERE email=@email
  `)
});

module.exports = AuthAccess;
