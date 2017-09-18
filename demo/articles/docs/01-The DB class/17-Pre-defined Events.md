### Pre-defined Events

At DB level, there is only one event `query`, every time calling 
[db.query()](#dbquery) to run a SQL statement, this event will be fired and 
all the handlers bound to it will be triggered.

You can either use [DB.on()](#dbon) or [db.on()](#dbon) to bind event 
listeners to this event, but be aware of the difference they act.

**A tip for `DB.on()`, `db.on()` and `db.trigger()`:**

If you're familiar with jQuery, `db.on()` and `db.trigger()` will be no 
problem for you to understand, they act almost exactly the same as the 
`jQuery#on()` and `jQuery#trigger()` do, means you can define and trigger 
your own events and handlers. Also you can set more than one handler to one 
event, you can even use `this` in the callback function as well, it points to 
the current instance.

What bothers you is `DB.on()`. Event and handlers defined by 
`DB.on()` (Query.on(), Model.on() and so on) will be inherited through the 
hierarchical tree of classes, all the subclasses will access them when calling
`db.trigger()` to the same event name. This means, if you bind a callback to 
the DB class, all the instance of DB or its subclasses will trigger this 
callback when the moment comes. 