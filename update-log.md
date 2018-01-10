**This update log starts from the version 1.0.2 of Modelar.**

## 2.0.1

(2018-01-10 22:03 UTC+0800)

1. Fix a bug.
2. Add TypeScript declarations.

## 2.0.0 (**Important**)

(2017-11-30 12:00 UTC+0800)

1. All classes extends from EventEmitter.
2. Properties like `__data`, `__events` are all changed to the style of 
    `_data`, `_events`.
3. Uses adapters to support more databases, currently supports `MySQL/MariaDB`,
    `Postgres`, `MSSQL`, `OracleDB`, `DB2`, `SQLite`.
4. More features added and efficiency improved.

## 1.1.0

(2017-11-30 12:40 UTC+0800)

1. Fix some bugs.

## 1.0.9

(2017-10-18 23:44 UTC+0800)

1. Update query.increase() and query.decrease(), set default to 1.

## 1.0.8

(2017-10-8 23:32 UTC+0800)

1. Fix some bugs.

## 1.0.7

(2017-10-8 16:12 UTC+0800)

1. Change the property `db.__spec` to `db.__dsn`, method `db.__getSpec()` to 
    `db.__getDSN()`.
2. New configuration option `max` for setting maximum count of connections in 
    the database pool.
3. More efficient when retrieving connections from the pool.
4. More efficient when updating a model.

## 1.0.6

(2017-9-27 13:24 UTC+0800)

1. Fix a BUG in class User.

## 1.0.5

(2017-9-24 1:00 UTC+0800)

1. Add two methods to the class Query/Model to increase and decrease data:
    - `query.increase()`
    - `query.decrease()`

## 1.0.4

(2017-9-24 10:27 UTC+0800)

1. Fix the structure of the database specification and pool.

## 1.0.2 

(2017-9-20 20:10 UTC+0800)

1. Add a new method `model.whereState()` to set an extra where... clause for 
    the SQL statement when updating or deleting the model.
2. More readable type hints of methods.