### GraphQL 的查询和变更

​	本文在 node.js 的环境 ( 详见初始 GraphQL )搭建好的条件下，从零开始构建一套基础的数据操作功能。现以 Oracle 经典入门系列 soctt 数据作为基础数据，实现一套接功能。

#### 定义 Schema

​	GraphQL 思想是以数据为中心的，定义 Schema 自然成为了开发的核心。定义 Schema 即是定义数据模型，需要根据业务制定，客户端和服务端共同维护。

```
/** schema **/
type Dept {
  deptno: ID!
  dname: String
  loc: String
}
type Emp {
  empno: ID!
  ename: String
  job: String
  mgr: Int
  hiredate: String
  sal: Int
  comm: String
  deptno: String!
}
type Bonus {
  ename: String
  job: String
  sal: Int
  comm: String
}
type Salgrade {
  grade: ID!
  losal: Int
  hisal: Int
}
```

​	

#### 设置相关接口的操作 Schema 和 Resolver

​	Schema 中大部分的类型都是普通对象类型，但是一个 schema 内有两个特殊类型。

```
schema {
  query: Query
  mutation: Mutation
}
```

​	每一个 GraphQL 服务都有一个 `query` 类型，可能有一个 `mutation` 类型。这两个类型和常规对象类型无差，但是它们之所以特殊，是因为它们定义了每一个 GraphQL 查询的入口。

```
/** schema **/
type Query{
  getAllDepts: [Dept]
  getAllEmps: [Emp]
  getAllBonus: [Bonus]
  getAllSalgrades: [Salgrade]
}
```

```js
/** resolver **/ 
const { bonus, dept, emp, salgrade } = require('./fakeDB/index.js')

const resolves = {
  getAllDepts: () => dept,
  getAllEmps: () => emp,
  getAllBonus: () => bonus,
  getAllSalgrades: () => salgrade
}
```

```
/** client **/ 
query{
	getAllDepts{
  	deptno
    dname
    loc
	}
  getAllEmps{
    empno
    ename
    job
    mgr
    hiredate
    sal
    comm
    deptno
  }
  getAllBonus{
    ename
		job
    sal
    comm
  }
  getAllSalgrades{
    grade
    losal
    hisal
  }
}
```

```json
/** response **/ 
{
  "data": {
    "getAllDepts": [
      {
        "deptno": "10",
        "dname": "ACCOUNTING",
        "loc": "NEW YORK"
      },
      {
        "deptno": "20",
        "dname": "RESEARCH",
        "loc": "DALLAS"
      },
      {
        "deptno": "30",
        "dname": "SALES",
        "loc": "CHICAGO"
      },
      {
        "deptno": "40",
        "dname": "OPERATIONS",
        "loc": "BOSTON"
      }
    ],
    "getAllEmps": [
      {
        "empno": "7369",
        "ename": "SMITH",
        "job": "CLERK",
        "mgr": "7902",
        "hiredate": "17-12-1980",
        "sal": 800,
        "comm": "",
        "deptno": "20"
      },
      {
        "empno": "7499",
        "ename": "ALLEN",
        "job": "SALESMAN",
        "mgr": "7698",
        "hiredate": "20-2-1981",
        "sal": 1600,
        "comm": "300",
        "deptno": "30"
      },
      {
        "empno": "7521",
        "ename": "WARD",
        "job": "SALESMAN",
        "mgr": "7698",
        "hiredate": "22-2-1981",
        "sal": 1250,
        "comm": "500",
        "deptno": "30"
      },
      {
        "empno": "7566",
        "ename": "JONES",
        "job": "MANAGER",
        "mgr": "7839",
        "hiredate": "2-4-1981",
        "sal": 2975,
        "comm": "",
        "deptno": "20"
      },
      {
        "empno": "7654",
        "ename": "MARTIN",
        "job": "SALESMAN",
        "mgr": "7698",
        "hiredate": "28-9-1981",
        "sal": 1250,
        "comm": "1400",
        "deptno": "30"
      },
      {
        "empno": "7698",
        "ename": "BLAKE",
        "job": "MANAGER",
        "mgr": "7839",
        "hiredate": "1-5-1981",
        "sal": 2850,
        "comm": "",
        "deptno": "30"
      },
      {
        "empno": "7782",
        "ename": "CLARK",
        "job": "MANAGER",
        "mgr": "7839",
        "hiredate": "9-6-1981",
        "sal": 2450,
        "comm": "",
        "deptno": "10"
      },
      {
        "empno": "7788",
        "ename": "SCOTT",
        "job": "ANALYST",
        "mgr": "7566",
        "hiredate": "13-7-87",
        "sal": 3000,
        "comm": "",
        "deptno": "20"
      },
      {
        "empno": "7839",
        "ename": "KING",
        "job": "PRESIDENT",
        "mgr": "",
        "hiredate": "17-11-1981",
        "sal": 5000,
        "comm": "",
        "deptno": "10"
      },
      {
        "empno": "7844",
        "ename": "TURNER",
        "job": "SALESMAN",
        "mgr": "7698",
        "hiredate": "8-9-1981",
        "sal": 1500,
        "comm": "0",
        "deptno": "30"
      },
      {
        "empno": "7876",
        "ename": "ADAMS",
        "job": "CLERK",
        "mgr": "7788",
        "hiredate": "13-7-87",
        "sal": 1100,
        "comm": "",
        "deptno": "20"
      },
      {
        "empno": "7900",
        "ename": "JAMES",
        "job": "CLERK",
        "mgr": "7698",
        "hiredate": "3-12-1981",
        "sal": 950,
        "comm": "",
        "deptno": "30"
      },
      {
        "empno": "7902",
        "ename": "FORD",
        "job": "ANALYST",
        "mgr": "7566",
        "hiredate": "3-12-1981",
        "sal": 3000,
        "comm": "",
        "deptno": "20"
      },
      {
        "empno": "7934",
        "ename": "MILLER",
        "job": "CLERK",
        "mgr": "7782",
        "hiredate": "23-1-1982",
        "sal": 1300,
        "comm": "",
        "deptno": "10"
      }
    ],
    "getAllBonus": [],
    "getAllSalgrades": [
      {
        "grade": "1",
        "losal": 700,
        "hisal": 1200
      },
      {
        "grade": "2",
        "losal": 1201,
        "hisal": 1400
      },
      {
        "grade": "3",
        "losal": 1401,
        "hisal": 2000
      },
      {
        "grade": "4",
        "losal": 2001,
        "hisal": 3000
      },
      {
        "grade": "5",
        "losal": 3001,
        "hisal": 9999
      }
    ]
  }
}
```

------



#### 传参

​	以上演示了基础的查询与数据，但实际开发中不可能只有全量查询，更多的情况下是条件查询。

##### 参数（Arguments）

​	在类似 REST 的系统中，你只能传递一组简单参数 -- 请求中的 query 参数和 URL 段。但是在 GraphQL 中，每一个字段和嵌套对象都能有自己的一组参数，从而使得 GraphQL 可以完美替代多次 API 获取请求。甚至你也可以给 标量（scalar）字段传递参数，用于实现服务端的一次转换，而不用每个客户端分别转换。

```
/** schema **/
type Query{
	getEmpByEmpno(empno : String) : Emp
}
```

```js
/** resolver **/
const resolves = {
  getEmpByEmpno: (args) => {
    return emp.find((item) => {
      return args.empno == item.empno
    })
  }
}
```

```
/** client **/
query{
  getEmpByEmpno(empno:"7934"){
    ename
    job
    deptno
  } 
}
```

```json
/** response **/ 
{
  "data": {
    "getEmpByEmpno": {
      "ename": "MILLER",
      "job": "CLERK",
      "deptno": "10"
    }
  }
}
```

> 值的注意的是: 在 Schema 中，所有的参数到达 Resolver 后，将合并成一个Object 类型的参数，这与我们习惯中的函数形参不太一样。



##### 变量（Variables）

​	上例中参数 **empno** 是直接在客户端直接传值。若需要动态传值时，其中一种选择就是在客户端动态的去拼接 **query** ，但这显然不是一个好方法。GraphQL 拥有一级方法将动态值提取到查询之外，然后作为分离的字典传进去。这些动态值即称为**变量**。使用变量之前，我们得做三件事：

	1. 使用 `$variableName` 替代查询中的静态值。
 	2. 声明 `$variableName` 为查询接受的变量之一。
 	3. 将 `variableName: value` 通过传输专用（通常是 JSON）的分离的变量字典中。

```
/** client **/
query ($empno: String){
  getEmpByEmpno(empno:$empno){
    ename
    job
    deptno
  } 
}
```

```json
/** client - query variables **/
{ 
  "empno": "7934" 
}
```

```json
/** response **/ 
{
  "data": {
    "getEmpByEmpno": {
      "ename": "MILLER",
      "job": "CLERK",
      "deptno": "10"
    }
  }
}
```

------



##### 聚合查询

​	在同一个上下文中，GraphQL 一次性请求可以获取所有所需的字段。

```js
/** resolver **/
const resolves = {
  getDeptByDeptno: ({ deptno }) => {
    return dept.find((item) => {
      return deptno == item.deptno
    })
  },
  getEmpFromDept: ({ deptno }) => {
    return dept.filter((item) => {
      return deptno != item.deptno
    })
  }
}
```

```
/** schema **/
type Query {
  getDeptByDeptno (deptno : String) : Dept
  getEmpFromDept (deptno : String) : [Emp]
}
```

```
/** client **/
query ($deptno: String){
  getDeptByDeptno(deptno:$deptno){
    dname
  }
  getEmpFromDept(deptno:$deptno){
  	ename
  	job
  }
}
```

```json
/** client - query variables **/
{ 
  "empno": "30" 
}
```

```js
/** response **/ 
{
  "data": {
    "getDeptByDeptno": {
      "dname": "SALES"
    },
    "getEmpFromDept": [
      {
        "ename": "ALLEN",
        "job": "SALESMAN"
      },
      {
        "ename": "WARD",
        "job": "SALESMAN"
      },
      {
        "ename": "MARTIN",
        "job": "SALESMAN"
      },
      {
        "ename": "BLAKE",
        "job": "MANAGER"
      },
      {
        "ename": "TURNER",
        "job": "SALESMAN"
      },
      {
        "ename": "JAMES",
        "job": "CLERK"
      }
    ]
  }
}
```

------

#### 变更

​	变更与查询的工作方式相同，在 Mutation 类型上定义一些字段，然后这些字段将作为 mutation 根字段使用，接着就能在查询中调用。

##### 输入类型（Input Types） 

​	上例传参中传输的是标量类型，在操作变更提交的时候往往是一整个对象进行提交。GraphQL 也支持对象类型的参数，在 Schema 中定义输入类型与定义普通类型非常相似，只需将关键字改为 **input** 而不是 **type** 。

```js
/** resolver **/
const { nanoid } = require('nanoid')
const resolves = {
  increaseDept: (args) => {
    const deptno = nanoid()
    const deptInstance = {
      deptno,
      ...args.dept
    }
    return deptInstance
  }
}
```

```apl
/** schema **/
input deptInput {
  dname: String
  loc: String
}
type Mutation {
	increaseDept(dept:deptInput) : Dept
}
```

```
/** client **/
mutation ($dept:deptInput){
  increaseDept(dept: $dept){
    deptno
    dname
    loc
  }
}
```

```js
/** client - query variables **/
{
  "dept": {
    "dname": "public relations",
    "loc": "Boston"
  }
}
```

```js
/** response **/ 
{
  "data": {
    "increaseDept": {
      "deptno": "NUzaVwPX8rYizd3cz8jIm",
      "dname": "public relations",
      "loc": "Boston"
    }
  }
}
```

