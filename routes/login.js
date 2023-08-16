const router = require('koa-router')()
const {queryDB,addDB} = require("../util/mysql");
var TLSSigAPIv2 = require('tls-sig-api-v2');
const uuid = require('uuid')

//  get方式
// /**
//  * @swagger
//  * /login:
//  *   get:
//  *     tags:
//  *       - IM登录
//  *     summary: IM登录获取sign
//  *     parameters:
//  *       - name: name
//  *         in: query
//  *         required: true
//  *         description: 用户名
//  *         type: string
//  *     responses:
//  *      101: 
//  *        description: 成功获取
//  */

/**
 * @swagger
 * /login:
 *   post:
 *     tags:
 *       - 登录注册
 *     summary: 用户登录
 *     description: 用户通过用户名和密码进行登录
 *     parameters:
 *       - in: body
 *         name: data
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *            password:
 *              type: string
 *     responses:
 *      200: 
 *        description: 成功获取
 */
router.post("/login",async (ctx,next)=>{
  var {name,password} = ctx.request.body;
  var responseData;
  if(!name || !password){
    ctx.body = {
      code:102,
      data:null,
      message:"用户名和密码不能为空"
    }
    return
  }
  /* 在数据库中查抄用户名 */
  let result = await queryDB(
    `SELECT * FROM users WHERE user = '${name}' AND password = '${password}'`
  )
  console.log(result)
  /* 判断用户名密码是否存在 */
  if(result.data.length < 1){
    ctx.body = {
      code:103,
      data:null,
      message:"用户名同密码不匹配"
    }
    return 
  }
  

  var api = new TLSSigAPIv2.Api(
    1400813777, 
    "5d447bbc2bea986a10e1bd1308bfb1aeaeed111dcf3211f7ca86d3368a5f3fc6"
  );
  var sig = api.genSig(result.data[0].tc_userId, 86400*180);

  ctx.body = {
    code:101,
    data:{
      tc_userId:result.data[0].tc_userId,
      user:result.data[0].user,
      sig:sig
    },
    message:"success"
  }
})

/**
 * @swagger
 * /register:
 *   post:
 *     tags:
 *       - 登录注册
 *     summary: 用户注册
 *     description: 填写用户名/密码进行账号注册
 *     parameters:
 *       - in: body
 *         name: data
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             password:
 *               type: string
 * 
 *     responses:
 *      101: 
 *        description: 成功获取
 */
router.post("/register",async (ctx,next)=>{
  let {name,password} = ctx.request.body;
  let responseData;
  const tc_userId = uuid.v1();
  let result = await queryDB(
    `SELECT * FROM users WHERE user = '${name}'`
  )
  console.log(result);
  /*判断当前账号是否存在 */
  if(result.data.length > 1){
    ctx.body = {
      code:102,
      data:null,
      message:"用户名已被占用"
    }
  }else{
    /* 向库中插入新账号密码 */
    const result = await addDB(
      "INSERT INTO users SET ?",
      {
        user:name,
        password:password,
        tc_userId:tc_userId
      }
    );
    /* 根据操作库的状态返回状态码，响应给前端 */
    if(result.code == 101){
      responseData = {
        code:101,
        data:{
          user:name,
          tc_userId:tc_userId
        },
        massage:"注册成功"
      }
    }else{
      responseData = {
        code:102,
        data:null,
        massage:"注册失败"
      }
    }
    ctx.body = responseData;
  }
  
  


})








module.exports = router
