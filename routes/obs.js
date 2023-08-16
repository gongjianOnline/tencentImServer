
const router = require('koa-router')()
var STS = require('../sdk/index');
const cosConfig = require("../config/cosConfig");

router.prefix('/obs')

// 配置参数
var config = {
  secretId: cosConfig.secretId, // 固定密钥
  secretKey: cosConfig.secretKey, // 固定密钥
  proxy: '',
  durationSeconds: 1800,
  // host: 'sts.tencentcloudapi.com', // 域名，非必须，默认为 sts.tencentcloudapi.com
  endpoint: 'sts.tencentcloudapi.com', // 域名，非必须，与host二选一，默认为 sts.tencentcloudapi.com

  // 放行判断相关参数
  bucket: cosConfig.bucket,
  region: cosConfig.region,
  allowPrefix: '*', // 这里改成允许的路径前缀，可以根据自己网站的用户登录态判断允许上传的具体路径，例子： a.jpg 或者 a/* 或者 * (使用通配符*存在重大安全风险, 请谨慎评估使用)
  // 简单上传和分片，需要以下的权限，其他权限列表请看 https://cloud.tencent.com/document/product/436/31923
  allowActions: [
      // 简单上传
      'name/cos:PutObject',
      'name/cos:PostObject',
      // 分片上传
      'name/cos:InitiateMultipartUpload',
      'name/cos:ListMultipartUploads',
      'name/cos:ListParts',
      'name/cos:UploadPart',
      'name/cos:CompleteMultipartUpload'
  ],
};


/**
 * @swagger
 * /obs/tencentOBS:
 *   get:
 *     tags:
 *       - 腾讯云对象存储
 *     summary: 获取临时密钥
 *     description: 
 *     responses:
 *      101: 
 *        description: 成功获取
 */

router.get("/tencentOBS",async (ctx,next)=>{
  var shortBucketName = config.bucket.substr(0 , config.bucket.lastIndexOf('-'));
  var appId = config.bucket.substr(1 + config.bucket.lastIndexOf('-'));
  var xxx;
  var policy = {
    'version': '2.0',
    'statement': [{
      'action': config.allowActions,
      'effect': 'allow',
      'principal': {'qcs': ['*']},
      'resource': [
          'qcs::cos:' + config.region + ':uid/' + appId + ':prefix//' + appId + '/' + shortBucketName + '/' + config.allowPrefix,
      ],
    }],
  };
  

  const tempKeys = await new Promise((resolve,reject)=>{
    STS.getCredential({
      secretId: config.secretId,
      secretKey: config.secretKey,
      proxy: config.proxy,
      durationSeconds: config.durationSeconds,
      endpoint: config.endpoint,
      policy: policy,
    }, function (err, tempKeys) {
      resolve(tempKeys);
    })
  })

  ctx.body = {
    data:tempKeys
  }
})




module.exports = router