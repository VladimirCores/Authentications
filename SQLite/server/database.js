const sqlite3 = require('sqlite3').verbose()
const md5 = require('md5')

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    // Cannot open database
    console.error(err.message)
    throw err
  }else{
    console.log('Connected to the SQLite database.')
    db.run(`CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text, 
            surname text, 
            email text UNIQUE, 
            password text, 
            )`,
      (err) => {
        if (err) {
          // Table already created
        } else {
          // Table just created, creating some rows
          const insert = 'INSERT INTO user (name, email, password) VALUES (?,?,?)'
          db.run(insert, ["admin","admin@example.com",md5("admin123")])
          db.run(insert, ["user","user@example.com",md5("user123")])
        }
      });
  }
});


module.exports = db