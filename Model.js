const Query = require('./supports/Query');

/**
 * 模型包装器，继承于 Query 类，因此具有所有 Query 类的特性，并具备 Query 类所没有的
 * 其他特性。所有从数据库获取的记录都会被包裹在模型中，从而可以对其进行简单并高效的操作。
 */
class Model extends Query{
	/**
	 * 构造方法
	 * 
	 * @param  {Object} data   [可选] 实例化模型时填充的初始化数据
	 * @param  {Object} config [可选] 设置模型的一些初始化信息，它们可以是：
	 *                         - `table`      关联的数据表
	 *                         - `fields`     数据表的字段
	 *                         - `primary`    主键
	 *                         - `searchable` 允许用于搜索(模糊查询)的字段
	 * @return {Model}
	 */
	constructor(data = {}, config = {}){
		super(config.table); //绑定数据表
		this.__fields = config.fields || []; //可设置的数据表字段
		this.__primary = config.primary || ''; //主键
		this.__searchable = config.searchable || [], //可以用来进行模糊查询的字段

		this.__data = {}; //模型数据

		//设置动态属性，只有在模型类本身没有定义 setter 和 getter 时才定义它们，如果
		//模型类定义了 setter 和 getter 两者中的一个，那么也应该定义另一个，否则在访
		//问时可能会出现问题。
		for(var field of this.__fields){			
			var hasGetter = this.__lookupGetter__(field) instanceof Function,
				hasSetter = this.__lookupSetter__(field) instanceof Function,
				isProp = this.hasOwnProperty(field);
			if(!hasGetter && !hasSetter && !isProp){
				eval(`Object.defineProperty(this, '${field}', {
					get: ()=>{ //getter
						return this.__data['${field}'] || null
					},
					set: (v)=>{ //setter
						if('${field}' != this.__primary) //只允许设置主键以外的字段
							this.__data['${field}'] = v
					},
				})`);
			}
		}

		//分配数据
		this.assign(data, true);
		delete this.__data[this.__primary]; //过滤主键
	}

	/**
	 * 获取模型数据的字符串表示
	 * 
	 * @return {String} 一个表示模型数据的 JSON 字符串
	 */
	toString(){
		return JSON.stringify(this.__data);
	}

	/**
	 * 获取模型所代表的对象
	 * 
	 * @return {Object} 模型数据本身
	 */
	valueOf(){
		return this.__data;
	}

	/**
	 * 将数据分配到 `__data` 属性中，只有 `__fields` 配置的字段才可以被分配
	 * @param  {Object}  data      要分配的数据
	 * @param  {Boolean} useSetter [可选] 使用 setter 处理，默认 false
	 * @return {Model}   this      当前模型实例
	 */
	assign(data, useSetter = false){
		if(this.__data instanceof Array)
			this.__data = {}; //__data 继承自 DB，可能为数组，需要将其重置为对象
		for(var key in data){
			if(this.__fields.includes(key)){
				if(useSetter){
					var set = this.__lookupSetter__(key);
					if(set instanceof Function && set.name.indexOf(' ') !== -1){
						set.call(this, data[key]); //调用 setter
						continue;
					}
				}
				this.__data[key] = data[key];
			}
		}
		return this;
	}
	
	/**
	 * 保存当前模型，如果模型没有对应的数据库记录，则将其创建
	 * 
	 * @return {Promise} 返回 Promise，回调函数的参数是当前模型实例。
	 */
	save(){
		this.trigger('save', this); //触发保存事件
		var promise = this.__data[this.__primary] ? this.update() : this.insert();
		return promise.then(model=>{
			return this.trigger('saved', model);
		});
	}

	/*************** Model 继承于 Query 并重写的方法 ********************/

	/**
	 * 将模型数据插入数据库中
	 * 
	 * @param  {Object}  data [可选] 用 Object 对象表示字段和值的对应关系。
	 * @return {Promise}      返回 Promise，回调函数的参数是当前模型实例。
	 */
	insert(data = {}){
		this.assign(data, true);
		return super.insert(this.__data).then(model=>{
			model.where(model.__primary, model.insertId);
			return model.get();
		});
	}

	/**
	 * 将更改后的模型数据更新到数据库中
	 * 
	 * @param  {Object}  data [可选] 用 Object 对象表示字段和值的对应关系。
	 * @return {Promise}      返回 Promise，回调函数的参数是当前模型实例。
	 */
	update(data = {}){
		this.__where = ""; //重置查询语句
		this.__limit = "";
		this.__bindings = [];
		this.bindings = [];
		this.where(this.__primary, this.__data[this.__primary]);
		this.assign(data, true);
		return super.update(this.__data).then(model=>{
			return model.get();
		});
	}

	/**
	 * 删除一个的模型的数据库记录
	 * 
	 * @return {Promise} 返回 Promise，回调函数的参数是当前模型实例。
	 */
	delete(){
		this.__where = ""; //重置查询语句
		this.__bindings = [];
		this.bindings = [];
		this.where(this.__primary, this.__data[this.__primary]);
		return super.delete();
	}

	/**
	 * 从数据库中获取一个已经存在的模型
	 * 
	 * @return {Promise} 返回 Promise，回调函数的参数是当前模型实例。
	 */
	get(){
		return super.get().then(data=>this.assign(data));
	}

	/**
	 * 从数据库中获取所有符合查询条件的模型
	 * 
	 * @return {Promise} 返回 Promise，回调函数的参数是由所有获取到的模型实例构成
	 *                   的数组。
	 */
	all(){
		return super.all().then(data=>{
			var models = [];
			for(var i in data){
				var model = new this.constructor();
				model.__connection = this.__connection; //引用数据库连接
				model.assign(data[i]);
				models.push(model);
			}
			return models;
		});
	}

	/**
	 * 获取多个符合查询条件的模型，与 all() 方法不同，getMany() 可以设置其他的参数
	 * 来实现更复杂的查询，同时其返回值也提供更加详细的信息。
	 * @param  {Object}  args [可选] 用作查询的参数，除了可以设置为数据表字段外，还可以设
	 *                        置下面这些参数：
	 *                        - `page`     按指定的页码获取数据，默认 1
	 *                        - `limit`    获取数量的上限，默认 10
	 *                        - `orderBy`  按指定的字段排序，默认主键
	 *                        - `sequence` 排序方式，可以是 asc(默认), desc, rand
	 *                        - `keywords` 用作模糊查询的关键字列表，为一个数组或字符串
	 * @return {Promise}      返回 Promise，回调函数的参数是包含模型和相关信息的
	 *                        Object 对象，其中包含传入的参数和下面这些属性：
	 *                        - `total` 当前查询条件能够获取到的所有数组总数
	 *                        - `pages` 当前查询条件可以获取到的所有数据页码数
	 *                        - `data`  保存着所有获取到的模型的属性，为一个数组
	 */
	getMany(args = {}){
		var defaults = {
				page: 1,
				limit: 10,
				orderBy: this.__primary,
				sequence: 'asc',
				keywords: '',
			};
		args = Object.assign(defaults, args);
		
		//设置基本查询条件
		var offset = (args.page - 1) * args.limit;
		this.limit(offset, args.limit);
		if(args.sequence !== 'asc' && args.sequence != 'desc')
			this.random(); //随机排序
		else
			this.orderBy(args.orderBy, args.sequence);

		//根据数据表字段设置 where 查询条件
		for(var field of this.__fields){
			if(args[field] && defaults[field] === undefined)
				this.where(field, args[field]);
		}

		//设置关键字查询
		if(args.keywords && this.__searchable){
			var keywords = args.keywords;
			if(typeof keywords == 'string') keywords = [keywords];
			for(var i in keywords){
				//转义字符
				keywords[i] = keywords[i].replace('%', '\%').replace("\\", "\\\\");
			}
			//构造嵌套的查询条件
			this.where((query)=>{
				for(var field of this.__searchable){
					query.orWhere((query)=>{
						for(var keyword of keywords){
							query.orWhere(field, 'like', '%'+keyword+'%');
						}
					});
				}
			});
		}

		//获取分页信息
		return this.paginate(args.page, args.limit).then(info=>{
			return Object.assign(args, info);
		});
	}

	/***************************** 静态包装器 ****************************/

	static select(...fields){
		return (new this()).select(fields);
	}

	static join(table, field1, operator, field2){
		return (new this()).join(table, field1, operator, field2);
	}

	static leftJoin(table, field1, operator, field2){
		return (new this()).leftJoin(table, field1, operator, field2);
	}

	static rightJoin(table, field1, operator, field2){
		return (new this()).rightJoin(table, field1, operator, field2);
	}

	static fullJoin(table, field1, operator, field2){
		return (new this()).fullJoin(table, field1, operator, field2);
	}

	static crossJoin(table, field1, operator, field2){
		return (new this()).crossJoin(table, field1, operator, field2);
	}

	static where(field, operator, value){
		return (new this()).where(field, operator, value);
	}

	static whereBetween(field, range){
		return (new this()).whereBetween(field, range);
	}

	static whereNotBetween(field, range){
		return (new this()).whereNotBetween(field, range);
	}

	static whereIn(field, values){
		return (new this()).whereIn(field, values);
	}

	static whereNotIn(field, values){
		return (new this()).whereNotIn(field, values);
	}

	static whereNull(field){
		return (new this()).whereNull(field);
	}

	static whereNotNull(field){
		return (new this()).whereNotNull(field);
	}

	static orderBy(field, sequence = ""){
		return (new this()).orderBy(field, sequence);
	}

	static random(){
		return (new this()).random();
	}

	static groupBy(...fields){
		return (new this()).groupBy(fields);
	}

	static having(raw){
		return (new this()).having(raw);
	}

	static limit(offset, length = 0){
		return (new this()).limit(offset, length);
	}

	static all(){
		return (new this()).all();
	}

	static count(){
		return (new this()).count();
	}

	static paginate(page = 1, limit = 10){
		return (new this()).paginate(page, limit);
	}

	static getMany(args = {}){
		return (new this()).getMany(args);
	}

	static insert(data = {}){
		return (new this(data)).insert();
	}

	static update(data = {}){
		var model = new this();
		if(!data[model.__primary]){
			//如果没有传递主键，则抛出错误
			return new Promise(()=>{
				throw new Error(model.constructor.name+'.update() expects the primary key `'+model.__primary+'`, but none given.');
			});
		}
		return this.get(data[model.__primary]).then(model=>{
			return model.update(data);
		});
	}

	static delete(args = {}){
		var model = new this();
		if(typeof args == 'number'){ //如果传递了一个数字，则将其作为主键的值
			var id = args;
			args = {};
			args[model.__primary] = id;
		}
		if(!args[model.__primary]){
			return new Promise(()=>{
				throw new Error(model.constructor.name+'.delete() expects the primary key `'+model.__primary+'`, but none given.');
			});
		}
		return this.get(args[model.__primary]).then((model)=>{
			return model.delete();
		});
	}

	static get(args = {}){
		var model = new this();
		if(typeof args == 'number'){
			var id = args;
			args = {};
			args[model.__primary] = id;
		}else{
			//使用 Model.assign() 方法自动过滤不合法的参数
			args = Object.assign({}, model.assign(args, true).__data);
		}

		if(Object.keys(args).length){
			return model.where(args).get().then(model=>{
				//检测模型是否成功获取
				if(Object.keys(model.__data).length === 0)
					throw new Error(model.constructor.name+' was not found by searching the given arguments.');
				else
					return model;
			});
		}else{
			//如果没有提供任何合法参数，则抛出错误
			return new Promise(()=>{
				throw new Error(model.constructor.name+'.get() requires at least one argument of its fields, but none given.');
			});
		}
	}

	/**************************** 模型关联方法 *****************************/

	/**
	 * 定义一对多关联
	 * 
	 * @param  {String} model      所关联的模型
	 * @param  {String} foreignKey 所关联模型的外键名称
	 * @return {Model}             所关联模型的实例
	 */
	has(model, foreignKey){
		model = typeof model == 'string' ? (new require('./'+model)) : new model();
		return model.where(foreignKey, this.__data[this.__primary]);
	}

	/**
	 * 定义反向关联的隶属关系
	 * 
	 * @param  {String} model      所关联的模型
	 * @param  {String} foreignKey 所关联模型的外键名称
	 * @return {Model}             所关联模型的实例
	 */
	belongsTo(model, foreignKey){
		model = typeof model == 'string' ? (new require('./'+model)) : new model();
		return model.where(model.__primary, this.__data[foreignKey]);
	}

	/**
	 * 定义多对多关联
	 * 
	 * @param  {String}  model       所关联的模型
	 * @param  {String}  middleTable 中间表的表名
	 * @param  {String}  foreignKey1 当前模型指向中间表的外键
	 * @param  {String}  foreignKey2 所关联模型指向中间表的外键
	 * @return {Promise}             返回 Promise，回调函数的参数是所有关联到的模型
	 *                               实例组成的数组，每一个模型都被添加一个 pivot
	 *                               属性，可以用来获取中间表的数据；当前模型则添加
	 *                               一个 pivots 属性来保存所有的中间表数据。
	 */
	belongsToMany(model, middleTable, foreignKey1, foreignKey2){
		var query = (new Query(middleTable)); //获取一个 Query 实例
		//获取中间表数据
		return query.where(foreignKey1, this.__data[this.__primary]).all().then(data=>{
			this.pivots = data; //为当前模型添加 pivots 属性
			var ids = [];
			for(var i in data){
				ids.push(data[i][foreignKey2]); //获取所有关联模型的 ID
			}

			//获取关联模型数据
			model = typeof model == 'string' ? (new require('./'+model)) : new model();
			return model.whereIn(model.__primary, ids).all().then(models=>{
				var primary = models[0]._primary;
				for(var i in models){
					for(var pivot of data){
						if(pivot[foreignKey2] == models[i][primary]){
							models[i].pivot = pivot; //为关联模型添加 pivot 属性
							break;
						}
					}
				}
				return models;
			});
		});
	}

	/*********************** 迭代器接口 **************************/

	[Symbol.iterator](){
		var keys = Object.keys(this.__data),
			length = keys.length,
			index = -1;
		return {
			next: ()=>{
				index++;
				if(index < length){
					return {
						value: [keys[index], this.__data[keys[index]]],
						done: false,
					};
				}else{
					return {value: undefined, done: true};
				}
			}
		}
	}
}

Model.auth = null; //保存已登录用户的引用

module.exports = Model; //导出 NodeJS 模块