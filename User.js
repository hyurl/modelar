const Model = require('./Model');

/**
 * 用户管理模型，除了继承自 Model 类的方法，还包括 `login()` 和 `logout()` 方法。
 */
class User extends Model{
	constructor(data = {}, config = {}){
		super(data, Object.assign({
			table: 'users',
			primary: 'id',
			fields: [ //允许批量赋值的字段
				'id',
				'name',
				'email',
				'password',
			],
			searchable: [ //允许搜索的字段
				'name',
				'email',
			]
		}, config));

		this.__loginable = [ //允许用作登录的字段
			'name',
			'email',
		];
	}

	set password(v){
		var bcrypt = require('bcrypt-nodejs'); //载入 bcrypt
		this.__data.password = bcrypt.hashSync(v); //加密密码
	}

	get password(){
		return null;//密码不能直接获取
	}

	/**
	 * 用户登录，如果登录成功，则将登录用户添加到全局的 Model.auth 静态属性中，如果
	 * 登录失败，则抛出错误信息。该方法不会将登录信息保存到 session 或者其他的存储环
	 * 境，这需要使用者自己去实现；在恢复登录信息时，只需要将获取到的用户模型保存到 
	 * Model.auth 属性中即可。
	 * 
	 * @param  {Object}  args 登录参数，包含任何可用于登录的字段，和一个 `password`
	 *                        字段，如果不提供任何登录字段，那么应该提供一个 `user`
	 *                        字段用于泛字段登录，它将尝试所有登录字段的可能性。
	 * @return (Promise}      返回 Promise，回调函数的参数是获取的用户模型实例。
	 */
	static login(args){
		if(args.password === undefined){
			return new Promise(()=>{
				throw new Error('Login requires a `password`, but none given.');
			});
		}
		var _args = {};
		var user = new this();
		if(args.user === undefined){ //使用明确字段登录
			for(var k in args){
				if(user.__loginable.includes(k)){
					_args[k] = args[k];
				}
			}
			if(Object.keys(_args).length === 0){
				return new Promise(()=>{
					throw new Error('Login requires at least one loginable key, but none given.');
				});
			}
			user.where(_args); //使用 where 查询
		}else{ //使用泛字段登录
			for(var field of user.__loginable){
				user.orWhere(field, args.user); //使用 or where 查询
			}
		}

		return user.all().then(users=>{ //获取所有匹配的用户
			if(users.length === 0)
				throw new Error(this.name+' was not found by searching the given data.');

			var bcrypt = require('bcrypt-nodejs'); //载入 bcrypt
			for(var _user of users){ //逐一校验每个用户的密码
				if(bcrypt.compareSync(args.password, _user.__data.password)){
					user.__data = _user.__data
					Model.auth = user; //将登录用户的实例保存到 Model 全局中
					_user.trigger('login', user); //触发 login 事件
					return user; //返回密码匹配的用户
				}
			}
			throw new Error("The password you provided didn't match any "+this.name+".");
		});
	}

	/**
	 * 登出用户，该方法将 Model.auth 设置为 null 来清空登录信息，如果需要清除 
	 * session 等，则需要使用者自己去实现。
	 * 
	 * @return {Promise} 返回 Promise，回调函数的参数是登录用户的模型实例。
	 */
	static logout(){
		return new Promise((resolve, reject)=>{
			if(!Model.auth)
				throw new Error('No '+this.name+' is logged in.');
			this.trigger('logout', Model.auth);
			resolve(Model.auth);
			reject();
			Model.auth = null;
		});
	}
}

module.exports = User;