# flutter即时通信服务端

目录文件说明

- routes 接口路由文件
  - circle.js 朋友圈相关接口
  - login.js 登录相关接口
  - obs.js 腾讯对象存储相关接口
  - user.js 用户信息相关接口
- sdk 腾讯对象存储相关SDK
- util 工具类封装
  - mysql.js 数据库相关操作封装
  - swagger.js swagger接口文档相关配置
- config ( 参数配置文件夹,该文件需要自己创建 )

---

## 配置 config 文件夹

在根目录中创建 config 文件夹

创建 mysqlConfig.js

```js
/* 数据库配置 */
const host = ""; /* 服务器地址 */
const port = ""; /* mysql服务口号 */
const user = ""; /* 用户名 */
const password = ""; /* 密码 */
const database = ""; /* 数据库名称 */

module.exports = {
  host,
  port,
  user,
  password,
  database
}
```

创建 cosConfig.js

```js
const config = {
  secretId:"", /*腾讯云秘钥 secretId */
  secretKey:"", /*腾讯云秘钥key secretKey */
  bucket:"", /**存储桶名称 */
  region:"", /* 存储桶节点 */
}
module.exports = config;
```

