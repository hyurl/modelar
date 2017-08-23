/**
 * 数据库连接管理对象，使用连接缓存，因而不会重复连接到相同的数据库
 */
class DB{
	/**
	 * 创建一个新的数据库实例
	 * @param  {Object} config 数据库配置，也可以设置为一个字符串，它将被当作数据库
	 *                         名称。
	 */
	constructor(config = {}){
		if(typeof config == 'string')
			config = {database: config};
		
		this.sql = ''; //最后一次运行的 SQL 语句
		this.bindings = []; //最后一次绑定的数据
		this.status = 0; //数据库连接状态，0 未连接, 1 正在连接, 2 已连接, 3 已断开
		this.queries = 0; //总共运行 SQL 语句的次数
		this.insertId = 0; //inert 语句插入后返回的 ID
		this.affectedRows = 0; //insert/update/delete 等语句影响的行数
		this.__data = []; // select 语句查询到的数据
		this.__config = Object.assign({}, this.constructor.__config, config); //配置信息
		this.__spec = this.constructor.__getSpec(this.__config); //连接描述符
		this.__connection = null; //数据库连接

		if(this.__config.autoConnect)
			this.connect(); //连接数据库
	}

	/**
	 * 配置数据库的基本信息
	 * @param  {Object} config 配置信息
	 * @return {DB}            DB 类自身
	 */
	static config(config = {}){
		this.__config = Object.assign({
			type: 'mysql', //数据库类型
			host: 'localhost', //数据库主机
			port: 3306, //数据库主机
			user: 'root', //数据库用户名
			password: '', //数据库密码
			database: '', //数据库名称
			charset: 'utf8', //字符集编码
			timeout: 5000, //超时毫秒数
			autoConnect: false, //实例化后自动连接数据库
		}, this.__config || {}, config);
		this.UNOPEN = 0; //未连接
		this.OPENING = 1; //连接中
		this.OPEN = 2; //已连接
		this.CLOSED = 3; //已断开
		this.queries = 0; //总查询语句运行次数
		this.__connections = {}; //已建立的连接
		return this;
	}

	/**
	 * 使用一个现有的数据库连接
	 * @param  {Object} connection 一个数据库连接实例
	 * @return {DB}                当前 DB 实例
	 */
	static use(connection){
		var spec = this.__getSpec(this.__config);
		this.__connections[spec] = connection;
		return this;
	}

	/** 获取连接描述符 */
	static __getSpec(config){
		if(config.type == 'sqlite'){
			return config.type+':'+config.database;
		}else if(config.type == 'mysql'){
			return config.type+':'+config.user+':'+config.password+'@'
							  +config.host+':'+config.port
							  +(config.database ? '/'+config.database : '');
		}
	}

	/**
	 * 连接数据库
	 * @return {DB} 当前 DB 实例
	 */
	connect(){
		var config = this.__config;
		var connections = this.constructor.__connections; //引用静态连接
		if(connections[this.__spec]){
			//如果连接已存在，则使用已有连接
			this.__connection = connections[this.__spec];
		}else{
			this.status = 1;
			var callback = (err)=>{
				this.status = err ? 0 : 2;
				if(!err) //将连接存入静态对象
					connections[this.__spec] = this.__connection;
			};
			if(config.type == 'sqlite'){
				var driver = require('sqlite3'); //sqlite
				this.__connection = new driver.Database(config.database, callback);
			}else if(config.type == 'mysql'){
				var driver = require('mysql'); //mysql
				this.__connection = driver.createConnection({
					host: config.host,
					port: config.port,
					user: config.user,
					password: config.password,
					database: config.database,
					charset: config.charset,
					connectTimeout: config.timeout,
				});
				this.__connection.connect(callback);
			}
		}
		return this;
	}

	/**
	 * 执行 SQL 语句
	 * @param  {String}  sql      SQL 语句
	 * @param  {Array}   bindings 绑定的参数
	 * @return {Promise}          返回 Promise，回调函数的参数是当前 DB 实例。
	 */
	query(sql, bindings = []){
		this.sql = sql.toLowerCase().trim();
		this.bindings = Object.assign([], bindings);
		//记录查询次数
		this.queries += 1;
		this.constructor.queries += 1;
		DB.queries += 1;
		//返回最内层 Promise
		return new Promise((resolve, reject)=>{
			if(this.__connection === null)
				this.connect(); //如果数据库连接没有建立，则自动建立连接

			if(this.__config.type == 'sqlite'){
				var _this = this,
					begin = this.sql.substring(0, this.sql.indexOf(" ")),
					gets = ['select', 'pragma'];
				if(gets.includes(begin)){
					//处理 select 语句
					this.__connection.all(sql, bindings, function(err, rows){
						if(err){
							reject(err);
						}else{
							_this.__data = rows;
							resolve(_this);
						}
					});
				}else{
					this.__connection.run(sql, bindings, function(err){
						if(err){
							reject(err);
						}else{
							_this.insertId = this.lastID;
							_this.affectedRows = this.changes;
							resolve(_this);
						}
					});
				}
			}else if(this.__config.type == 'mysql'){
				this.__connection.query({
					sql: sql,
					timeout: this.__config.timeout,
					values: bindings,
				}, (err, res)=>{
					if(err){
						reject(err);
					}else{
						if(res instanceof Array){
							//select 返回数组
							for(var i in res){
								res[i] = Object.assign({}, res[i]);
							}
							this.__data = res;
						}else{
							this.insertId = res.insertId;
							this.affectedRows = res.affectedRows;
						}
						resolve(this);
					}
				});
			}
		});
	}

	/** query 方法的别名 */
	run(sql, bindings){
		return this.query(sql, bindings);
	}

	/**
	 * 开始事务处理
	 * @param  {Function} callback 如果设置回调函数，则自动对在函数中运行的 SQL 进行
	 *                             事务处理，如果未发生错误，则自动提交，如果函数中
	 *                             抛出了异常，则自动回滚；回调函数支持一个，如果未
	 *                             设置回调函数，则仅开启事务，需要手动提交和回滚；
	 * @return {Promise}           返回 Promise，回调函数的参数是当前 DB 实例。
	 */
	transaction(callback){
		if(typeof callback == 'function'){
			return this.query('begin').then(()=>{
				callback.call(this, this);
			}).then(()=>{
				this.commit();
			}).catch(err=>{
				this.rollback();
				throw err;
			});
		}else{
			return this.query('begin');
		}
	}

	/**
	 * 提交事务
	 * @return {Promise} 返回 Promise，回调函数的参数是当前 DB 实例。
	 */
	commit(){
		return this.query('commit');
	}

	/**
	 * 回滚事务
	 * @return {Promise} 返回 Promise，回调函数的参数是当前 DB 实例。
	 */
	rollback(){
		return this.query('rollback');
	}

	/**
	 * 关闭当前数据库连接
	 * @return {DB} 返回当前实例
	 */
	close(){
		this.status = 3;
		if(this.__config.type == 'sqlite')
			this.__connection.close();
		else if(this.__config.type == 'mysql')
			this.__connection.destroy();
		//移除连接引用
		this.__connection = null;
		delete this.constructor.__connections[this.__spec];
		return this;
	}

	/**
	 * 关闭所有数据库连接
	 * @return {DB} 返回 DB 类自身。
	 */
	static close(){
		var connections = this.__connections;
		for(var spec in connections){
			if(typeof connections[spec].destroy == 'function') //mysql
				connections[spec].destroy();
			else if(typeof connections[spec].close == 'function') //sqlite
				connections[spec].close();
			delete connections[spec]; //移除连接引用
		}
		return this;
	}
}

DB.config(); //初始化配置

module.exports = DB; //导出 Nodejs 模块
