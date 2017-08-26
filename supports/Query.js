const DB = require('./DB'); //Import DB class.

/**
 * Query Constructor for SQL statements and beyond.
 * 
 * This class provides a bunch of methods with Object-Oriented features to 
 * make generating SQL statements and handling data more easier and fun.
 */
class Query extends DB{
    /**
     * Creates a new instance with a specified table name binding to it.
     * 
     * @param  {String} table [optional] The table name binds to the instance.
     */
    constructor(table = ""){
        super();
        this.__table = (table ? '`'+table+'`' : '');
        this.__inserts = ''; //Data of insert statement.
        this.__updates = ''; //Data of update statement.
        this.__selects = '*'; //Data of select statement.
        this.__join = ""; //Join clause.
        this.__where = ''; //Where clause.
        this.__orderBy = ""; //Order-by clause.
        this.__groupBy = ""; //Group-by clause.
        this.__having = ""; //Having clause.
        this.__limit = ''; //Limit condition.
        this.__union = ""; //Union clause.
        this.__bindings = []; //Data that bind to select statement.
        
        //Event handlers.
        this.__events = Object.assign({
            query: [],    //This event will be fired when a SQL statement has 
                          //been successfully executed.
            insert: [],   //This event will be fired when a new record is 
                          //about to be inserted into the database.
            inserted: [], //This event will be fired when a new record is 
                          //successfully inserted into the database.
            update: [],   //This event will be fired when a record is about 
                          //to be updated.
            updated: [],  //This event will be fired when a record is 
                          //successfully updated.
            delete: [],   //This event will be fired when a record is about 
                          //to be deleted.
            deleted: [],  //This event will be fired when a record is 
                          //successfully deleted.
            get: [],      //This event will be fired when a record is 
                          //successfully fetched from the database.
        }, this.constructor.__events);
    }

    /** Adds back-quote to a specified field. */
    __backquote(field){
        var parts = field.split(".");
        if(field.indexOf(' ') < 0 && field.indexOf('(') < 0 
            && field.indexOf('`') < 0 && field != '*' && parts.length === 1){
            field = '`'+field+'`';
        }else if(parts.length === 2){
            field = '`'+parts[0]+'`.`'+parts[1]+'`';
        }
        return field;
    }

    /** Adds back-quotes to multiple fields. */
    __backquoteFields(fields){
        for(var i in fields){
            fields[i] = this.__backquote(fields[i]);
        }
        return fields;
    }

    /**
     * Sets the fields that need to be fetched.
     * 
     * @param  {Any} fields A list of all target fields, each one passed as an
     *                      argument. Or just pass the first argument as an 
     *                      Array that carries all the field names.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    select(...fields){
        if(fields[0] instanceof Array)
            fields = fields[0];
        fields = this.__backquoteFields(fields);
        this.__selects = fields.join(', ');
        return this;
    }

    /**
     * Sets the table name that the current instance binds to.
     * 
     * @param  {String} table A table name.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    table(table){
        this.__table = '`'+table+'`';
        return this;
    }

    /** An alias of Query.table() */
    from(table){
        return this.table(table);
    }

    /**
     * Sets the inner join clause for the SQL statement.
     * 
     * @param  {String} table    A table name that needs to join with.
     * @param  {String} field1   A field name in the table that currently 
     *                           binds to.
     * @param  {String} operator Condition operator, if the `field2` isn't 
     *                           passed, then this argument will replace it,
     *                           and the operator will become an `=`.
     * @param  {String} field2   [optional] A field in `table` that needs to
     *                           be compared with `field1`. If this argument
     *                           is missed, then `operator` will replace it, 
     *                           and the operator will become an `=`.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    join(table, field1, operator, field2 = ""){
        return this.__handleJoin(table, field1, operator, field2);
    }

    /**
     * Sets a left join clause for the SQL statement.
     * 
     * @param  {String} table    A table name that needs to join with.
     * @param  {String} field1   A field name in the table that currently 
     *                           binds to.
     * @param  {String} operator Condition operator, if the `field2` isn't 
     *                           passed, then this argument will replace it,
     *                           and the operator will become an `=`.
     * @param  {String} field2   [optional] A field in `table` that needs to
     *                           be compared with `field1`. If this argument
     *                           is missed, then `operator` will replace it, 
     *                           and the operator will become an `=`.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    leftJoin(table, field1, operator, field2 = ""){
        return this.__handleJoin(table, field1, operator, field2, 'left');
    }

    /**
     * Sets a right join clause for the SQL statement.
     * 
     * @param  {String} table    A table name that needs to join with.
     * @param  {String} field1   A field name in the table that currently 
     *                           binds to.
     * @param  {String} operator Condition operator, if the `field2` isn't 
     *                           passed, then this argument will replace it,
     *                           and the operator will become an `=`.
     * @param  {String} field2   [optional] A field in `table` that needs to
     *                           be compared with `field1`. If this argument
     *                           is missed, then `operator` will replace it, 
     *                           and the operator will become an `=`.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    rightJoin(table, field1, operator, field2 = ""){
        return this.__handleJoin(table, field1, operator, field2, 'right');
    }

    /**
     * Sets a full join clause for the SQL statement.
     * 
     * @param  {String} table    A table name that needs to join with.
     * @param  {String} field1   A field name in the table that currently 
     *                           binds to.
     * @param  {String} operator Condition operator, if the `field2` isn't 
     *                           passed, then this argument will replace it,
     *                           and the operator will become an `=`.
     * @param  {String} field2   [optional] A field in `table` that needs to
     *                           be compared with `field1`. If this argument
     *                           is missed, then `operator` will replace it, 
     *                           and the operator will become an `=`.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    fullJoin(table, field1, operator, field2 = ""){
        return this.__handleJoin(table, field1, operator, field2, 'full');
    }

    /**
     * Sets a cross join clause for the SQL statement.
     * 
     * @param  {String} table    A table name that needs to join with.
     * @param  {String} field1   A field name in the table that currently 
     *                           binds to.
     * @param  {String} operator Condition operator, if the `field2` isn't 
     *                           passed, then this argument will replace it,
     *                           and the operator will become an `=`.
     * @param  {String} field2   [optional] A field in `table` that needs to
     *                           be compared with `field1`. If this argument
     *                           is missed, then `operator` will replace it, 
     *                           and the operator will become an `=`.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    crossJoin(table, field1, operator, field2 = ""){
        return this.__handleJoin(table, field1, operator, field2, 'cross');
    }

    /** Handle join clauses. */
    __handleJoin(table, field1, operator, field2, type = 'inner'){
        if(field2 === undefined){
            field2 = operator;
            operator = "=";
        }
        if(!this.__join){ //One join.
            this.__join = this.__table+" "+type+" join `"+table+'` on '
                        + field1+" "+operator+" "+field2;
        }else{ //Multiple joins.
            this.__join = '('+this.__join+') '+type+' join '+table+'` on '
                        + field1+" "+operator+" "+field2;
        }
        return this;
    }

    /**
     * Set a where clause for the SQL statement.
     * 
     * @param  {Any}    field    This could be a field name, or an Object that
     *                           sets multiple `=` (equal) conditions for the 
     *                           clause. Or pass a callback function to 
     *                           generate nested conditions, the only argument
     *                           passed to the callback is a new Query 
     *                           instance with its features.
     * @param  {String} operator Condition operator, if the `value` isn't 
     *                           passed, then this argument will replace it,
     *                           and the operator will become an `=`.
     * @param  {Any}    value    [optional] A value that needs to be compared 
     *                           with `field`. If this argument is missed, 
     *                           then `operator` will replace it, and the 
     *                           operator will become an `=`.
     * 
     * @return {Query} Returns the current instance for function chaining.
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
     * Set an where...or clause for the SQL statement.
     * 
     * @param  {Any}    field    This could be a field name, or an Object that
     *                           sets multiple `=` (equal) conditions for the 
     *                           clause. Or pass a callback function to 
     *                           generate nested conditions, the only argument
     *                           passed to the callback is a new Query 
     *                           instance with its features.
     * @param  {String} operator Condition operator, if the `value` isn't 
     *                           passed, then this argument will replace it,
     *                           and the operator will become an `=`.
     * @param  {Any}    value    [optional] A value that needs to be compared 
     *                           with `field`. If this argument is missed, 
     *                           then `operator` will replace it, and the 
     *                           operator will become an `=`.
     * 
     * @return {Query} Returns the current instance for function chaining.
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

    /** Handle where (or) clauses. */
    __handleWhere(field, operator, value){
        if(value === undefined){
            value = operator;
            operator = '=';
        }
        this.__where += this.__backquote(field)+" "+operator+" ?";
        this.__bindings.push(value);
        return this;
    }

    /** Handle nested where (...or) clauses. */
    __handleNestedWhere(callback){
        var query = new Query(); //Create a new instance for nested scope.
        callback.call(query, query);
        if(query.__where){
            this.__where += "("+query.__where+')';
            this.__bindings = this.__bindings.concat(query.__bindings);
        }
        return this;
    }

    /**
     * Sets a where...between clause for the SQL statement.
     * 
     * @param  {String} field A field name in the table that currently 
     *                        binds to.
     * @param  {Array}  range An Array that carries only two elements which
     *                        represent the start point and the end point.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    whereBetween(field, range){
        return this.__handleBetween(field, range);
    }

    /**
     * Sets a where...not between clause for the SQL statement.
     * 
     * @param  {String} field A field name in the table that currently 
     *                        binds to.
     * @param  {Array}  range An Array that carries only two elements which
     *                        represent the start point and the end point.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    whereNotBetween(field, range){
        return this.__handleBetween(field, range, false);
    }

    /** Handle where...(not ) between clauses. */
    __handleBetween(field, range, between = true){
        if(this.__where) this.__where += ' and ';
        this.__where += this.__backquote(field)+(between ? '': ' not')
                     +  ' between ? and ?';
        this.__bindings = this.__bindings.concat(range);
        return this;
    }

    /**
     * Sets a where...in clause for the SQL statement.
     * 
     * @param  {String} field  A field name in the table that currently 
     *                         binds to.
     * @param  {Array}  values An Array that carries all possible values.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    whereIn(field, values){
        return this.__handleIn(field, values);
    }

    /**
     * Sets a where...not in clause for the SQL statement.
     * 
     * @param  {String} field  A field name in the table that currently 
     *                         binds to.
     * @param  {Array}  values An Array that carries all possible values.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    whereNotIn(field, values){
        return this.__handleIn(field, values, false)
    }

    /** Handle where...(not ) in clauses. */
    __handleIn(field, values, isIn = true){
        if(this.__where) this.__where += ' and ';
        var _values = Array(values.length).fill('?');
        this.__where += this.__backquote(field)+(isIn ? '': ' not')
                     +  ' in ('+_values.join(', ')+')';
        this.__bindings = this.__bindings.concat(values);
        return this;
    }

    /**
     * Sets a where...exists clause for the SQL statement.
     * 
     * @param  {Function} callback Pass a callback function to handle nested 
     *                             SQL statement, the only argument passed to 
     *                             the callback is a new Query instance, so
     *                             that you can use its features to generate 
     *                             a SQL statement.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    whereExists(callback){
        return this.__handleExists(callback);
    }

    /**
     * Sets a where...not exists clause for the SQL statement.
     * 
     * @param  {Function} callback Pass a callback function to handle nested 
     *                             SQL statement, the only argument passed to 
     *                             the callback is a new Query instance, so
     *                             that you can use its features to generate 
     *                             a SQL statement.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    whereNotExists(callback){
        return this.__handleExists(callback, false);
    }

    /** Handle where...(not) exists clauses. */
    __handleExists(callback, exists = true){
        if(this.__where) this.__where += ' and ';
        var query = new Query(); //子句实例
        callback.call(query, query);
        this.__where += (exists ? '' : 'not ')+'exists ('+query.sql+')';
        this.__bindings = this.__bindings.concat(query.__bindings);
        return this;
    }

    /**
     * Sets a where...is null clause for the SQL statement.
     * 
     * @param  {String} field  A field name in the table that currently 
     *                         binds to.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    whereNull(field){
        return this.__handleWhereNull(field);
    }

    /**
     * Sets a where...is not null clause for the SQL statement.
     * 
     * @param  {String} field  A field name in the table that currently 
     *                         binds to.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    whereNotNull(field){
        return this.__handleWhereNull(field, false);
    }

    /** Handle where...is (not) null clauses. */
    __handleWhereNull(field, isNull = true){
        if(this.__where) this.__where += ' and ';
        this.__where += this.__backquote(field)+' is '+(isNull ? '' : 'not ')+'null';
        return this;
    }

    /**
     * Sets a order by clause for the SQL statement.
     * 
     * @param  {String} field    A field name in the table that currently 
     *                           binds to.
     * @param  {String} sequence [optional] The way that records ordered, it
     *                           could be either `asc` or `desc`.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    orderBy(field, sequence = ""){
        var comma = this.__orderBy ? ', ' : '';
        this.__orderBy += comma+this.__backquote(field);
        if(sequence) this.__orderBy += ' '+sequence;
        return this;
    }

    /**
     * Sets that the records will be ordered in random sequence.
     * 
     * @return {Query} Returns the current instance for function chaining.
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
     * Sets a group by clause for the SQL statement.
     * 
     * @param  {Any} fields A list of all target fields, each one passed as an
     *                      argument. Or just pass the first argument as an
     *                      Array that carries all the field names.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    groupBy(...fields){
        if(fields[0] instanceof Array)
            fields = fields[0];
        fields = this.__backquoteFields(fields);
        this.__groupBy = fields.join(', ');
        return this;
    }

    /**
     * Sets a having clause for the SQL statement.
     * 
     * @param  {String} raw  A SQL clause to define comparing conditions.
     * @return {Query}  this 当前实例
     */
    having(raw){
        this.__having += (this.__having ? ' and ' : '')+raw;
    }

    /**
     * 设置 limit 子句
     * 
     * @param  {Number} offset 起始点位置，从 0 开始计算；如果未设置 length 参数，
     *                         则 offset 将会被当作 length，而 offset 则为 0；
     * @param  {Number} length [可选] 获取数据的最大个数
     * @return {Query}   this  当前实例
     */
    limit(offset, length = 0){
        this.__limit = length ? offset+', '+length : offset;
        return this;
    }

    /**
     * 设置 distinct 查询唯一值
     * 
     * @return {Query} this 当前实例
     */
    distinct(){
        this.__selects = 'distinct '+this.__selects;
        return this;
    }

    /**
     * 合并两个 SQL 语句
     * 
     * @param  {Any}     query 可以是一个 SQL 查询语句，也可以是一个 Query 对象;
     * @param  {Boolean} all   [可选] 是否使用 union all 来进行全合并从而允许重复
     *                         值，默认 false;
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
     * 
     * @param  {Object}  data 用 Object 对象表示字段和值的对应关系，也可以设置为一
     *                        个索引数组而不使用键值对，但要求数组的长度与数据表字
     *                        段个数相等。
     * @return {Promise}      返回 Promise，回调函数的参数是当前 Query 实例。
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
        this.trigger('insert', this); //触发事件回调函数
        return this.query(this.sql, bindings).then(db=>{
            this.bindings = Object.assign([], bindings);
            this.insertId = db.insertId;
            this.affectedRows = db.affectedRows;
            this.trigger('inserted', this);
            return this;
        });
    }

    /**
     * 更新已有的数据库记录
     * 
     * @param  {Object}  data 用 Object 对象表示字段和值的对应关系
     * @return {Promise}      返回 Promise，回调函数的参数是当前 Query 实例。
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
        this.trigger('update', this); //触发事件回调函数
        return this.query(this.sql, bindings).then(db=>{
            this.bindings = Object.assign([], bindings);
            this.affectedRows = db.affectedRows;
            this.trigger('updated', this);
            return this;
        });
    }

    /**
     * 删除数据库记录
     * 
     * @return {Promise} 返回 Promise，回调函数的参数是当前 Query 实例。
     */
    delete(){
        this.sql = 'delete from '+this.__table
                + (this.__where ? " where "+this.__where : "");
        this.trigger('delete', this); //触发事件回调函数
        return this.query(this.sql, this.__bindings).then(db=>{
            this.bindings = Object.assign([], this.__bindings);
            this.affectedRows = db.affectedRows;
            this.trigger('deleted', this);
            return this;
        });
    }

    /**
     * 获取一条符合条件的数据库记录
     * 
     * @return {Promise} 返回 Promise，回调函数的参数是获取的数据库记录。
     */
    get(){
        var promise = this.limit(1).__handleSelect().then(data=>data[0]);
        if(this.constructor.name == 'Query')
            this.trigger('get', this); //触发事件回调函数;
        return promise;
    }

    /**
     * 获取所有符合条件的数据库记录
     * 
     * @return {Promise} 返回 Promise，回调函数的参数是获取的数据库记录。
     */
    all(){
        var promise = this.__handleSelect();
        if(this.constructor.name == 'Query')
            this.trigger('get', this); //触发事件回调函数;
        return promise;
    }
    
    /**
     * 获取所有符合条件的数据库记录数量
     * 
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
     * 
     * @param  {Number}  page  [可选] 当前页码
     * @param  {Number}  limit [可选] 每一页的数据上限
     * @return {Promise}       返回 Promise，回调函数的参数是包含模型和相关信息的
     *                         Object 对象，其中包含传入的参数和下面这些属性：
     *                         - pages: 当前查询条件可以获取到的所有数据页码数
     *                         - total: 当前查询条件能够获取到的所有数组总数
     *                         - data:  保存着所有获取到的模型的属性，为一个数组
     */
    paginate(page = 1, limit = 10){
        var offset = (page - 1) * limit;
        var selects = this.__selects;
        //先获取记录总数
        return this.count().then(total=>{
            if(!total){ //如果没有记录，则直接返回结果
                return {
                    page,
                    pages: 0,
                    limit,
                    total,
                    data: [],
                }
            }else{ //有记录则继续获取记录
                this.__selects = selects;
                return this.limit(offset, limit).all().then(data=>{
                    return {
                        page,
                        pages: Math.ceil(total / limit),
                        limit,
                        total,
                        data,
                    };
                });
            }
        });
    }
}

module.exports = Query;