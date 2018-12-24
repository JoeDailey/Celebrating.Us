const path = require("path");
const fs = require("fs");
const DB_DEST = path.resolve("../data.sqlite");
const ACCOUNTS_SRC = path.resolve("./accounts.json");

const hash = require("../modules/hash.js");

if (fs.existsSync(DB_DEST)) {
  throw Error(`DB already exists at ${DB_DEST}`);
}

let initialAccounts = [];
if (fs.existsSync(ACCOUNTS_SRC)) {
  initialAccounts = JSON.parse(fs.readFileSync(ACCOUNTS_SRC));
  console.log(`Loading accounts from ${ACCOUNTS_SRC}`);
} else {
  console.log(`Create ${ACCOUNTS_SRC} to create initial accounts.`);
}

const db = require("better-sqlite3")(DB_DEST);

try {
  db.exec(`
    CREATE TABLE users (
      email text UNIQUE PRIMARY KEY NOT NULL,
      display_name text,
      password_hash blob NOT NULL
    );
  `);

  const addUser = db.prepare(`
    INSERT INTO users (email, display_name, password_hash) VALUES (
      @email, @display_name, @password_hash
    );
  `);

  const runAll = db.transaction(initialAccounts => {
    initialAccounts.map(({ email, display_name, password }) =>
      addUser.run({ email, display_name, password_hash: hash(password) })
    );
  });
  runAll(initialAccounts);

  db.exec(`
    CREATE TABLE sessions (
      token blob NOT NULL primary key,
      email text NOT NULL,
      exp_date INTEGER NOT NULL
    );
  `);

  db.close();
} catch (e) {
  fs.unlinkSync(DB_DEST);
  throw e;
}
