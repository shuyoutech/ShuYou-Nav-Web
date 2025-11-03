# ShuYou-Nav-Web

数游科技Nav导航系统

https://nav.shuyoutech.com/

# 安装pnpm

npm i pnpm -g

# 创建项目脚手架

pnpm create vue

# 安装组件、编译

pnpm add dayjs
pnpm add axios
pnpm add vue-i18n@11


pnpm install


# 启动

pnpm dev

************************ package.json 升级各个组件到最新版本  ********************

```
#使用npm模块升级工具npm-check-updates
pnpm install -g npm-check-updates
#检查当前可升级依赖:
ncu
#更新package.json文件:
ncu -u
#编译
pnpm install
```

************************ package.json 升级各个组件到最新版本  ********************

## 技术栈

| 技术栈          | 描述                     | 官网                                   |
|--------------|------------------------|--------------------------------------|
| Vue3         | 渐进式 JavaScript 框架      | https://v3.cn.vuejs.org/             |
| TypeScript   | JavaScript 的一个超集       | https://www.tslang.cn/               |
| Vite         | 前端开发与构建工具              | https://cn.vitejs.dev/               |
| Element Plus | 基于 Vue 3，面向设计师和开发者的组件库 | https://element-plus.gitee.io/zh-CN/ |
| Pinia        | 新一代状态管理工具              | https://pinia.vuejs.org/             |
| Vue Router   | Vue.js 的官方路由           | https://router.vuejs.org/zh/         |
| Vue I18n     | 国际化                    | https://vue-i18n.intlify.dev/        |

## 项目启动

```bash
# 安装NodeJS
brew install node
# 升级Node.js到最新版本
brew upgrade node
# Node.js版本
node -v

nvm use nodeversion
nvm install nodeverson

sudo npm install -g n
sudo n latest

sudo npm install -g vitepress

# 安装 pnpm
npm install pnpm -g

pnpm config set registry https://registry.npmmirror.com

# 安装依赖
pnpm install

# 项目运行
pnpm run dev

# 项目打包
pnpm run build:prod

```
