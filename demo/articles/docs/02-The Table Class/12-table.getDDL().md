### table.getDDL()

*Gets the DDL statement by the definitions.*

**return:**

Returns the DDL statement.

This method is used to generate and get the DDL statement, but don't create 
the table. If you called [table.save()](#tablesave) to create the table, the 
DDL will be automatically stored in the `table.sql` property.