### GraphQL 的工程应用

​	在之前的例子中，所有的 Schema 合成在一个字符串上。这显然是不符合现在大型项目分模块的开发方式。

#### GraphQL Schema Language 

​	在之前的例子中，所有的 Schema 合成在一个字符串上。这显然是不符合现在大型项目分模块的开发方式。

​	GraphQL Schema Languange 是相应语言实现用构造的方式去构建 Schema。以 Node.js 为例:

​	定义对象类型数据:

```js
const graphql = require('graphql')

const deptType = new graphql.GraphQLObjectType({
  name: 'Dept',
  fields: {
    deptno: { type: graphql.GraphQLString },
    dname: { type: graphql.GraphQLString },
    loc: { type: graphql.GraphQLString }
  }
})

module.exports = deptType
```

​	定义模块的 Schema 与 Resovles 

```js
const graphql = require('graphql')
const deptType = require('./models/Dept.js')
const deptDB = require('../fakeDB/dept.js')
const { nanoid } = require('nanoid')

const getDeptByDeptno = {
  type: deptType,
  args: {
    deptno: { type: graphql.GraphQLString }
  },
  resolve: (_, { deptno }) => {
    return deptDB.find(item => {
      return deptno == item.deptno
    })
  }
}

const getAllDepts = {
  type: new graphql.GraphQLList(deptType),
  resolve: () => {
    return deptDB
  }
}

const deptInputType = new graphql.GraphQLInputObjectType({
  name: 'deptInput',
  fields: {
    dname: { type: graphql.GraphQLString },
    loc: { type: graphql.GraphQLString }
  }
})

const increaseDept = {
  type: deptType,
  args: {
    dept: {
      type: deptInputType
    }
  },
  resolve: (_, { dept }) => {
    const deptno = nanoid()
    const newInstance = {
      deptno,
      ...dept
    }
    deptDB.push(newInstance)
    return newInstance
  }
}

module.exports = {
  query: { getDeptByDeptno, getAllDepts },
  mutation: { increaseDept }
}

```

​	构建 Schema

```js
const graphqlHTTP = require('koa-graphql')
const graphql = require('graphql')

const schema = new graphql.GraphQLSchema({
  query: rootQuery,
  mutation: rootMutation
})

module.exports = graphqlHTTP({
  schema: schema,
  graphiql: true
})
```

​	使用 GraphQL Schema Languange 声明固有的 Schema 相较于原本使用字符串的模式，拥有了模块化拆分、编译时校验、高维护性这些大型项目必备的功能。

#### ApolloClient-VueApollo

​	ApolloClient 是客户端中 GraphQL 的封装库。

​	VueApollo 是 ApolloClient 在 vue 中的插件实现。入口引入:

```javascript
import ApolloClient from 'apollo-boost'
import VueApollo from 'vue-apollo'
import Vue from 'vue'
Vue.use(VueApollo)

//创建ApolloClient实例
const apolloClient = new ApolloClient({
  // 必须使用绝对路径
  uri: 'http://localhost:3000/api'
})

const apolloProvider = new VueApollo({
  defaultClient: apolloClient
})

//使用 apolloProvider 选项将它添加到你的应用程序
new Vue({
  apolloProvider,
  render: h => h(App)
}).$mount('#app')
```

​	ApolloClient 的 协议部分并不能用直接使用字符串，而需要 graphql-tag 将其解析转换后才能使用。



#### graphql-tag

​	在客户端中开发中同样存在需要模块化、解耦合的需求，graphql-tag 作为 可以解析

Schema 字符串 与 .gql (或 .graphql) 文件，将其转换为程序可用的数据类型。

​	工程化配置(vue-cli)

```js
// npm install --save-dev graphql-tag
// vue.config.js
module.exports = {
  chainWebpack(config) {
    config.module
      .rule('graphql')
      .test(/\.(graphql|gql)$/)
      .use('graphql-tag/loader')
      .loader('graphql-tag/loader')
      .end()
  }
}

```

​	定义一个.gql 或 .graphql 文件:

```
query queryGetAllDepts {
  getAllDepts {
    deptno
    dname
    loc
  }
}
query queryGetDeptByDeptno($deptno: String) {
  getDeptByDeptno(deptno: $deptno) {
    deptno
    dname
    loc
  }
}

mutation createNewDept($deptInput: deptInput) {
  increaseDept(dept: $deptInput) {
    deptno
  }
}
```

​	在 VueApollo 使用:

```js
import {  createNewDept } from 'gql/Dept.gql'

this.$apollo.mutate({
  mutation: createNewDept,
  variables: {
    deptInput: deptInput
  }
})
```

 	ApolloQueryProvider 组件使用:

```html
<ApolloQuery :query="query">
    <template v-slot="{ result: { error, data } }">
      {{ data }}
      {{ error }}
    </template>
  </ApolloQuery>
```







