/**
 * @fileoverview 资源请求入口
 */

const Config = require('./config'),
      FetchFactory = require('./fetch-factory'),
      extend = require('extend');

/**
 * 请求资源类。
 * 每个实例保存了自己的默认请求配置。对有不同请求处理行为的不同种类资源，可做分组多实例化处理。
 */
class FetchResource {
  constructor(defaultConfig){
      if(!defaultConfig){
          defaultConfig = {};
      }
      this.defaults = {};
      extend(true,this.defaults,Config,defaultConfig);
  }

  fetch(ioparams){
      return FetchFactory.fetch(ioparams,this.defaults);
  }
}

module.exports = FetchResource;
