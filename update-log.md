**This update log starts from the version 1.0.2 of Modelar.**

## 1.0.6

(2017-9-27 13:24)

1. Fix a BUG in class User.

## 1.0.5

(2017-9-24 1:00)

1. Add two methods to the class Query/Model to increase and decrease data:
    - `query.increase()`
    - `query.decrease()`

## 1.0.4

(2017-9-24 10:27)

1. Fix the structure of the database specification and pool.

## 1.0.2 

(2017-9-20 20:10)

1. Add a new method `model.whereState()` to set an extra where... clause for 
    the SQL statement when updating or deleting the model.
2. More readable type hints of methods.