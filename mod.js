"use strict";

const DB = require('./supports/DB'); //引入数据库管理类
//配置数据库信息
DB.config({
    type: 'sqlite',
    database: 'D:/ModPHP/modphp.db',
});

//设置允许外部程序(如浏览器客户端)直接访问的类和方法
//其中，routes 的键名为类名，值为方法列表
//类必须继承自 Model，方法必须时静态方法
const routes = {
    User: ['insert', 'update', 'delete', 'get', 'getMany', 'login', 'logout'],
};

//模拟请求的类、方法和参数
var Model = 'User';
var method = 'get';
var args = {
    id: 2,
}

//使用 Promise 进行流程控制：
//当类方法执行成功时，then() 中的代码会被执行；
//如果遇到错误，catch() 中的代码会被执行；
new Promise((resolve, reject) => {
    resolve();
}).then(_ => {
    if (routes[Model] === undefined)
        throw new Error('The model ' + Model + ' was not found or can not be routesed.');
    else if (routes[Model].includes(method) === false)
        throw new Error('The method ' + Model + '.' + method + '() was not found or can not be routesed.');

    Model = require('./' + Model); //载入类
    return Model[method](args); //调用静态方法
}).then(model => {
    if (model instanceof Model) {
        //判断 insert/update/delete 操作
        var sql = model.sql,
            isInsert = sql.indexOf('insert') !== -1,
            isUpdate = sql.indexOf('update') !== -1 || sql.indexOf('delete') !== -1;
        if ((isInsert && !model.insertId) || (isUpdate && !model.affectedRows))
            throw new Error('No ' + model.constructor.name + ' was affected by the given arguments.');
    }
    return JSON.stringify({
        success: true,
        data: model.valueOf(),
    });
}).then(json => {
    console.log(json);
}).catch(err => {
    console.log(JSON.stringify({ success: false, msg: err.message }));
});