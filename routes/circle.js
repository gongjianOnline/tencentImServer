const { addDB, queryDB } = require('../util/mysql');

const router = require('koa-router')()

router.prefix('/circle')

/* 朋友圈相关接口 */

/**
 * @swagger
 * /circle/sendTrends:
 *   post:
 *     tags:
 *       - 朋友圈相关接口
 *     summary: 发送朋友圈
 *     description: 
 *     parameters:
 *       - in: body
 *         name: data
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             content:
 *               type: string
 *             time:
 *               type: number
 *             imgUrl:
 *               type: string
 *             userId:
 *               type: string
 *             circleId:
 *               type: string
 *             like:
 *               type: number
 * 
 *     responses:
 *      101: 
 *        description: 成功获取
 */

router.post("/sendTrends",async (ctx,next)=>{
  const data = ctx.request.body;
  console.log(data.userId);
  /* 查找同一用户同一动态是否有重复 */
  const result = await queryDB(
    `SELECT * FROM circle WHERE userId = '${data.userId}' AND time = ${data.time}`
  )
  if(result.data.length == 0){
    /* 如果没有相同数据插入当前数据 */
    var resultCode = await addDB(
      "INSERT INTO circle SET ?",
      {
        content: data.content,
        time: data.time,
        imgUrl: data.imgUrl,
        userId: data.userId,
        circleId: data.circleId,
        like: data.like
      }
    )
    if(resultCode.code == 101){
      ctx.body = {
        code:101,
        data:null,
        message:"发布成功"
      }
      return;
    }
  }
  ctx.body = {
    code:102,
    data:null,
    message:"发布失败"
  }  
})

/**
 * @swagger
 * /circle/getTrends:
 *   get:
 *     tags:
 *       - 朋友圈相关接口
 *     summary: 拉取朋友圈动态
 *     description: 
 *     parameters:
 *       - name: userId
 *         in: query
 *         required: true
 *         description: 用户id
 *         type: string
 *     responses:
 *      101: 
 *        description: 成功获取
 */

router.get("/getTrends",async (ctx,next)=>{
  const data = ctx.request.query;
  /* 存放动态列表 */
  let trendsList = [];
  /**查找自己的朋友圈 */
  let myTrends =await queryDB(`SELECT * FROM circle WHERE userId = '${data.userId}'`)
  myTrends.data.forEach((item)=>{trendsList.push(item)})
  /**查找自己的好友id */
  let myFriends = await queryDB(`SELECT * FROM friends WHERE userId = '${data.userId}'`);
  for(let i=0;i<myFriends.data.length;i++){
    /* 根据好友ID在朋友圈表中查找相应的动态 */
    let friendsTrend =await queryDB(`SELECT * FROM circle WHERE userId = '${myFriends.data[i].friendId}'`)
    friendsTrend.data.forEach((item)=>{trendsList.push(item)})
  }
  /* 根据时间戳排序 */
  let newTrendsList = trendsList.sort((a,b)=>b.time - a.time);
  ctx.body = {
    code:trendsList.length==0?102:101,
    data:trendsList.length==0?null:newTrendsList,
    message:trendsList.length==0?"查询失败":"查询成功"
  }
})


/**查看朋友圈详情 */
/**
 * @swagger
 * /circle/getTrendDetails:
 *   get:
 *     tags:
 *       - 朋友圈相关接口
 *     summary: 获取朋友圈详情
 *     description: 
 *     parameters:
 *       - name: circleId
 *         in: query
 *         required: true
 *         description: 朋友圈id
 *         type: string
 *     responses:
 *      101: 
 *        description: 成功获取
 */
router.get("/getTrendDetails",async(ctx,next)=>{
  const data = ctx.request.query;
  console.log(data.circleId);
  /* 获取单独朋友圈详情 */
  let initResponse = {
    circleInfo:null,
    commitList:null
  };
  var circleResponse = await queryDB(`SELECT * FROM circle WHERE circleId = '${data.circleId}'`)
  initResponse.circleInfo = circleResponse.data[0];
  /* 获取朋友圈评论 */
  var commitListResponse = await queryDB(`SELECT * FROM commit WHERE circleId = '${data.circleId}'`)

  initResponse.commitList = commitListResponse.data.sort((a,b)=>b.time - a.time);

  ctx.body = {
    code:101,
    data:initResponse,
    message:"查询成功"
  }

})


/* 朋友圈发送评论 */
/**
 * @swagger
 * /circle/commit:
 *   post:
 *     tags:
 *       - 朋友圈相关接口
 *     summary: 发送朋友圈评论
 *     description: 
 *     parameters:
 *       - in: body
 *         name: data
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             circleId:
 *               type: string
 *             commit:
 *               type: string
 *             time:
 *               type: number
 *             userId:
 *               type: string
 * 
 *     responses:
 *      101: 
 *        description: 成功获取
 */
router.post("/commit",async(ctx,next)=>{
  const result = await ctx.request.body;
  const insertResult = await addDB(
    "INSERT INTO commit SET ?",
    {
      commit:result.commit,
      circleId:result.circleId,
      userId:result.userId,
      time:result.time
    }
  )
  if(insertResult.code == 101){
    ctx.body = {
      code:101,
      message:"评论成功"
    }
  }else{
    ctx.body = {
      code:102,
      message:"评论失败"
    }
  }
})


/* 查看个人朋友圈 */
/**
 * @swagger
 * /circle/getPersonal:
 *   get:
 *     tags:
 *       - 朋友圈相关接口
 *     summary: 查看个人朋友圈
 *     description: 
 *     parameters:
 *       - name: userId
 *         in: query
 *         required: true
 *         description: 查看该朋友圈的用户ID
 *         type: string
 *     responses:
 *      101: 
 *        description: 成功获取
 */

router.get("/getPersonal",async(ctx,next)=>{
  const data = ctx.request.query;
  const result = await queryDB(`SELECT * FROM circle WHERE userId = '${data.userId}' `);
  ctx.body = {
    code:101,
    data:result.data,
    message:'查询成功'
  }
})



module.exports = router