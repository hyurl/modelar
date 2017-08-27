const Query = require('./supports/Query');

/**
 * Model Wrapper
 * 
 * This class extends from Query class, there for has all the features the 
 * Query has, and features that Query doesn't have, which makes data operation
 * more easier and efficient.
 */
class Model extends Query{
    /**
     *  Creates a new instance.
     * 
     * @param  {Object} data   [optional] Initial data of the model.
     * @param  {Object} config [optional] Initial configuration of the model,
     *                         they could be:
     *                         * `table` The table name that the instance 
     *                         	 binds to.
     *                         * `fields` Fields of the table in an Array.
     *                         * `primary` The primary key of the table.
     *                         * `searchable` An Array that carries all 
     *                            searchable fields, they could be used when 
     *                            calling `Model.getMany()`.
     * @return {Model}
     */
    constructor(data = {}, config = {}){
        super(config.table); //Bind the table name.
        this.__fields = config.fields || []; //Fields of the table.
        this.__primary = config.primary || ''; //The primary key.
        this.__searchable = config.searchable || [], //Searchable fields.

        //Event handlers.
        this.__events = Object.assign({
            query: [],    //This event will be fired when a SQL statement has 
                          //been successfully executed.
            save: [],     //This event will be fired when a model is about to 
                          //be saved.
            saved: [],    //This event will be fired when a model is 
                          //successfully saved.
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

        //This property carries the data of the model.
        this.__data = {};

        //Define setters and getters of pseudo-properties for the model, only 
        //if they are not defined.
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
                        if('${field}' != this.__primary)
                            this.__data['${field}'] = v
                    },
                })`);
            }
        }

        //Assign data to the the instance.
        this.assign(data, true);
        delete this.__data[this.__primary]; //Filter primary key.
    }

    /**
     * Assigns data to the model instance.
     * 
     * @param  {Object}  data      The data in a Object needs to be assigned.
     * @param  {Boolean} useSetter [optional] Use setter to process the data, 
     *                             default is `false`.
     * 
     * @return {Model} Returns the current instance for function chaining.
     */
    assign(data, useSetter = false){
        if(this.__data instanceof Array){
            //__data extends from DB class, so it could be an Array.
            this.__data = {};
        }
        for(var key in data){
            if(this.__fields.includes(key)){
                //Only accept those fields that `__fields` sets.
                if(useSetter){
                    var set = this.__lookupSetter__(key);
                    if(set instanceof Function && set.name.includes(' ')){
                        set.call(this, data[key]); //Calling setter
                        continue;
                    }
                }
                this.__data[key] = data[key];
            }
        }
        return this;
    }
    
    /**
     * Saves the current model, if there is not record in the database, then 
     * it will be automatically inserted.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is the current instance.
     */
    save(){
        this.trigger('save', this); //触发保存事件
        var promise = this.__data[this.__primary] ? this.update() : this.insert();
        return promise.then(model=>{
            return this.trigger('saved', model);
        });
    }

    /*************** Rewritten methods from Query ********************/

    /**
     * Inserts the current model as a new record into the database.
     * 
     * @param  {Any} data An Object that carries fields and their values, or 
     *                    pass all values in an Array the fulfil all the 
     *                    fields.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is the current instance.
     */
    insert(data = {}){
        this.assign(data, true);
        return super.insert(this.__data).then(model=>{
            model.where(model.__primary, model.insertId);
            return model.get(); //Get real data from database.
        });
    }

    /**
     * Updates the current model.
     * 
     * @param  {Object}  data An Object that carries fields and their values.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is the current instance.
     */
    update(data = {}){
        this.__where = "";
        this.__limit = "";
        this.__bindings = [];
        this.bindings = [];
        this.where(this.__primary, this.__data[this.__primary]);
        this.assign(data, true);
        return super.update(this.__data).then(model=>{
            return model.get(); //Get real data from database.
        });
    }

    /**
     * Deletes the current model.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is the current instance.
     */
    delete(){
        this.__where = "";
        this.__bindings = [];
        this.bindings = [];
        this.where(this.__primary, this.__data[this.__primary]);
        return super.delete();
    }

    /**
     * Gets a model from the database.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is the fetched data.
     */
    get(){
        return super.get().then(data=>this.assign(data).trigger('get', this));
    }

    /**
     * Gets all models from the database.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is all the fetched data 
     *                   carried in an Array.
     */
    all(){
        return super.all().then(data=>{
            var models = [];
            for(var i in data){
                var model = new this.constructor();
                model.__connection = this.__connection; //quote the connection
                //Assign data and trigger event handlers for every model.
                model.assign(data[i]).trigger('get', model);
                models.push(model);
            }
            return models;
        });
    }

    /**
     * Gets multiple models that suit the given condition, unlike 
     * `Model.all()`, this method accepts other arguments in a simpler way to 
     * generate sophisticated SQL statement and fetch data with paginated 
     * information.
     * 
     * @param  {Object}  args [optional] An Object carries key-value pairs 
     *                        information for fields, and it also accepts 
     *                        these properties:
     *                        * `page` The current page, default is `1`.
     *                        * `limit` The top limit of per page, default is 
     *                           `10`.
     *                        * `orderBy` Ordered by a particular field, 
     *                          default is the primary key.
     *                        * `sequence` The sequence of how the data are 
     *                          ordered, it could be `asc`, `desc` or `rand`, 
     *                          default is `asc`.
     *                        * `keywords` Keywords for vague searching, it 
     *                          could be a string or an Array.
     * 
     * @return {Promise} Returns a promise, and the only argument passes to 
     *                   the callback of `then()` is an Object that carries 
     *                   some information of these:
     *                   * `page` The current page.
     *                   * `limit` The top limit of per page.
     *                   * `orderBy` Ordered by a particular field.
     *                   * `sequence` Sequence of how the data are ordered.
     *                   * `keywords` Keywords for vague searching.
     *                   * `pages` A number of all model pages.
     *                   * `total` A number of all model counts.
     *                   * `data` An Array that carries all fetched models.
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
        
        //Set basic query conditions.
        var offset = (args.page - 1) * args.limit;
        this.limit(offset, args.limit);
        if(args.sequence !== 'asc' && args.sequence != 'desc')
            this.random(); //随机排序
        else
            this.orderBy(args.orderBy, args.sequence);

        //Set where clause for fields.
        for(var field of this.__fields){
            if(args[field] && defaults[field] === undefined){
                var operator = "=",
                    value = args[field],
                    match = value.match(/^(<>|!=|<|>|=)\w+/);
                if(match){ //Handle values which start with an operator.
                    operator = match[1];
                    value = value.substring(operator.length);
                }
                this.where(field, operator, value);
            }
        }

        //Set where clause by using keywords in a vague searching senario.
        if(args.keywords && this.__searchable){
            var keywords = args.keywords;
            if(typeof keywords == 'string') keywords = [keywords];
            for(var i in keywords){
                //Escape special characters.
                keywords[i] = keywords[i].replace('%', '\%').replace("\\", "\\\\");
            }
            //Construct nested conditions.
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

        //Get paginated information.
        return this.paginate(args.page, args.limit).then(info=>{
            return Object.assign(args, info);
        });
    }

    /***************************** Static Wrappers ****************************/

    /**
     * Sets the fields that need to be fetched.
     * 
     * @param  {Any} fields A list of all target fields, each one passed as an
     *                      argument. Or just pass the first argument as an 
     *                      Array that carries all the field names.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    static select(...fields){
        return (new this()).select(fields);
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
    static join(table, field1, operator, field2){
        return (new this()).join(table, field1, operator, field2);
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
    static leftJoin(table, field1, operator, field2){
        return (new this()).leftJoin(table, field1, operator, field2);
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
    static rightJoin(table, field1, operator, field2){
        return (new this()).rightJoin(table, field1, operator, field2);
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
    static fullJoin(table, field1, operator, field2){
        return (new this()).fullJoin(table, field1, operator, field2);
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
    static crossJoin(table, field1, operator, field2){
        return (new this()).crossJoin(table, field1, operator, field2);
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
    static where(field, operator, value){
        return (new this()).where(field, operator, value);
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
    static whereBetween(field, range){
        return (new this()).whereBetween(field, range);
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
    static whereNotBetween(field, range){
        return (new this()).whereNotBetween(field, range);
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
    static whereIn(field, values){
        return (new this()).whereIn(field, values);
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
    static whereNotIn(field, values){
        return (new this()).whereNotIn(field, values);
    }

    /**
     * Sets a where...is null clause for the SQL statement.
     * 
     * @param  {String} field  A field name in the table that currently 
     *                         binds to.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    static whereNull(field){
        return (new this()).whereNull(field);
    }

    /**
     * Sets a where...is not null clause for the SQL statement.
     * 
     * @param  {String} field  A field name in the table that currently 
     *                         binds to.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    static whereNotNull(field){
        return (new this()).whereNotNull(field);
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
    static whereExists(callback){
        return (new this()).whereExists(callback);
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
    static whereNotExists(callback){
        return (new this()).whereNotExists(callback);
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
    static orderBy(field, sequence = ""){
        return (new this()).orderBy(field, sequence);
    }

    /**
     * Sets that the records will be ordered in random sequence.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    static random(){
        return (new this()).random();
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
    static groupBy(...fields){
        return (new this()).groupBy(fields);
    }

    /**
     * Sets a having clause for the SQL statement.
     * 
     * @param  {String} raw  A SQL clause to define comparing conditions.
     * @return {Query}  this 当前实例
     */
    static having(raw){
        return (new this()).having(raw);
    }

    /**
     * Sets a limit clause for the SQL statement.
     * 
     * @param  {Number} offset The start point, count from `0`. If `length` is
     *                         not passed, then this argument will replace it,
     *                         and the offset will become 0.
     * @param  {Number} length [optional] The top limit of how many counts 
     *                         that this query will fetch.
     * 
     * @return {Query} Returns the current instance for function chaining.
     */
    static limit(offset, length = 0){
        return (new this()).limit(offset, length);
    }

    /**
     * Gets all models from the database.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is all the fetched data 
     *                   carried in an Array.
     */
    static all(){
        return (new this()).all();
    }

    /**
     * Gets all counts of records.
     * 
     * @param {String} field [optional] Count a specified field.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is a Number that counts
     *                   records.
     */
    static count(field = "*"){
        return (new this()).count(field);
    }

    /**
     * Gets the maximum value of a specified field in the table.
     * 
     * @param {String} field The specified field.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is the maximum value 
     *                   fetched.
     */
    static max(field){
        return (new this()).max(field);
    }

    /**
     * Gets the minimum value of a specified field in the table.
     * 
     * @param {String} field The specified field.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is the minimum value 
     *                   fetched.
     */
    static min(field){
        return (new this()).min(field);
    }

    /**
     * Gets the average value of a specified field in the table.
     * 
     * @param {String} field The specified field.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is the average value 
     *                   fetched.
     */
    static avg(field){
        return (new this()).avg(field);
    }

    /**
     * Gets the summarized value of a specified field in the table.
     * 
     * @param {String} field The specified field.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is the summarized value 
     *                   fetched.
     */
    static sum(field){
        return (new this()).sum(field);
    }

    /**
     * Processes chunked data with a specified length.
     * 
     * @param {Number}   length   The top limit of how many records that each 
     *                            chunk will carry.
     * @param {Function} callback A function for processing every chunked 
     *                            data, the only argument passed to it is the 
     *                            data that current chunk carries.
     * 
     * @return {Promise} Returns a Promise, and the only argument passed to
     *                   the callback of then() is the last chunk of data. If
     *                   the callback returns `false`, then stop chunking.
     */
    static chunk(length, callback){
        return (new this()).chunk(length, callback);
    }

    /**
     * Gets paginated information of all models that suit the given 
     * conditions.
     * 
     * @param  {Number}  page  [optional] The current page, default is `1`.
     * @param  {Number}  limit [optional] The top limit of per page, default 
     *                         is `10`.
     * 
     * @return {Promise} Returns a Promise, the only argument passes to the 
     *                   callback of `then()` is an Object that carries the 
     *                   information, it includes:
     *                   * `page` The current page.
     *                   * `limit` The top limit of per page.
     *                   * `pages` Represents all pages.
     *                   * `total` Represents all counts of data.
     *                   * `data`  Carries all fetched data in an Array.
     */
    static paginate(page = 1, limit = 10){
        return (new this()).paginate(page, limit);
    }

    /**
     * Gets multiple models that suit the given condition, unlike 
     * `Model.all()`, this method accepts other arguments in a simpler way to 
     * generate sophisticated SQL statement and fetch data with paginated 
     * information.
     * 
     * @param  {Object}  args [optional] An Object carries key-value pairs 
     *                        information for fields, and it also accepts 
     *                        these properties:
     *                        * `page` The current page, default is `1`.
     *                        * `limit` The top limit of per page, default is 
     *                           `10`.
     *                        * `orderBy` Ordered by a particular field, 
     *                          default is the primary key.
     *                        * `sequence` The sequence of how the data are 
     *                          ordered, it could be `asc`, `desc` or `rand`, 
     *                          default is `asc`.
     *                        * `keywords` Keywords for vague searching, it 
     *                          could be a string or an Array.
     * 
     * @return {Promise} Returns a promise, and the only argument passes to 
     *                   the callback of `then()` is an Object that carries 
     *                   some information of these:
     *                   * `page` The current page.
     *                   * `limit` The top limit of per page.
     *                   * `orderBy` Ordered by a particular field.
     *                   * `sequence` Sequence of how the data are ordered.
     *                   * `keywords` Keywords for vague searching.
     *                   * `pages` A number of all model pages.
     *                   * `total` A number of all model counts.
     *                   * `data` An Array that carries all fetched models.
     */
    static getMany(args = {}){
        return (new this()).getMany(args);
    }

    /**
     * Inserts a new model in to the database.
     * 
     * @param  {Object} data An Object that carries fields and their values.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is the current instance.
     */
    static insert(data){
        return (new this(data)).insert();
    }

    /**
     * Updates an existing model.
     * 
     * @param  {Object}  data An Object that carries fields and their values,
     *                        unlike the instance version, this argument must 
     *                        carry the primary key.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is the current instance.
     */
    static update(data){
        var model = new this();
        if(!data[model.__primary]){
            //If the primary key is missing, then throw an error.
            return new Promise(()=>{
                throw new Error(model.constructor.name
                    +'.update() expects the primary key `'
                    +model.__primary+'`, which is missing.');
            });
        }
        return this.get(data[model.__primary]).then(model=>{
            return model.update(data);
        });
    }

    /**
     * Deletes an existing model.
     * 
     * @param {Any} data An Object that carries the primary key and its value,
     *                   or just pass a Number, it will be treated as the 
     *                   primary key.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is the current instance.
     */
    static delete(args){
        var model = new this();
        if(typeof args == 'number'){
            //If a Number is passed, treat as the primary key.
            var id = args;
            args = {};
            args[model.__primary] = id;
        }
        if(!args[model.__primary]){
            //If the primary key is missing, then throw an error.
            return new Promise(()=>{
                throw new Error(model.constructor.name
                    +'.delete() expects the primary key `'
                    +model.__primary+'`, which is missing.');
            });
        }
        return this.get(args[model.__primary]).then((model)=>{
            return model.delete();
        });
    }

    /**
     * Gets a model from the database.
     * 
     * @param  {Any}  data An Object that carries fields and their values, or 
     *                     just pass a Number, it will be treated as the
     *                     primary key.
     * 
     * @return {Promise} Returns a Promise, and the the only argument passed 
     *                   to the callback of `then()` is the fetched data.
     */
    static get(args){
        var model = new this();
        if(typeof args == 'number'){
            //If a Number is passed, treat as the primary key.
            var id = args;
            args = {};
            args[model.__primary] = id;
        }else{
            //Use Model.assign() to filter illegal properties.
            args = Object.assign({}, model.assign(args, true).__data);
        }

        if(Object.keys(args).length){
            return model.where(args).get().then(model=>{
                if(Object.keys(model.__data).length === 0){
                    //If no model is retrieved, throw an error.
                    throw new Error(model.constructor.name
                        +' was not found by searching the given arguments.');
                }else{
                    return model;
                }
            });
        }else{
            //If no legal property has passed, then throw an error.
            return new Promise(()=>{
                throw new Error(model.constructor.name
                    +'.get() requires at least one element of model fields, '
                    +'but none given.');
            });
        }
    }

    /**************************** Associations *****************************/

    /**
     * Defines a has (many) association.
     * 
     * @param  {Model}  Model      The associated model class.
     * @param  {String} foreignKey A foreign key in the associated model.
     * 
     * @return {Model} Returns the associated model instance so you can use 
     *                 its features to handle data.
     */
    has(Model, foreignKey){
        return Model.where(foreignKey, this.__data[this.__primary]);
    }

    /**
     * Defines a belongs-to association.
     * 
     * @param  {Model}  Model      The associated model class.
     * @param  {String} foreignKey A foreign key in the current model.
     * 
     * @return {Model} Returns the associated model instance so you can use 
     *                 its features to handle data.
     */
    belongsTo(Model, foreignKey){
        model = new Model();
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
    // belongsToMany(model, middleTable, foreignKey1, foreignKey2){
    //     var query = (new Query(middleTable)); //获取一个 Query 实例
    //     //获取中间表数据
    //     return query.where(foreignKey1, this.__data[this.__primary]).all().then(data=>{
    //         this.pivots = data; //为当前模型添加 pivots 属性
    //         var ids = [];
    //         for(var i in data){
    //             ids.push(data[i][foreignKey2]); //获取所有关联模型的 ID
    //         }

    //         //获取关联模型数据
    //         model = typeof model == 'string' ? (new require('./'+model)) : new model();
    //         return model.whereIn(model.__primary, ids).all().then(models=>{
    //             var primary = models[0]._primary;
    //             for(var i in models){
    //                 for(var pivot of data){
    //                     if(pivot[foreignKey2] == models[i][primary]){
    //                         models[i].pivot = pivot; //为关联模型添加 pivot 属性
    //                         break;
    //                     }
    //                 }
    //             }
    //             return models;
    //         });
    //     });
    // }

    /**
     * Gets the data string in a JSON that the model holds.
     * 
     * @return {String} A JSON string that represents the model data.
     */
    toString(){
        return JSON.stringify(this.__getProcessedData());
    }

    /**
     * Gets the data that the model represents.
     * 
     * @return {Object} The model data in an Object.
     */
    valueOf(){
        return this.__getProcessedData();
    }

    /**
     * Implement Iterator
     */
    [Symbol.iterator](){
        var data = this.__getProcessedData(),
            keys = Object.keys(data),
            length = keys.length,
            index = -1;
        return {
            next: ()=>{
                index++;
                if(index < length){
                    return {
                        value: [keys[index], data[keys[index]]],
                        done: false,
                    };
                }else{
                    return {value: undefined, done: true};
                }
            }
        }
    }

    /** Gets the data that has been processed by getters. */
    __getProcessedData(){
        var data = {};
        for(var key in this.__data){
            var get = this.__lookupGetter__(key);
            if(get instanceof Function && get.name.includes(' ')){
                var value = get.call(this, this.__data[key]); //Calling getter
                //Set this property only if getter returns an non-undefined
                //value.
                if(value !== undefined)
                    data[key] = value;
            }else{
                data[key] = this.__data[key];
            }
        }
        return data;
    }
}

Model.auth = null; //This property store the current logged-in user.

module.exports = Model;