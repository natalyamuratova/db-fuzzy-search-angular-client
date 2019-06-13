const Pool = require('pg').Pool;

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
  selectByField(response, sqlAllDb, 'datname');
};

const getTableNames = (request, response) => {
  const sqlTables =
    'SELECT table_name\n' +
    'FROM information_schema.tables\n' +
    'WHERE table_schema=\'public\'\n' +
    'AND table_type=\'BASE TABLE\';';
  selectByField(response, sqlTables, 'table_name');
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
  selectByField(response, sqlColumns, 'column_name');
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

  selectByField(response, sqlPrimaryKey, 'attname');
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
  if (typeof(columns) === 'string' || columns instanceof String) {
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
  select(response, sqlQuery);
};

function select(response, sqlString) {
  if (!pool) {
    return response.status(500).json({success: false, data: {message: 'Connection not created'}});
  }
  pool.query(sqlString, (error, results) => {
    if (error) {
      return response.status(500).json({
        success: false,
        data: {message: 'Error while trying to execute request'}
      });
    }
    response.status(200).json(results.rows)
  })
}

function selectByField(response, sqlString, dataField) {
  if (!pool) {
    return response.status(500).json({success: false, data: {message: 'Connection not created'}});
  }
  pool.query(sqlString, (error, results) => {
    if (error) {
      return response.status(500).json({
        success: false,
        data: {message: 'Error while trying to execute request'}
      });
    }
    let res = [];
    if (results.rows && results.rows.length > 0) {
      results.rows.forEach(row => {
        res.push(row[dataField]);
      })
    }
    response.status(200).json(res)
  })
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
  getTableData
};
