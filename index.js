const DB = require("./DB");
const Table = require("./Table");
const Query = require("./Query");
const Model = require("./Model");
const User = require("./User");
const Adapter = require("./Adapter");

Model.DB = DB;
Model.Table = Table;
Model.Query = Query;
Model.Model = Model;
Model.User = User;
Model.Adapter = Adapter;

module.exports = Model;