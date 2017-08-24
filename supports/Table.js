const DB = require('./DB'); //引用 DB 对象

/**
 * 数据表操作类，用来创建、删除和更改表结构
 */
class Table extends DB{
	/**
	 * 创建一个新的数据表实例，并在保存时创建一个新的数据表
	 * 
	 * @param  {String} table 数据表名称
	 */
	constructor(table){
		super();
		this.ddl = ''; //数据库创建语句
		this.__table = table; //数据表名
		this.__fields = []; //字段列表
		this.__index = -1; //当前指针位置
	}

	/**
	 * 添加列
	 * 
	 * @param  {String}  name   字段名称
	 * @param  {String}  type   类型
	 * @param  {Number}  length [可选] 数据长度，0 (默认)则表示不设置长度，也可以
	 *                          设置为一个包含两个长度的数组来限制区间；
	 * @return {Table}   this   当前实例
	 */
	addColumn(name, type, length = 0){
		this.__index += 1; //指针前移
		if(length){
			if(length instanceof Array)
				length = length.join(',');
			type += '('+length+')';
		}
		this.__fields.push(Object.assign({
			name: '', //字段名
			type: '', //类型
			notNull: false, //不为空
			default: undefined, //默认值
			primary: false, //是否为主键
			autoIncrement: false, //是否自增
			unsigned: false, //无符号
			unique: false, //值唯一
			comment: '', //注释
			foreignKey: {
				table: '', //外键所在表
				field: '', //外键字段
				onUpdate: 'no action', //更新时的行为，可选 no action, set null, cascade, restrict
				onDelete: 'no action', //删除时行为，可选值同 onUpdate
			}, //外键

		}, {name, type}));
		return this;
	}

	/********************* 字段修饰 **********************************/

	/**
	 * 设置字段为主键
	 * 
	 * @return {Table} this 当前实例
	 */
	primary(){
		this.__fields[this.__index].primary = true;
		return this;
	}

	/**
	 * 设置字段的值是自增的
	 * 
	 * @return {Table} this 当前实例
	 */
	autoIncrement(){
		this.__fields[this.__index].autoIncrement = true;
		return this;
	}

	/**
	 * 设置值唯一
	 * 
	 * @return {Table} this 当前实例
	 */
	unique(){
		this.__fields[this.__index].unique = true;
		return this;
	}

	/**
	 * 设置默认值
	 * 
	 * @param  {String} value 设置的值
	 * @return {Table}  this  当前实例
	 */
	default(value){
		this.__fields[this.__index].default = value;
		return this;
	}

	/**
	 * 设置字段不为空
	 * 
	 * @return {Table} this 当前实例
	 */
	notNull(){
		this.__fields[this.__index].notNull = true;
		return this;
	}

	/**
	 * 设置数字类型的字段无符号
	 * 
	 * @return {Table} this 当前实例
	 */
	unsigned(){
		this.__fields[this.__index].unsigned = true;
		return this;
	}

	/**
	 * 添加注释
	 * 
	 * @param  {String} text 注释文本
	 * @return {Table}  this 当前实例
	 */
	comment(text){
		this.__fields[this.__index].comment = value;
		return this;
	}

	/**
	 * 设置外键约束
	 * 
	 * @param  {Any}    table    外键引用的表名，也可以设置为一个 Object 对象一次性
	 *                           设置所有下面（包括 table 自身）的约束信息
	 * @param  {String} field    [可选] 绑定的字段
	 * @param  {String} onUpdate [可选] 在绑定的记录被更新时触发的行为，可选 
	 *                           no action, set null, cascade, restrict
	 * @param  {String} onDelete 在绑定的记录被删除时触发的行为，可选值同 onUpdate
	 * @return {Table}  this     当前实例
	 */
	foreignKey(table, field, onUpdate, onDelete){
		var foreignKey = (table instanceof Object) ? table : {table, field, onUpdate, onDelete};
		this.__fields[this.__index].foreignKey = Object.assign(this.__fields[this.__index].foreignKey, foreignKey);
		return this;
	}

	/**
	 * 保存数据表
	 * 
	 * @return {Promise} 返回 Promise，回调函数的参数是当前 Table 实例。
	 */
	save(){
		return this.__generateDDL().query(this.ddl).then(db=>{
			return this;
		});
	}

	/** 生成 DDL 语句 */
	__generateDDL(){
		var columns = [];
		var foreigns = [];
		var isSqlite = this.__config.type == 'sqlite';
		var isMysql = this.__config.type == 'mysql';

		for(var field of this.__fields){
			var column = '`'+field.name+'` '+field.type;
			if(field.primary) column += ' primary key';
			if(field.autoIncrement){ //处理自增字段
				if(isSqlite)
					column += ' autoincrement';
				else if(isMysql)
					column += ' auto_increment';
			}
			if(field.default === null)
				column += ' default null';
			else if(field.default !== undefined)
				column += ' default '+field.default;
			if(field.notNull) column += ' not null';
			if(field.unsigned) column += ' unsigned';
			if(field.unique) column += ' unique';
			if(field.comment) column += " comment '"+field.comment+"'";
			if(field.foreignKey.table){
				var foreign = ' references `'+field.foreignKey.table
							+'` (`'+field.foreignKey.field+'`) on delete '
							+field.foreignKey.onDelete+' on update '
							+field.foreignKey.onUpdate;
				if(isSqlite){
					column += foreign;
				}else if(isMysql){ //mysql 的外键语句要放在最后
					foreigns.push('foreign key (`'+field.name+'`)'+foreign);
				}
			};
			columns.push(column);
		}
		//对 DDL 语句进行换行和缩进
		this.ddl = 'create table `'+this.__table+'` (\n\t'+columns.join(",\n\t");
		if(foreigns.length)
			this.ddl += ',\n\t'+foreigns.join(',\n\t');
		this.ddl +='\n)';
		if(isMysql) //mysql 需要指明数据库引擎和默认字符集
			this.ddl += ' engine=InnoDB default charset='+this.__config.charset;
		return this;
	}
}

module.exports = Table;