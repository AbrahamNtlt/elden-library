### 扩展补充

除了基本的使用外，GraphQL 还提供了许多功能供开发者使用，以下罗列常用的功能:

#### 接口（Interfaces）

​	接口是一个抽象类型，它包含某些字段，而对象类型必须包含这些字段，才能算实现了这个接口。

```
interface Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
}
type Human implements Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
  starships: [Starship]
  totalCredits: Int
}
```



#### 联合类型（Union Types）

​	联合类型和接口十分相似，但用意相反。如果将接口比喻成交际，联合类型则可以比喻成合集。

```
union SearchResult = Human | Droid | Starship
```



#### 内联片段（Inline Fragments）

​	如查询的字段返回的是接口或者联合类型，那么可能需要使用内联片段来取出下层具体类型的数据：

```
query HeroForEpisode($ep: Episode!) {
  hero(episode: $ep) {
    name
    ... on Droid {
      primaryFunction
    }
    ... on Human {
      height
    }
  }
}
```



#### 元字段（Meta fields）

​	原字段为数据的类型，允许程序添加入查询字段中，用 `__typename` 表示。

```
{
  search(text: "an") {
    __typename
    ... on Human {
      name
    }
    ... on Droid {
      name
    }
    ... on Starship {
      name
    }
  }
}
```



#### 订阅（Subscription）

​	Subscription 是 GraphQL 第三种操作，通过 WebSocket 双向通信实现服务端主动推送实时消息。

​	Subscription 功能的实现需要借助第三方库实现，常见的插件如 Apllo-Server 已集成该功能。



#### 文件上传

​	文件上传使用的 请求数据类型为 multipart/form-data，为了实现该功能需要安装两个npm包：apollo-upload-client和apollo-upload-server。

​	客户端的中操作文件上传，当成 mutation 操作即可。



#### dataloader

​	 N + 1 问题: 当一个请求数据需要的关联返回的具体字段在另个一数据中时，该请求则需要携带关联数据进行 N 次关联查询，总处理合计为 N +1 。

​	举例: 当我们需要获取一个公司的所有部门分别有多少员工时，部门表 ( 或者接口 ) 中存储全部的部门的 ID 和 名称等相关数据，员工表( 或接口 )  中存储着包括所属部门的员工相关信息 。此时的接口操作则为部门表查询一次，再根据此操作拿到的所有 ID 在员工表依次查询 N 次，最后汇集成返回数据 。

​	dataloader 通过缓存机制，将所需要查询先收集起来，再进行一次性的批量数据查询，在下一次事件轮中将数据组合返回。

