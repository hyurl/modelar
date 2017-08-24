var DB = require('./supports/DB');
var User = require('./User');
var Model = require('./Model');

//Configure database
DB.config({
    database: 'test',
})

class Role extends User{

}

Model.on('insert', ()=>{})
Role.on('login',()=>{})

console.log(Role.__events);

// User.get(1).then(info=>{
//     for(var [k, v] of info)
//         console.log(k, v)
//     User.close(); //Close connection
// })