var DB = require('./supports/DB');
var User = require('./User');
var Model = require('./Model');

//Configure database
Model.config({
    database: 'test',
})


User.get(1).then(info=>{
    console.log(User.__connections);
    User.close(); //Close connection
})