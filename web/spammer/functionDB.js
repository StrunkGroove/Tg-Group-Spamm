username_model = 'username_model'
required_users = 'required_user_model'
spamm_users = 'spamm_users_model'

async function createDbConnection(dbpath, sqlite3) {
    const db = new sqlite3.Database(dbpath, (error) => {
      if (error) {
        return console.error(error.message);
      }
    });
    return db;
  }

async function selectStatus(number, db) {
    const selectQuery = `SELECT status FROM ${username_model} LIMIT ${number}`;
    return new Promise((resolve, reject) => {
        db.all(selectQuery, (error, rows) => {
        if (error) {
            reject(new Error(error.message));
        } else {
            const lastRow = rows[rows.length - 1];
            resolve(lastRow);
        }
        });
    });
}

async function selectInfo(number, db) {
    const selectQuery = `SELECT server, text FROM ${username_model} LIMIT ${number}`;
    return new Promise((resolve, reject) => {
        db.all(selectQuery, (error, rows) => {
        if (error) {
            reject(new Error(error.message));
        } else {
            const lastRow = rows[rows.length - 1];
            resolve(lastRow);
        }
        });
    });
}

async function selectRequiredUsers(db) {
    const selectQuery = `SELECT * FROM ${required_users}`;
    return new Promise((resolve, reject) => {
        db.all(selectQuery, (error, rows) => {
        if (error) {
            reject(new Error(error.message));
        } else {
            resolve(rows);
        }
        });
    });
}

async function selectAccount(number, db) {
    const selectQuery = `SELECT phone, password FROM ${username_model} LIMIT ${number}`;
    return new Promise((resolve, reject) => {
        db.all(selectQuery, (error, rows) => {
        if (error) {
            reject(new Error(error.message));
        } else {
            const lastRow = rows[rows.length - 1];
            resolve(lastRow);
        }
        });
    });
}

async function insertUser(username, db) {
    const insertQuery = `INSERT INTO ${spamm_users} (username) VALUES (?)`;
  
    return new Promise((resolve, reject) => {
      db.run(insertQuery, [username], function (error) {
        if (error) {
          reject(new Error(error.message));
        } else {
          resolve();
        }
      });
    });
  }

async function checkUser(username, db) {
  const selectQuery = `SELECT username FROM ${spamm_users} WHERE username = ?`;

  return new Promise((resolve, reject) => {
    db.get(selectQuery, [username], (error, row) => {
      if (error) {
        reject(new Error(`Error while checking for user: ${error.message}`));
      } else {
        resolve(row); // Возвращаем результат запроса
      }
    });
  });
}

module.exports = {
    createDbConnection,
    selectStatus,
    selectAccount,
    selectInfo,
    selectRequiredUsers,
    insertUser,
    checkUser,
};