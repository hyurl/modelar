## Decorators in TypeScript

Modelar 3.x 是使用 TypeScript 编写的，因此你可以在使用它时获得**装饰器**带来的好处。

在 Modelar 中的大多数装饰器都是设计来使模型类的和数据表模式的定义更加方便，它们包括：

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
    @field // 只有主键可以不需要定义 type 和 length。
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

上面展示的所有的函数使用起来都和 `Table` 类的方法是一样的，如果你想了解更过的细节，
可以前往查看。