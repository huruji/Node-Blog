'use strict';

const setting = require('./../setting');
const mongoClient = require('mongodb').MongoClient;
const Db = require('mongodb').Db;
const Server = require('mongodb').Server;

/*const url = 'mongodb://' + setting.host + '/' + setting.db;

mongoClient.connect(url, (err, db) => {

})*/

module.exports = new Db(setting.db, new Server(setting.host,setting.port));
