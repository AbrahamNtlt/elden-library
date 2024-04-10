module.exports = {
  port: 8100,
  title: "技能树",
  description: "技能树",
  themeConfig: {
    search: false, //搜索
    searchMaxSuggestions: 10,
    displayAllHeaders: true,
    sidebar: [
      {
        title: "HTML",
        collapsable: true,
        children: [
          // {
          //   title: '标签',
          //   path: '/pages/html/tag',
          // },
          {
            title: "DOM",
            path: "/pages/html/dom",
          },
        ],
      },
      {
        title: "JavaScript",
        collapsable: true,
        children: [
          {
            title: "数据类型",
            path: "/pages/javascript/datatype",
          },
          {
            title: "Object",
            path: "/pages/javascript/object",
          },
          {
            title: "原型和原型链",
            path: "/pages/javascript/prototype",
          },
          {
            title: "this",
            path: "/pages/javascript/this",
          },
          {
            title: "作用域与上下文",
            path: "/pages/javascript/scope",
          },
          {
            title: "EventLoop",
            path: "/pages/javascript/eventLoop",
          },
          {
            title: "promise",
            path: "/pages/javascript/promise",
          },
          {
            title: "正则",
            path: "/pages/javascript/regular",
          },
          {
            title: "模块化",
            path: "/pages/javascript/module",
          },
          {
            title: "文字自适应背景",
            path: "/pages/javascript/text",
          },
        ],
      },
      {
        title: "CSS",
        collapsable: true,
        children: [
          {
            title: "CSS",
            path: "/pages/css/css",
          },
          // {
          //   title: '排版',
          //   path: '/pages/css/composing',
          // },
          {
            title: "BFC",
            path: "/pages/css/bfc",
          },
          {
            title: "常用布局",
            path: "/pages/css/layout",
          },
          {
            title: "选择器",
            path: "/pages/css/selector",
          },
          {
            title: "rem转换为px",
            path: "/pages/css/remToPx",
          },
        ],
      },
      {
        title: "Vue 2.x",
        collapsable: true,
        children: [
          {
            title: "vue.js",
            path: "/pages/vue/base",
          },
          {
            title: "数据劫持",
            collapsable: true,
            children: [
              {
                title: "Observer",
                path: "/pages/vue/observer",
              },
              {
                title: "Watcher",
                path: "/pages/vue/watcher",
              },
            ],
          },
          {
            title: "Virtual DOM",
            collapsable: true,
            children: [
              {
                title: "vnode",
                path: "/pages/vue/vnode",
              },
              {
                title: "patch",
                path: "/pages/vue/patch",
              },
            ],
          },
        ],
      },
      {
        title: "Webpack",
        collapsable: true,
        children: [
          {
            title: "概述",
            path: "/pages/webpack/overview",
          },
          {
            title: "tapable",
            path: "/pages/webpack/tapable",
          },
          {
            title: "loader",
            path: "/pages/webpack/loader",
          },
        ],
      },
      {
        title: "svga",
        collapsable: true,
        children: [
          {
            title: "svga",
            path: "/pages/electron/demo",
          },
        ],
      },
      {
        title: "File",
        collapsable: true,
        children: [
          {
            title: "计算机中文件的概念",
            path: "/pages/file/conception",
          },
          {
            title: "文件操作相关对象和API",
            path: "/pages/file/file-object",
          },
          {
            title: "文件数据转换",
            path: "/pages/file/convert",
          },
          {
            title: "本地文件操作",
            path: "/pages/file/localfile",
          },
        ],
      },
      {
        title: "其他",
        collapsable: true,
        children: [
          {
            title: "echarts",
            path: "/pages/other/echarts",
          },

        ],
      },
    ],
    nav: [
      { text: "首页", link: "/" },
      {
        text: "相关技术",
        items: [
          {
            text: "vue",
            link: "https://cn.vuejs.org/",
          },
          {
            text: "element-admin",
            link: "https://panjiachen.github.io/vue-element-admin-site/zh/",
          },
        ],
      },
    ],
  },
  head: [
    ["script", { src: "/settings.js" }],
    [
      "script",
      { src: "https://cdn.jsdelivr.net/npm/react/umd/react.production.min.js" },
    ],
    [
      "script",
      {
        src: "https://cdn.jsdelivr.net/npm/react-dom/umd/react-dom.production.min.js",
      },
    ],
    ["script", { src: "https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js" }],
    [
      "script",
      { src: "https://cdn.jsdelivr.net/npm/@babel/standalone/babel.min.js" },
    ],
  ],
  plugins: ["vuepress-plugin-cat", "demo-code"],
};
