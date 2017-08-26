var DB = require('./supports/DB');
var User = require('./User');
var Model = require('./Model');

//Configure database
DB.config({
    type: 'sqlite',
    database: "D:\\ModPHP\\modphp.db",
})
User.on('get', user=>{
    console.log(user.__data);
}).on('insert', _=>{})

// User.get(1).then(info=>{
//     // console.log(info.__data);
//     User.close();
// }).catch(err=>{
//     console.log(err);
// })

User.getMany().then(info=>{
    // console.log(info);
    User.close(); //Close connection
})