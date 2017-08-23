const DB = require('./DB'); //引用 DB 对象

/**
 * 数据库查询构造器，用来查询处理和处理指定数据表中的记录
 */
class Query extends DB{
	/**
	 * 创建新的查询构造器实例
	 * @param  {String} table 绑定的数据表名
	 */
	constructor(table){
		super();
		this.__table = (table ? '`'+table+'`' : ''); //设置数据表
		this.__inserts = ''; //insert 插入语句
		this.__updates = ''; //update 更新语句
		this.__selects = '*'; //select 查询语句
		this.__join = ""; //join 子句
		this.__where = ''; //where 子句
		this.__orderBy = ""; //order by 子句
		this.__groupBy = ""; //group by 子句
		this.__having = ""; //having 子句
		this.__limit = ''; //limit 子句
		this.__union = ""; //union 语句
		this.__bindings = []; //绑定的参数值，注意该属性不会保存 insert/update 语句中的其他参数值
		
		// this.sql = ""; //最终生成的 SQL 语句
		// this.bindings = []; //保存包括 insert/update 语句在内的所有参数值
		// this.insertId = 0, //insert 成功后返回的主键 ID
		// this.affectedRows = 0; //SQL 语句影响的记录行数
	}

	/**
	 * 将事件处理器绑定到全局 Query 查询中
	 * @param  {String}   event    事件名称
	 * @param  {Function} callback 事件被触发时执行的回调函数
	 * @return {Query}             Query 类自身
	 */
	static on(event, callback){
		this.events = this.events || {
			insert: [], //插入事件，新数据保存时触发
			inserted: [], //插入后事件，新数据保存后触发
			update: [], //更新事件，数据被更新时触发
			updated: [], //更新后事件，数据被更新后触发
			delete: [], //删除事件，数据被删除时触发
			deleted: [], //删除后事件，数据被删除后触发
			get: [],    //获取事件，获取到数据时触发
		};
		if(this.events[event] === undefined)
			this.events[event] = [];
		this.events[event].push(callback);
		return this;
	}

	/**
	 * 触发事件处理器
	 * @param  {String} event 事件名称
	 * @param  {Mixed}  data  传递给回调函数的参数
	 * @return {Query}        Query 类自身
	 */
	static trigger(event, data){
		if(this.events){
			if(this.events[event] instanceof Array){
				for(var callback of this.events[event]){
					callback.call(this, data);
				}
			}else if(this.events[event] instanceof Function){
				this.events[event].call(this, data);
			}
		}	
		return this;
	}

	//自动为字段添加反引号，如果字段名称不符合条件，则不会添加
	__backquote(field){
		if(field.indexOf(' ') === -1 && field.indexOf('(') === -1 && field.indexOf('`') === -1 && field.indexOf('.') === -1 && field != '*')
			field = '`'+field+'`';
		return field;
	}

	//为多个字段添加反引号
	__backquoteFields(fields){
		for(var i in fields){
			fields[i] = this.__backquote(fields[i]);
		}
		return fields;
	}

	/**
	 * 设置 select 查询的信息
	 * @param  {Mixed} ...fields 字段列表，每一个字段为一个参数，除了字段以外，也
	 *                           可以设置其他的信息，如 *；此外，也可以只设置第一个
	 *                           参数为一个数组，这样可以更好的控制需要查询的字段；
	 * @return {Query} this      当前实例
	 */
	select(...fields){
		if(fields[0] instanceof Array)
			fields = fields[0];
		fields = this.__backquoteFields(fields);
		this.__selects = fields.join(', ');
		return this;
	}

	/** 方法的别名 */
	from(table){
		return this.table(table);
	}

	/**
	 * 设置当前 Query 实例绑定的数据表
	 * @param  {String} table 数据表名称
	 * @return {Query}  this  当前实例
	 */
	table(table){
		this.__table = '`'+table+'`';
		return this;
	}

	/**
	 * 设置 inner join 子句
	 * @param  {String} table    要进行关联的表名
	 * @param  {Mixed}  field1   主表的字段，需要以表名作为前缀；也可以设置为一个
	 *                           Object 对象，来同时设置多个 join 条件；还可以设置
	 *                           为一个回调函数用来处理嵌套的 on 语句，回调函数
	 *                           支持一个参数，即一个实例化的 Query 对象，因此可以
	 *                           在回调函数中使用 Query 对象的所有方法；
	 * @param  {String} operator [可选]条件运算符，如果未设置 field2 参数，则该参
	 *                           数将被修改为 filed2，而 operator 则为 =；
	 * @param  {String} field2   [可选]field1 参数对应的位于 table 表的字段，如果
	 *                           未设置该参数，则将 operator 参数修改为 filed2，
	 *                           而 operator 则为 =；
	 * @return {Query}  this     当前实例
	 */
	join(table, field1, operator, field2){
		if(typeof field1 == 'function')
			return this.__handleNestedJoin(table, field1);
		else
			return this.__handleJoin(table, field1, operator, field2);
	}

	/** 设置 left join 子句，其参数和调用方式请参考 join() 方法 */
	leftJoin(table, field1, operator, field2){
		if(typeof field1 == 'function')
			return this.__handleNestedJoin(table, field1, 'left');
		else
			return this.__handleJoin(table, field1, operator, field2, 'left');
	}

	/** 设置 right join 子句，其参数和调用方式请参考 join() 方法 */
	rightJoin(table, field1, operator, field2){
		if(typeof field1 == 'function')
			return this.__handleNestedJoin(table, field1, 'right');
		else
			return this.__handleJoin(table, field1, operator, field2, 'right');
	}

	/** 设置 full join 子句，其参数和调用方式请参考 join() 方法 */
	fullJoin(table, field1, operator, field2){
		if(typeof field1 == 'function')
			return this.__handleNestedJoin(table, field1, 'full');
		else
			return this.__handleJoin(table, field1, operator, field2, 'full');
	}

	/** 设置 cross join 子句，其参数和调用方式请参考 join() 方法 */
	crossJoin(table, field1, operator, field2){
		if(typeof field1 == 'function')
			return this.__handleNestedJoin(table, field1, 'cross');
		else
			return this.__handleJoin(table, field1, operator, field2, 'cross');
	}

	//处理 join 子句
	__handleJoin(table, field1, operator, field2, type = 'inner'){
		if(field1 instanceof Object){
			this.__handleNestedJoin(table, (query)=>{
				query.on(field1);
			}, type);
		}else{
			if(field2 === undefined){
				field2 = operator;
				operator = "=";
			}
			if(!this.__join){ //单个 join
				this.__join = this.__table+" "+type+" join `"+table+'` on '+field1+" "+operator+" "+field2;
			}else{ //多个 join
				this.__join = '('+this.__join+') '+type+' join '+table+'` on '+field1+" "+operator+" "+field2;
			}
		}
		return this;
	}

	//处理壳套的 join 子句
	__handleNestedJoin(table, callback, type = "inner"){
		var query = new Query(); //子句实例
		callback.call(query, query);
		if(query.__where){
			this.__bindings = this.__bindings.concat(query.__bindings);
			if(!this.__join){ //单个 join
				this.__join = this.__table+" "+type+" join `"+table+'` on '+query.__where;
			}else{ //多个 join
				this.__join = '('+this.__join+') '+type+' join '+table+'` on '+query.__where;
			}
		}
		return this;
	}

	/**
	 * 设置 join 子句中嵌套的 on 条件，其参数和调用方式请参考 where() 方法，也
	 * 可以和 where/orWhere 一起使用，但该方法只能在 join/leftJoin/rightJoin/
	 * fullJoin/crossJoin 的回调函数中使用。
	 */
	on(field1, operator, field2){
		return this.__handleOn(field1, operator, field2, 'and');
	}

	/**
	 * 设置 join 子句中嵌套的 or on 条件，其参数和调用方式请参考 orWhere() 方法，
	 * 也可以和 where/orWhere 一起使用，但该方法只能在 join/leftJoin/rightJoin/
	 * fullJoin/crossJoin 的回调函数中使用。
	 */
	orOn(field1, operator, field2){
		return this.__handleOn(field1, operator, field2, 'or');
	}

	//处理 join 语句中的 on 子句
	__handleOn(field1, operator, field2, type = 'and'){
		if(field1 instanceof Object){
			for(var key in field1){
				this.__handleOn(key, '=', field1[key], type);
			}
		}else{
			if(field2 === undefined){
				field2 = operator;
				operator = '=';
			}
			if(this.__where) this.__where += ' '+type+' ';
			this.__where += field1+' '+operator+' '+field2;
		}
		return this;
	}

	/**
	 * 设置 where 条件。
	 * @param  {Mixed}  field    可以设置为一个数据表字段，也可以设置为一个 Object 
	 *                           对象来同时设置多个 where 条件，还可以设置为一个回
	 *                           调函数用来处理嵌套的 where 语句，回调函数支持一个
	 *                           参数，即一个实例化的 Query 对象，因此可以在回调函
	 *                           数中使用 Query 对象的所有方法；
	 * @param  {String} operator [可选]条件运算符，如果未设置 value 参数，则该参数
	 *                           将被修改为 value，而 operator 则为 =；
	 * @param  {Mixed}  value    [可选]field 参数对应的值，如果未设置该参数，则将
	 *                           operator 参数修改为 value，而 operator 则为 =；
	 * @return {Query}  this     当前实例
	 */
	where(field, operator, value){
		var isFunc = (field instanceof Function);
		if(field instanceof Object && !isFunc){
			for(var key in field){
				this.where(key, '=', field[key]);
			}
		}else{
			if(this.__where) this.__where += " and ";
			if(isFunc){
				this.__handleNestedWhere(field);
			}else{
				this.__handleWhere(field, operator, value);
			}
		}
		return this;
	}

	/**
	 * 设置 where 条件中的 or 条件。
	 * @param  {Mixed}  field    可以设置为一个数据表字段，也可以设置为一个 Object 
	 *                           对象来同时设置多个 where 条件，还可以设置为一个回
	 *                           调函数用来处理嵌套的 where 语句，回调函数支持一个
	 *                           参数，即一个实例化的 Query 对象，因此可以在回调函
	 *                           数中使用 Query 对象的所有方法；
	 * @param  {String} operator [可选]条件运算符，如果未设置 value 参数，则该参数
	 *                           将被修改为 value，而 operator 则为 =；
	 * @param  {Mixed}  value    [可选]field 参数对应的值，如果未设置该参数，则将
	 *                           operator 参数修改为 value，而 operator 则为 =；
	 * @return {Query}  this     当前实例
	 */
	orWhere(field, operator, value){
		var isFunc = (field instanceof Function);
		if(field instanceof Object && !isFunc){
			for(var key in field){
				this.orWhere(key, '=', field[key]);
			}
		}else{
			if(this.__where) this.__where += " or ";
			if(isFunc){
				this.__handleNestedWhere(field);
			}else{
				this.__handleWhere(field, operator, value);
			}
		}
		return this;
	}

	//处理普通 where 语句
	__handleWhere(field, operator, value){
		if(value === undefined){
			value = operator;
			operator = '=';
		}
		this.__where += this.__backquote(field)+" "+operator+" ?";
		this.__bindings.push(value);
	}

	//处理嵌套的 where 语句
	__handleNestedWhere(callback){
		var query = new Query(); //子句实例
		callback.call(query, query);
		if(query.__where){
			this.__where += "("+query.__where+')';
			this.__bindings = this.__bindings.concat(query.__bindings);
		}
	}

	/**
	 * 设置 where between 子句的 where 条件
	 * @param  {String} field 字段名称
	 * @param  {Array}  range 约束的范围，数组的第一个值是开始位置，第二个元素是结束
	 *                        位置；
	 * @return {Query}  this  当前实例
	 */
	whereBetween(field, range){
		return this.__handleBetween(field, range);
	}

	/**
	 * 设置 where not between 子句的 where 条件
	 * @param  {String} field 字段名称
	 * @param  {Array}  range 约束的范围，数组的第一个值是开始位置，第二个元素是结束
	 *                        位置；
	 * @return {Query}  this  当前实例
	 */
	whereNotBetween(field, range){
		return this.__handleBetween(field, range, false);
	}

	//处理 where between 子句
	__handleBetween(field, range, between = true){
		if(this.__where) this.__where += ' and ';
		this.__where += this.__backquote(field)+(between ? '': ' not')+' between ? and ?';
		this.__bindings = this.__bindings.concat(range);
		return this;
	}

	/**
	 * 设置 where in 子句的 where 条件
	 * @param  {String} field  字段名称
	 * @param  {Array}  vlaues 可能的值
	 * @return {Query}  this   当前实例
	 */
	whereIn(field, values){
		return this.__handleIn(field, values);
	}

	/**
	 * 设置 where not in 子句的 where 条件
	 * @param  {String} field  字段名称
	 * @param  {Array}  vlaues 可能的值
	 * @return {Query}  this   当前实例
	 */
	whereNotIn(field, values){
		return this.__handleIn(field, values, false)
	}

	//处理 where in 子句
	__handleIn(field, values, isIn = true){
		if(this.__where) this.__where += ' and ';
		var _values = Array(values.length).fill('?');
		this.__where += this.__backquote(field)+(isIn ? '': ' not')+' in ('+_values.join(', ')+')';
		this.__bindings = this.__bindings.concat(values);
		return this;
	}

	/**
	 * 设置 where exists 子句
	 * @param  {Function} callback 处理嵌套包装的回调函数，回调函数支持一个参数，即
	 *                             一个 Query 对象，因此可以在函数中使用所有 Query
	 *                             的方法来构造查询语句；
	 * @return {Query}    this     当前实例
	 */
	whereExists(callback){
		return this.__handleExists(callback);
	}

	/**
	 * 设置 where not exists 子句
	 * @param  {Function} callback 处理嵌套包装的回调函数，回调函数支持一个参数，即
	 *                             一个 Query 对象，因此可以在函数中使用所有 Query
	 *                             的方法来构造查询语句；
	 * @return {Query}    this     当前实例
	 */
	whereNotExists(callback){
		return this.__handleExists(callback, false);
	}

	//处理 where exists 子句
	__handleExists(callback, exists = true){
		if(this.__where) this.__where += ' and ';
		var query = new Query(); //子句实例
		callback.call(query, query);
		this.__where += (exists ? '' : 'not ')+'exists ('+query.sql+')';
		this.__bindings = this.__bindings.concat(query.__bindings);
		return this;
	}

	/**
	 * 设置 where null 的约束条件
	 * @param  {String} field 字段名称
	 * @return {Query}  this  当前实例
	 */
	whereNull(field){
		return this.__handleWhereNull(field);
	}

	/**
	 * 设置 where not null 的约束条件
	 * @param  {String} field 字段名称
	 * @return {Query}  this  当前实例
	 */
	whereNotNull(field){
		return this.__handleWhereNull(field, false);
	}

	//处理 where null 子句
	__handleWhereNull(field, isNull = true){
		if(this.__where) this.__where += ' and ';
		this.__where += this.__backquote(field)+' is '+(isNull ? '' : 'not ')+'null';
		return this;
	}

	/**
	 * 设置 order by 子句
	 * @param  {String} field    字段名称，也可以设置为 rand() 或 random() 之类的
	 *                           函数来实现随机排序
	 * @param  {String} sequence 排序方式，可以是 asc 和 desc
	 * @return {Query}  this      当前实例
	 */
	orderBy(field, sequence = ""){
		var comma = this.__orderBy ? ', ' : '';
		this.__orderBy += comma+this.__backquote(field);
		if(sequence) this.__orderBy += ' '+sequence;
		return this;
	}

	/**
	 * 设置随机排序
	 * @return {Query} this 当前实例
	 */
	random(){
		switch(this.config.type){
			case 'sqlite':
				var rand = 'random()';
			break;
			case 'sqlserve':
				var rand = 'newid()';
			break;
			default:
				var rand = 'rand()';
			break;
		}
		this.__orderBy = rand;
		return this;
	}

	/**
	 * 设置 group by 子句
	 * @param  {Mixed} ...fields 字段列表，每一个字段为一个参数,也可以只设置第一个
	 *                           参数为一个数组来同时设置多个字段；
	 * @return {Query} this      当前实例
	 */
	groupBy(...fields){
		if(fields[0] instanceof Array)
			fields = fields[0];
		fields = this.__backquoteFields(fields);
		this.__groupBy = fields.join(', ');
		return this;
	}

	/**
	 * 设置 having 子句的约束条件
	 * @param  {String} raw  一个没有经过处理也不会进行任何处理的原始 sql 语句，因此
	 *                       使用该方法是存在安全隐患的，绝对不要直接传递来自客户端
	 *                       的变量；
	 * @return {Query}  this 当前实例
	 */
	having(raw){
		this.__having += (this.__having ? ' and ' : '')+raw;
	}

	/**
	 * 设置 limit 子句
	 * @param  {Integer} offset 起始点位置，从 0 开始计算；如果未设置 length 参数，
	 *                          则 offset 将会被当作 length，而 offset 则为 0；
	 * @param  {Integer} length 获取数据的最大个数
	 * @return {Query}   this      当前实例
	 */
	limit(offset, length = 0){
		this.__limit = length ? offset+', '+length : offset;
		return this;
	}

	/**
	 * 设置 distinct 查询唯一值
	 * @return {Query} this 当前实例
	 */
	distinct(){
		this.__selects = 'distinct '+this.__selects;
		return this;
	}

	/**
	 * 合并两个 SQL 语句
	 * @param  {Mixed}   query 可以是一个 SQL 查询语句，也可以是一个 Query 对象;
	 * @param  {Boolean} all   [可选]是否使用 union all 来进行全合并从而允许重复值，
	 *                         默认 false;
	 * @return {Query}   this  当前实例
	 */
	union(query, all = false){
		if(query instanceof Query){
			query.__generateSelectSQl();
			this.__union += ' union '+(all ? 'all ' : '')+query.sql;
		}else if(typeof query == 'string'){
			this.__union += ' union '+(all ? 'all ' : '')+query;
		}
		return this;
	}

	/**
	 * 插入新的数据库记录
	 * @param  {Object} data 用 Object 对象表示字段和值的对应关系，也可以设置为一个
	 *                       索引数组而不使用键值对，但要求数组的长度与数据表字段个数
	 *                       相等。
	 * @return {Promise}     返回 Promise，回调函数的参数是当前 Query 实例。
	 */
	insert(data){
		var bindings = [];
		var fields = [];
		var values = [];
		var isObj = !(data instanceof Array);
		for(var field in data){
			bindings.push(data[field]);
			if(isObj) fields.push(this.__backquote(field));
			values.push('?');
		}
		if(isObj) fields = fields.join(', ');
		values = values.join(', ');
		this.__inserts = (isObj ? '('+fields+') ' : '')+'values ('+values+')';
		this.sql = 'insert into '+this.__table+' '+this.__inserts;
		Query.trigger('insert', this); //触发事件回调函数
		return this.query(this.sql, bindings).then(db=>{
			this.bindings = Object.assign([], bindings);
			this.insertId = db.insertId;
			this.affectedRows = db.affectedRows;
			Query.trigger('inserted', this);
			return this;
		});
	}

	/**
	 * 更新已有的数据库记录
	 * @param  {Object} data 用 Object 对象表示字段和值的对应关系
	 * @return {Promise}     返回 Promise，回调函数的参数是当前 Query 实例。
	 */
	update(data){
		var bindings = [];
		var fields = [];
		for(var field in data){
			bindings.push(data[field]);
			fields.push(this.__backquote(field)+' = ?');
		}
		bindings = bindings.concat(this.__bindings);
		this.__updates = fields.join(', ');
		this.sql = 'update '+this.__table+' set '+this.__updates
				+ (this.__where ? " where "+this.__where : "");
		Query.trigger('update', this); //触发事件回调函数
		return this.query(this.sql, bindings).then(db=>{
			this.bindings = Object.assign([], bindings);
			this.affectedRows = db.affectedRows;
			Query.trigger('updated', this);
			return this;
		});
	}

	/**
	 * 删除数据库记录
	 * @return {Promise} 返回 Promise，回调函数的参数是当前 Query 实例。
	 */
	delete(){
		this.sql = 'delete from '+this.__table
				+ (this.__where ? " where "+this.__where : "");
		Query.trigger('delete', this); //触发事件回调函数
		return this.query(this.sql, this.__bindings).then(db=>{
			this.bindings = Object.assign([], this.__bindings);
			this.affectedRows = db.affectedRows;
			Query.trigger('deleted', this);
			return this;
		});
	}

	/**
	 * 获取一条符合条件的数据库记录
	 * @return {Promise} 返回 Promise，回调函数的参数是获取的数据库记录。
	 */
	get(){
		this.__limit = 1;
		return this.__handleSelect().then(data=>data[0]);
	}

	/**
	 * 获取所有符合条件的数据库记录
	 * @return {Promise} 返回 Promise，回调函数的参数是获取的数据库记录。
	 */
	all(){
		return this.__handleSelect();
	}
	
	/**
	 * 获取所有符合条件的数据库记录数量
	 * @return {Promise} 返回 Promise，回调函数的参数是获取的记录数量。
	 */
	count(){
		this.__selects = 'count(*) as count';
		this.__limit = ""; //count 语句不能使用 limit
		return this.__handleSelect().then(data=>data[0].count);
	}

	/** 获取记录。 */
	__handleSelect(){
		this.__generateSelectSQl();
		return this.query(this.sql, this.__bindings).then(db=>{
			this.bindings = Object.assign([], this.__bindings);
			Query.trigger('get', this); //触发事件回调函数
			return db.__data;
		});
	}

	/** 生成 select 查询语句。 */
	__generateSelectSQl(){
		this.sql = "select "+this.__selects+" from "
				+ (!this.__join ? this.__table : '')
				+ this.__join
				+ (this.__where ? " where "+this.__where : "")
				+ (this.__orderBy ? ' order by '+this.__orderBy : "")
				+ (this.__groupBy ? ' group by '+this.__groupBy : '')
				+ (this.__having ? 'having '+this.__having : '')
				+ (this.__limit ? ' limit '+this.__limit : '')
				+ (this.__union ? ' union '+this.__union : '');
		return this;
	}

	/**
	 * 获取所有符合条件的数据库记录的分页信息
	 * @param  {Number}  page  当前页码
	 * @param  {Number}  limit 每一页的数据上限
	 * @return {Promise}       返回 Promise，回调函数的参数是包含模型和相关信息的
	 *                         Object 对象，其中包含传入的参数和下面这些属性：
	 *                         pages: 当前查询条件可以获取到的所有数据页码数
	 *                         total: 当前查询条件能够获取到的所有数组总数
	 *                         data:  保存着所有获取到的模型的属性，为一个数组
	 */
	paginate(page = 1, limit = 10){
		var offset = (page - 1) * limit;
		return this.limit(offset, limit).all().then(data=>{
			return this.count().then(total=>{
				return {
					page,
					pages: Math.ceil(total / limit),
					limit,
					total,
					data,
				};
			});
		});
	}
}

module.exports = Query;