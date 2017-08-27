var DB = require('./supports/DB');
var User = require('./User');
var Model = require('./Model');

//Configure database
DB.config({
    type: 'sqlite',
    database: "D:\\ModPHP\\modphp.db",
})
User.on('get', user=>{
    // console.log(user.__data);
}).on('insert', _=>{})

User.get(2).then(user=>{
    // console.log(user.valueOf());
    for(var [k, v] of user){
        console.log(k, v);
    }
})