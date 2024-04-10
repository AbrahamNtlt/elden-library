### GraphQL 的客户端

​	GraphQL 通常使用 HTTP 实现，以下所指客户端均指 HTTP 请求的客户端。

​	GraphQL 通过请求上的 query 实现数据交互。可以使用 GET 请求，但由于 GET 的query 在 url 连接上，数据拼接和特殊符号转义相当繁琐，基本上使用 POST 请求，将信息附着在 requestbody 上。

```http
/** client - shell **/
curl -X POST \
-H "Content-Type: application/json" \
-d '{"query": "{ hello }"}' \
http://localhost:3000/
```

```js
/** response **/ 
{"data":{"hello":"hello world"}}%
```

> 使用 GET 请求

```http
/** client - shell **/
curl http://localhost:3000/\?query\=query%20%7B%0A%20%20hello%0A%7D%0A
```

```js
/** response **/ 
{"data":{"hello":"hello world"}}%
```



#### 前端请求 GraphQL

​	以 fetch 为例，请求前文中的创建新部门功能:

```js
/** front-end **/
const schema = {
  query: `mutation ($dept:deptInput){
    increaseDept(dept: $dept){
      deptno
      dname
      loc
    }
  }`,
  variables: {
    "dept": {
      "dname": "public relations",
      "loc": "Boston"
    }
  }
}
fetch('http://localhost:3000', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify(schema)
}).then(r => r.json())
  .then(data => console.log(data))
```

```js
/** Console **/
{
  "data": {
    "increaseDept": {
      "deptno": "69zQ5rUVUdocprwasc5Ao",
      "dname": "public relations",
      "loc": "Boston"
    }
  }
}
```



##### 操作名称（Operation name）

​	这之前，我们都使用了简写句法，省略了 `query` 关键字和查询名称，但是生产中使用这些可以使我们代码减少歧义。

```
query getAllDeptData {
  getAllDepts {
    deptno
    dname
    loc
  }
}
```



##### 别名（Aliases）

​	当一起请求需要两个相同字段的数据，这时就需要利用别名另其响应返回中有所区分。

```
query {
  dept1:	getDeptByDeptno(deptno : "20") {
    dname
  }
  dept2:	getDeptByDeptno(deptno : "30") {
    dname
  }
}
```

```js
/** response **/ 
{
  "data": {
    "dept1": {
      "dname": "RESEARCH"
    },
    "dept2": {
      "dname": "SALES"
    }
  }
}
```



##### 片段（Fragments）

​	片段是包含字段的课重复利用单元。

```
query {
  dept1:	getDeptByDeptno(deptno : "20") {
    ...comparisonFields
  }
  dept2:	getDeptByDeptno(deptno : "30") {
    ...comparisonFields
  }
}
fragment comparisonFields on Dept {
  dname
  loc
}
```



##### 指令（Directives）

​	GraphQL 允许通过变量动态构建查询。

​	GraphQL 的核心规范包含两个指令，其必须被任何规范兼容的 GraphQL 服务器实现所支持：

- `@include(if: Boolean)` 仅在参数为 `true` 时，包含此字段。
- `@skip(if: Boolean)` 如果参数为 `true`，跳过此字段。

```
/** client **/
query getAllDeptName ($needLoc: Boolean!){
	getAllDepts {
    dname
    loc @include(if: $needLoc)
  }
}
```

```js
/** client - query variables **/
{
  "needLoc": false
}
```

```js
/** response **/ 
{
  "data": {
    "getAllDepts": [
      {
        "dname": "ACCOUNTING"
      },
      {
        "dname": "RESEARCH"
      },
      {
        "dname": "SALES"
      },
      {
        "dname": "OPERATIONS"
      }
    ]
  }
}
```



##### 默认变量（Default variables）

```
/** client **/
query getAllDeptName ($needLoc: Boolean = true){
	getAllDepts {
    dname
    loc @include(if: $needLoc)
  }
}
```

```js
/** client - query variables **/
{}
```

```js
/** response **/ 
{
  "data": {
    "getAllDepts": [
      {
        "dname": "ACCOUNTING",
        "loc": "NEW YORK"
      },
      {
        "dname": "RESEARCH",
        "loc": "DALLAS"
      },
      {
        "dname": "SALES",
        "loc": "CHICAGO"
      },
      {
        "dname": "OPERATIONS",
        "loc": "BOSTON"
      }
    ]
  }
}
```

