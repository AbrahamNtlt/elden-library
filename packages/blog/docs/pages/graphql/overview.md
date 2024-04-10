
#### 一种用于 API 的查询语言

> GraphQL 既是一种用于 API 的查询语言也是一个满足你数据查询的运行时。 GraphQL 对你的 API 中的数据提供了一套易于理解的完整描述，使得客户端能够准确地获得它需要的数据，而且没有任何冗余，也让 API 更容易地随着时间推移而演进，还能用于构建强大的开发者工具。
>

​	GraphQL 是一种针对 Graph（图状数据）进行查询特别有优势的 Query Language（查询语言），所以叫做 GraphQL。

​	但和SQL却完全不同。它们适用于完全不同的环境。我们将SQL查询语句发到数据库，而GraphQL查询语句则发到API。SQL数据存储在数据表中。GraphQL只负责通信的协议规范而不负责具体数据的存取。GraphQL服务与传输方式没有关系，但通常基于HTTP协议。

​	它是一种描述客户端如何向服务端请求数据的`API`语法，类似于 RESTful API规范。

​	GraphQL API可以直接访问数据存储，但在大多数情况下，GraphQL API是一个数据聚合器和一个可以提升开发速度、减少维护工作的抽象层。

------

#### 搭建服务

​	GraphQL是客户端和服务器之间通信的规范。要实现GraphQL就必须同时实现服务端和客户端。本文将以 nodejs + koa2 + graphql.js 作为服务端，在正式介绍客户端使用之前，暂用graphiql的GUI面板作为客户端。

> 必要的软件环境：
>
> nodejs
>
> npm或cnpm或yarn

```js
const Koa = require("koa");
const graphqlHTTP = require("koa-graphql");
const { buildSchema } = require("graphql");

const schema = buildSchema(`
  type Query{
    hello:String
  }
`);
const root = {
  hello() {
    return "hello world";
  }
};

const app = new Koa();

app.use(graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true,
}));

app.listen(3000);
```

```apl
http://localhost:3000/?query=query%7B%0A%20%20hello%0A%7D
```

#### 定量获取

将协议与字段值改为以下内容

```js
const schema = buildSchema(`
  type Query{
    empno: Int
    ename:String
    job:String
    mgr:Int
    hiredate:String
    sal:Int
    comm:String
    deptno:Int
  }
`)
const root = {
  empno: () => 7369,
  ename: () => 'SMITH',
  job: () => 'CLERK',
  mgr: () => 7902,
  hiredate: () => '17-12-1980',
  sal: () => 800,
  comm: () => '',
  deptno: () => 20
}
```

> 客户端操作取三个字段时

```
/** client **/
query{
	ename
  job
  hiredate
}
```

```js
/** response **/
{
  "data": {
    "ename": "SMITH",
    "job": "CLERK",
    "hiredate": "17-12-1980"
  }
}
```

> 客户端操作取五个字段时

```
/** client **/
query{
	ename
  sal
  deptno
  mgr
  empno
}
```

```js
/** response **/
{
  "data": {
    "ename": "SMITH",
    "sal": 800,
    "deptno": 20,
    "mgr": 7902,
    "empno": 7369
  }
}
```

​	上述案例可见，请求响应的字段一一对应着客户端发出请求时所带的信息。

​	在大型项目中，不同业务场景下对同一个数据模型所需关键字段往往不是一致的。而在REST API接口中，返回值通常是全量的。GraphQL定制返回值的特性能有效的减少网络带宽，减小不必要的通信消耗。

------

#### 单一入口

将协议与字段值改为以下内容

```js
const schema = buildSchema(`
  type Emp{
    empno:Int
    ename:String
    job:String
    mgr:Int
    hiredate:String
    sal:Int
    comm:String
    deptno:Int
  }
  type Dept{
    deptno: Int
    dname: String
    loc: String
  }
  type Query{
    emp:Emp
    dept:Dept
  }
`)
const root = {
  emp: () => {
    return {
      empno: 7369,
      ename: 'SMITH',
      job: 'CLERK',
      mgr: 7902,
      hiredate: '17-12-1980',
      sal: 800,
      comm: '',
      deptno: 20,
    }
  },
  dept: () => {
    return {
      deptno: 10,
      dname: 'ACCOUNTING',
      loc: 'NEW YORK',
    }
  },
}
```

```
/** client **/
query{
	dept{
  	dname
  }
  emp{
    ename
    empno
  }
}

```

```js
/** response **/
{
  "data": {
    "dept": {
      "dname": "ACCOUNTING"
    },
    "emp": {
      "ename": "SMITH",
      "empno": 7369
    }
  }
}
```

​	GraphQL 将同一上下文的数据聚合在一个端点入口中，通过不同的请求体去传达所需数据的相关信息。而在 REST 中，API 接口是根据不同 URL 地址来区分功能的。当项目越大，REST API 所需管理的 URL 就越多，维护迭代成本不断加大。

​	从前端的角度看，当某一页面需要同时取多个数据时，REST API 的做法即是发起对应个数的请求，然后再对请求的响应分别处理。甚至常有需要先获取到 A 请求的响应数据后再将其返回数据作为 B 请求的参数进行二次请求。多次请求带来的网络消耗一直都是前端性能优化的重要突破点。GraphQL 单入口的特性即能在低成本迭代的情况下实现一个请求获取多个数据。

------

#### 类型自查

将协议与字段值改为以下内容

```js
const schema = buildSchema(`
  type Query{
    hello: Int
  }
`)
const root = {
  hello: () => 'hello world'
}
```

```
/** client **/
query{
	hello
}
```

```js
/** response **/
{
  "errors": [
    {
      "message": "Int cannot represent non-integer value: \"hello world\"",
      "locations": [
        {
          "line": 2,
          "column": 2
        }
      ],
      "path": [
        "hello"
      ]
    }
  ],
  "data": {
    "hello": null
  }
}
```

​	如上，GraphQL 存在数据类型系统，对响应数据进行了保护。当响应数据类型与预定义不相同时，并不是返回异常响应状态，而是新增了 `errors` 数据来描述此错误。如此即保证了数据的准确性，也缓冲了响应数据异常可能带来的主程序崩溃问题。

------

#### 综述

​	GraphQL 有着以下优点:

		1. 提高开发速度。GraphQL可以减少发出的请求数，以单个调用来获取所需数据比使用多个请求要容易得多，不仅减少了延迟，还能够降低服务器的压力，加快前端的渲染速度。此外，GraphQL具有自文档的特点，所以可以省去查找文档了解如何使用API的时间。
		2. 将复杂的API进行简化和标准化。GraphQL使工程师可以按照需求自由组合和嵌套对象。对于每个对象都能够获得所需的数据，不多也不少。

		3. 提升安全性。GraphQL需要进行schema验证，而且是强类型的，因为这是它规范的一部分。同时静态验证也提升了工程师在重构时的信心。此外，GraphQL为客户端提供了控制，它可以频繁更新，而不会因为引入了新类型造成重大变更。另外，因为引入了schema，所以GraphQL是一种无版本的API。

​	当下大型 WEB应用多以前后端分离的模式为主。GraphQL 的特性使它非常合适当作为一个 BFF（Back-end For Front-end） 层。

​	GraphQL 与 REST 是两种不同的设计理念 ，两者并没有优劣之分。只在特定的场景下，各自的优缺点将明显的浮现出来。未来的接口设计形式也将趋向两者共存的形态去发展。
