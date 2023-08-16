
const { addDB, queryDB } = require('../util/mysql');

const router = require('koa-router')()

router.prefix('/users')


/**
 * @swagger
 * /getFriendId:
 *   get:
 *     tags:
 *       - 用户关系链
 *     summary: 获取用户id
 *     parameters:
 *       - name: friendName
 *         in: query
 *         required: true
 *         description: 搜索的用户名
 *         type: string
 *     responses:
 *      101: 
 *        description: 成功获取
 */

router.get("/getFriendId",async(ctx,next)=>{
  const data = ctx.request.query;
  const result = await queryDB(`SELECT * FROM users WHERE user = '${data.friendName}'`);
  console.log(result)
  if(result.data.length <= 1){
    ctx.body = {
      code:101,
      data:result.data,
      message:"查询成功"
    }
  }else{
    ctx.body = {
      code:102,
      data:null,
      message:"查询为空"
    }
  }
})


/**
 * @swagger
 * /users/importFriends:
 *   post:
 *     tags:
 *       - 用户关系链
 *     summary: 上传用户关系链
 *     parameters:
 *       - in: body
 *         name: data
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 type: object
 *                 properties: 
 *                    userId:
 *                      type: string
 *                    friendId:
 *                      type: string
 *     responses:
 *       200:
 *         description: 成功获取
 */

router.post("/importFriends",async (ctx,next)=>{
  const {data} = ctx.request.body;
  const initData = JSON.parse(data);
  /* 向 friends 表中添加用户的好友列表id */
  try {
    for(let i =0;i<initData.length;i++){
      const quResult = await queryDB(
        `SELECT * FROM friends WHERE userId = '${initData[i].userId}' AND friendId = '${initData[i].friendId}'`
      )
      if(quResult.data.length == 0){
        addDB(
          "INSERT INTO friends (userId, friendId) VALUES (?, ?)",
          [initData[i].userId,initData[i].friendId]
        )
      }
    }
    ctx.body = {
      code:101,
      data:null,
      message:"操作成功"
    }
  } catch (error) {
    ctx.body = {
      code:102,
      data:null,
      message:"操作失败"
    }
  }
  
})







module.exports = router
