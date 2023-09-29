## Decorators in TypeScript

Modelar 3.x is written in TypeScript, so you can use it with the benefit of 
**decorators**.

Most decorators in Modelar are designed for defining model class and table 
schema in a more easier way, whey are:

- `@field`
- `@field(type: string, length?: number | [number, number])`
- `@primary`
- `@searchable`
- `@autoIncrement`
- `@autoIncrement(start: number, step?: number)`
- `@unique`
- `@defaultValue(value: string | number | boolean | void | Date)`
- `@notNull`
- `@unsigned`
- `@comment(text: string)`
- `@foreignKey(config: ForeignKeyConfig)`
- `@foreignKey(table: string, field: string, onDelete?: string, onUpdate?: string)`

```typescript
import { Model, field, primary, searchable, autoIncrement } from "modelar";

export class Article extends Model {
    @field // Only the primary key doesn't need to specify the type and length.
    @primary
    @autoIncrement
    id: number

    @field("varchar", 100)
    @searchable
    title: string

    @field("text")
    content: string

    // ...
}
```

All functions shown above are the same as the methods in `class Table`, if you
want more details, go have a look.