// test bootstrap

var Promise = require('bluebird'),
  path = require('path');

Promise.longStackTraces();

global.expect = require('expect.js'),
  global.should = require('should');


global.TEST_SERVER_CONFIG = require('./test-server.json');
global.TEST_DB_CONFIG = require('./test-db.json');

global.LIB_ROOT = path.resolve(__dirname, '..', 'lib');

global.LIB = require(LIB_ROOT);


global.TEST_SERVER = new LIB.Server({
  host: TEST_SERVER_CONFIG.host,
  port: TEST_SERVER_CONFIG.port,
  username: TEST_SERVER_CONFIG.username,
  password: TEST_SERVER_CONFIG.password,
  transport: 'binary',
});

global.POOL_TEST_SERVER = new LIB.Server({
  host: TEST_SERVER_CONFIG.host,
  port: TEST_SERVER_CONFIG.port,
  username: TEST_SERVER_CONFIG.username,
  password: TEST_SERVER_CONFIG.password,
  transport: 'binary',
  pool: {
    "max": 2
  }
});

global.BINARY_TEST_SERVER = new LIB.Server({
  host: TEST_SERVER_CONFIG.host,
  port: TEST_SERVER_CONFIG.port,
  username: TEST_SERVER_CONFIG.username,
  password: TEST_SERVER_CONFIG.password,
  transport: 'binary',
});
global.DISTRIBUTED_TEST_SERVER = new LIB.Server({
  host: TEST_SERVER_CONFIG.host,
  port: TEST_SERVER_CONFIG.port,
  username: TEST_SERVER_CONFIG.username,
  password: TEST_SERVER_CONFIG.password,
  transport: 'binary',
  servers: [{host: TEST_SERVER_CONFIG.host, port: TEST_SERVER_CONFIG.port - 1}, {
    host: TEST_SERVER_CONFIG.host,
    port: TEST_SERVER_CONFIG.port + 1
  }]
});

global.REST_SERVER = new LIB.Server({
  host: TEST_SERVER_CONFIG.host,
  port: TEST_SERVER_CONFIG.httpPort,
  username: TEST_SERVER_CONFIG.username,
  password: TEST_SERVER_CONFIG.password,
  transport: 'rest'
});

// Uncomment the following lines to enable debug logging
// global.TEST_SERVER.logger.debug = console.log.bind(console, '[ORIENTDB]');
// global.REST_SERVER.logger.debug = console.log.bind(console, '[ORIENTDB]');

global.USE_DISTRIBUTED_TEST_DB = useTestDb.bind(null, DISTRIBUTED_TEST_SERVER);
global.CREATE_DISTRIBUTED_TEST_DB = createTestDb.bind(null, DISTRIBUTED_TEST_SERVER);
global.DELETE_DISTRIBUTED_TEST_DB = deleteTestDb.bind(null, DISTRIBUTED_TEST_SERVER);

global.CREATE_TEST_DB = createTestDb.bind(null, TEST_SERVER);
global.DELETE_TEST_DB = deleteTestDb.bind(null, TEST_SERVER);
global.CREATE_POOL = createPool.bind(null, TEST_SERVER);
global.USE_ODB = useOdb.bind(null, TEST_SERVER);


global.CREATE_REST_DB = createTestDb.bind(null, REST_SERVER);
global.DELETE_REST_DB = deleteTestDb.bind(null, REST_SERVER);

function useTestDb(server, context, name) {
  return server.use(name).open().then(function (db) {
    context.db = db;
  })
}

function useOdb(server, name) {

  return new global.LIB.ODatabase({
    host: TEST_DB_CONFIG.host,
    port: TEST_DB_CONFIG.port,
    username: TEST_DB_CONFIG.username,
    password: TEST_DB_CONFIG.password,
    name: name
  })

  //context.pool.config.server.logger.debug = console.log.bind(console, '[ORIENTDB]');
}
function createPool(server, context, name) {
  context.pool = new global.LIB.Pool({
    host: TEST_DB_CONFIG.host,
    port: TEST_DB_CONFIG.port,
    username: TEST_DB_CONFIG.username,
    password: TEST_DB_CONFIG.password,
    name: name
  })

  //context.pool.config.server.logger.debug = console.log.bind(console, '[ORIENTDB]');
}
function createTestDb(server, context, name, type) {
  type = type || 'memory';
  return server.exists(name, type)
    .then(function (exists) {
      if (exists) {
        return server.drop({
          name: name,
          storage: type
        });
      }
      else {
        return false;
      }
    })
    .then(function () {
      return server.create({
        name: name,
        type: 'graph',
        storage: type
      });
    })
    .then(function (db) {
      context.db = db;
      return undefined;
    });
}

function deleteTestDb(server, name, type) {
  type = type || 'memory';
  return server.exists(name, type)
    .then(function (exists) {
      if (exists) {
        return server.drop({
          name: name,
          storage: type
        });
      }
      else {
        return undefined;
      }
    })
    .then(function () {
      return undefined;
    });
}
