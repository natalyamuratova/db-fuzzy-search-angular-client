const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./queries');
const cluster = require('./python-cluster');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.post("/connection", db.connect);
app.post("/connection/:dbName", db.useDatabase);
app.get("/databases", db.getDbNames);
app.get("/tables", db.getTableNames);
app.get("/tables/:tableName/columns", db.getColumns);
app.get("/tables/:tableName/primaryKey", db.getPrimaryKeyName);
app.get("/tables/:tableName/data", db.getTableData);
app.post("/tables/:tableName/union", db.performRowsUnion);
app.post('/cluster', cluster.getClusters);

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
});

