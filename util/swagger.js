const router = require('koa-router')() //引入路由函数
const swaggerJSDoc = require('swagger-jsdoc')

const swaggerDefinition = {
  info: {
    title: 'IM即时通信node服务端接口文档',
    version: '1.0.0',
    description: '包含腾讯即时通信和对象存储',
  },
  host: 'localhost:3001',
  basePath: '/' // Base path (optional)
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js'], // 写有注解的router的存放地址
};

const swaggerSpec = swaggerJSDoc(options)

// 通过路由获取生成的注解文件
router.get('/swagger.json', async function (ctx) {
  ctx.set('Content-Type', 'application/json');
  ctx.body = swaggerSpec;
})

module.exports = router
//将页面暴露出去
