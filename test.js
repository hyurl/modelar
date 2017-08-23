const DB = require("./supports/DB");
const Query = require("./supports/Query");
const Model = require("./Model");
var User = require('./User');

DB.config({
    type: 'sqlite',
    database: 'D:/ModPHP/modphp.db',
});

console.log(User.constructor("return global")())


// User.get().then(info=>{
//     console.log(info);
// })
// var user = new User({
//     id: 1,
//     name: 'hyurl',
//     email: 'i@hyurl.com',
//     password: '12345',
// });
// console.log(user.valueOf());

/*********** 计时器实现同步转异步 *******************/

// var s = 0;
// setTimeout(()=>{
//     for(var i=0; i<100; i++){
//         s = i;
//     }
// }, 1);

// var i = setInterval(()=>{
//     if(s == 99)
//         clearInterval(i);
//         console.log(s);
// }, 1);

// console.log("sasa");