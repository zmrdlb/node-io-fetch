import FetchResource from './core/fetch-resource'

var fetchResource = new FetchResource();

/**
 * 创建新示例的工厂方法
 * @param  {JSON} config 自定义配置信息
 * @return {FetchResource} FetchResource 实例
 */
fetchResource.create = function(config){
    return new FetchResource(config);
}

export default fetchResource;
