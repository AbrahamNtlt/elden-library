### GraphQL 中的基础概念



##### 字段（Fields）

​	指请求对象上特定的字段，类似于 JS 中的变量、Object 中的 key 。用于指代特定的标识符。

```
{
  hero {
    name
  }
}
```

​	其中 hero 和 name 都是字段。



##### Schema

​	客户端请求与服务端通信的协议部分。Schema 是 GraphQL 开发的核心，项目通过 Schema 实现前后端数据交互、类型定义等。

​	随着 GraphQL 社区的发展壮大，多数主流开发语言已有相应的功能包完成 Schema 的解析，开发者只编写定义部分即可。如下例:

```js
const { buildSchema } = require("graphql");
const schema = buildSchema(`
  type Query{
    hello:String
  }
`);
```



##### Root

​	GraphQL 查询的入口，也是树状数据的根节点。

```js
const root = {
  hello() {
    return "hello world";
  }
};
```



##### 解析器（Resolver）

​	如果把 Root 当成一个上下文看，resolver 就是该上下文下对应的响应函数。resolver 的实现根据具体的开发语言和框架共同决定。在 JS 中，resolvers 就是一个 Object 对象（或封装好的 Class 实例）

```
/** schema **/ 
type Query{
	hello:String
}
```

```js
/** resolver **/ 
Query: {
	hello() {
    return "hello world";
  }
}
```

------

#### 数据类型

##### 一. 标量类型（Scalar Types）

标量类型是 GraphQL 叶子节点对应字段的数据类型，这些字段没有任何的次级字段。类似于 JS 的基础数据类型。

GraphQL 自带一组默认标量类型：

- `Int`：有符号 32 位整数。
- `Float`：有符号双精度浮点值。
- `String`：UTF‐8 字符序列。
- `Boolean`：`true` 或者 `false`。
- `ID`：ID 标量类型表示一个唯一标识符，通常用以重新获取对象或者作为缓存中的键。ID 类型使用和 String 一样的方式序列化；然而将其定义为 ID 意味着并不需要人类可读型。

大部分的 GraphQL 服务实现中，都有自定义标量类型的方式。例如，我们可以定义一个 `Date` 类型：

> scalar Date



二. 对象类型（Object Types）

​	类似于 JS 的引用数据类型。数据中包含着标量类型或其他对象类型。

```
type Character {
  name: String!
  appearsIn: [Episode!]!
}
```



三. 枚举类型（Enumeration Types）

​	枚举类型是一种特殊的标量，它限制在一个特殊的可选值集合内。对象类型、标量以及枚举是 GraphQL 中你唯一可以定义的类型种类。

```
enum Episode {
  NEWHOPE
  EMPIRE
  JEDI
}
```

------

#### 类型修饰符

##### 一. 非空（Non-Null）

​	在类型名后面添加一个感叹号`!`将其标注为非空。非空类型修饰符也可以用于定义字段上的参数，如果这个参数上传递了一个空值（不管通过 GraphQL 字符串还是变量），那么会导致服务器返回一个验证错误。

> name: String!



##### 二. 列表（Lists）

​	将类型包在方括号（`[` 和 `]`）中的方式来标记列表。列表对于参数也是一样的运作方式，验证的步骤会要求对应值为数组。

> myField: [String!]

​	非空和列表修饰符可以组合使用。例如你可以要求一个非空字符串的数组：

> myField: null // 有效 
>
> myField: [ ] // 有效
>
> myField: ['a', 'b'] // 有效 
>
> myField: ['a', null, 'b'] // 错误	
