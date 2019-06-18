const Pool = require('pg/lib').Pool;

let {host, port, user, password, database} = {};
let pool;

const connect = (request, response) => {
  if (!request.body) {
    return response.sendStatus(400);
  }
  host = request.body['host'];
  port = request.body['port'];
  user = request.body['user'];
  password = request.body['password'];
  database = 'postgres';
  updatePoolConnection();
  testConnection(response);
};

const useDatabase = (request, response) => {
  const requestDb = request.params["dbName"];
  if (!requestDb) {
    return response.status(500).json({
      success: false,
      data: {message: 'Empty database name!'}
    });
  }
  database = requestDb;
  updatePoolConnection();
  testConnection(response);
};

const getDbNames = (request, response) => {
  const sqlAllDb = 'SELECT datname FROM pg_database WHERE datistemplate = false;';
  selectByField(sqlAllDb, 'datname').then(
    res => response.status(200).json(res),
    e => response.status(500).json({success: false, data: e.message})
  );
};

const getTableNames = (request, response) => {
  const sqlTables =
    'SELECT table_name\n' +
    'FROM information_schema.tables\n' +
    'WHERE table_schema=\'public\'\n' +
    'AND table_type=\'BASE TABLE\';';

  selectByField(sqlTables, 'table_name').then(
    res => response.status(200).json(res),
    e => response.status(500).json({success: false, data: e.message})
  );

};

const getColumns = (request, response) => {
  const requestTable = request.params["tableName"];
  if (!requestTable) {
    return response.status(500).json({
      success: false,
      data: {message: 'Empty table name!'}
    });
  }
  const sqlColumns =
    'SELECT column_name\n' +
    'FROM information_schema.columns\n' +
    'WHERE table_schema = \'public\' \n' +
    'AND table_name = \'' + requestTable + '\'';

  selectByField(sqlColumns, 'column_name').then(
    res => response.status(200).json(res),
    e => response.status(500).json({success: false, data: e.message})
  );
};

const getPrimaryKeyName = (request, response) => {
  const requestTable = request.params["tableName"];
  if (!requestTable) {
    return response.status(500).json({
      success: false,
      data: {message: 'Empty table name!'}
    });
  }
  const sqlPrimaryKey =
    "SELECT a.attname\n" +
    "FROM pg_index i\n" +
    "JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)\n" +
    "WHERE i.indrelid = '" + requestTable + "'::regclass AND i.indisprimary";

  selectByField(sqlPrimaryKey, 'attname').then(
    res => response.status(200).json(res),
    e => response.status(500).json({success: false, data: e.message})
  );
};


const getTableData = (request, response) => {
  const requestTable = request.params["tableName"];
  if (!requestTable) {
    return response.status(500).json({
      success: false,
      data: {message: 'Empty table name!'}
    });
  }
  let full = request.query.full == null || request.query.full === 'true';
  let columns = request.query.column;
  if (typeof (columns) === 'string' || columns instanceof String) {
    columns = [columns];
  }
  let sqlColumns = '*';
  if (!full && columns) {
    sqlColumns = columns.join(', ');
  }
  let sqlQuery = 'SELECT ' + sqlColumns + ' FROM ' + requestTable;
  if (columns && columns.length > 0) {
    const conditions = columns.join(' IS NOT NULL AND ') + ' IS NOT NULL';
    sqlQuery += ' WHERE ' + conditions;
  }
  select(sqlQuery).then(
    res => response.status(200).json(res),
    e => response.status(500).json({success: false, data: e.message})
  );
};

const performRowsUnion = (request, response) => {
  const requestTable = request.params["tableName"];
  if (!requestTable) {
    return response.status(500).json({
      success: false,
      data: {message: 'Empty table name!'}
    });
  }
  if (!request.body) {
    return response.sendStatus(400);
  }
  const groupedRows = request.body['groupedRows'];
  if (!groupedRows || groupedRows.length === 0) {
    return response.status(500).json({
      success: false,
      data: {message: 'Combined rows not found!'}
    });
  }

  (async () => {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // получение первичных ключей таблицы requestTable
      const sqlPrimaryKey =
        "SELECT a.attname\n" +
        "FROM pg_index i\n" +
        "JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)\n" +
        "WHERE i.indrelid = '" + requestTable + "'::regclass AND i.indisprimary";

      const pKeys = await selectByField(sqlPrimaryKey, 'attname');
      if (!pKeys || pKeys.length === 0) {
        return;
      }

      // получение внешних ключей и таблиц, которые ссылаются на первичный ключ таблицы requestTable
      const sqlForeignKey =
        "SELECT DISTINCT tc.table_name, kcu.column_name\n" +
        "FROM information_schema.table_constraints AS tc\n" +
        "JOIN information_schema.key_column_usage AS kcu\n" +
        "ON tc.constraint_name = kcu.constraint_name\n" +
        "AND tc.table_schema = kcu.table_schema\n" +
        "JOIN information_schema.constraint_column_usage AS ccu\n" +
        "ON ccu.constraint_name = tc.constraint_name\n" +
        "AND ccu.table_schema = tc.table_schema\n" +
        "WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = '" + requestTable + "' " +
        "AND ccu.column_name IN (" + pKeys.map(key => "'" + key + "'").join(", ") + ")";

      const fKeys = await select(sqlForeignKey);
      if (!fKeys || fKeys.length === 0) {
        return;
      }
      const tableFKeys = new Map();
      fKeys.forEach(fKey => {
        const key = fKey['table_name'];
        const value = fKey['column_name'];
        if (!tableFKeys.has(key)) {
          tableFKeys.set(key, [value]);
        } else {
          tableFKeys.get(key).push(value);
        }
      });

      // обновление ссылок по всем группам
      async function updateGroupLinks(groupedRows, requestTable) {
        for (const groupedRow of groupedRows) {
          const primary = groupedRow['primary'];
          const combined = groupedRow['combined'];
          if (!primary || !combined || combined.length === 0) {
            return;
          }

          // обновление ссылок внутри одной группы
          async function updateLinks(tableFKeys) {
            for (const [foreignTable, fKeys] of tableFKeys) {
              const setValue = fKeys.map((fKey, i) => `"${fKey}"=${primary[pKeys[i]]}`);
              const whereCond = fKeys.map((fKey, i) => {
                const changedValues = combined.map(v => v[pKeys[i]]).join(', ');
                return `"${fKey}" IN (${changedValues})`;
              });
              const updateSql =
                "UPDATE " + foreignTable + "\n" +
                "SET " + setValue.join(', ') + "\n" +
                "WHERE " + whereCond.join(" AND");
              await client.query(updateSql);
            }
          }

          await updateLinks(tableFKeys);

          // удаление объединяемых строк внутри одной группы
          async function deleteLinks(requestTable, combined) {
            for (const row in combined) {
              const whereCond = pKeys.map(pKey => `"${pKey}"=${combined[row][pKey]}`);
              const deleteSql =
                "DELETE FROM " + requestTable + "\n" +
                "WHERE " + whereCond.join(' AND');
              await client.query(deleteSql);
            }
          }

          await deleteLinks(requestTable, combined);
        }
      }

      await updateGroupLinks(groupedRows, requestTable);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e
    } finally {
      client.release()
    }
  })().then(_ => {
    return response.status(200).json({success: true});
  }).catch(e => {
    return response.status(500).json({success: false, data: e.message});
  });

};

function select(sqlString) {
  return new Promise(function (resolve, reject) {
    if (!pool) {
      reject(new Error('Connection not created'));
    }
    pool.query(sqlString, (error, results) => {
      if (error) {
        throw error;
      }
      resolve(results.rows);
    });
  });
}

function selectByField(sqlString, dataField) {
  return new Promise(function (resolve, reject) {
    if (!pool) {
      reject(new Error('Connection not created'));
    }
    pool.query(sqlString, (error, results) => {
      if (error) {
        throw error;
      }
      let res = [];
      if (results.rows && results.rows.length > 0) {
        results.rows.forEach(row => {
          res.push(row[dataField]);
        })
      }
      resolve(res);
    });
  });
}

function updatePoolConnection() {
  pool = new Pool({
    user: user,
    host: host,
    password: password,
    port: port,
    database: database
  });
}

function testConnection(response) {
  pool.query('SELECT NOW()', (error, results) => {
    if (error) {
      return response.status(500).json({success: false, data: {message: 'Could not connect to postgres'}});
    }
    return response.status(200).json({success: true});
  });
}

module.exports = {
  connect,
  useDatabase,
  getDbNames,
  getTableNames,
  getColumns,
  getPrimaryKeyName,
  getTableData,
  performRowsUnion
};
