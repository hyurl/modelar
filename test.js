var DB = require('./supports/DB');
var User = require('./User');
var Model = require('./Model');

//Configure database
DB.config({
    database: 'test',
})

User.getMany({
    keywords: 'Ayon%Lee'
}).then(info=>{
    console.log(info);
    User.close();
}).catch(err=>{
    console.log(err);
})

// User.get(1).then(info=>{
//     for(var [k, v] of info)
//         console.log(k, v)
//     User.close(); //Close connection
// })