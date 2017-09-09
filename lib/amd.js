// 主要就是两个函数 
// define  和 require
(function(global) {
    
    // 应该有个初始化的操作 获取 baseUrl  当前的baseUrl 其实就是 页面的路径
    // 这样操作的话 其实就跟 require Js 的一样了 
    // 定义一个大的对象 里面包括 baseUrl  path  moduleCache
    // 包括 队列 依赖 

    // 作为一个全局的对象 包含模块的所有信息
    //  
    var common_module = {};

    //主要目的是生成baseUrl
    ;(function init(){
       var baseUrl = common_module.baseUrl || location.href;
       common_module.baseUrl = baseUrl; 
    }()); 


    
    //组装路径
    //baseUrl + path
    function comboPath(){
        
    }

    //模块名 依赖 模块内容
    //此时的模块名 仍然和文件名保持一致  
    function define(mod, deps, factory) {
        
        
        if (Array.isArray(mod)) {
            if (typeof deps == 'function' && factory === undefined) {
                deps = mod;
                factory = deps; 
            }
            mod = document.currentScript;
        } else if(typeof mod === 'string'){
            //说明没有依赖 可以直接执行 factory
            if (deps === undefined && factory === undefined) {
                 //直接行 callback
                 factory = mod;
                 deps = [];
                 mod = document.currentScript.src.split(/\//).reverse()[0].split(/\./)[0];
                 //factory = factory.toLowerCase() === 'jquery' ? jQuery : factory;
                 common_module.mod[mod].callback(factory);
            }
        }

        //如果有依赖的话 则先去加载依赖 
        if(deps){
           
           // 这个过程其实相当于 重新执行一遍 流程
           // 1.解析路径 模块 和 模块名
           // 2.加载模块 加载完以后 执行 define 
           // 3.缓存模块信息 只有等 a 模块 加载完 并且执行完 factory 把 内容输出的话
           // 4.这个时候 开始执行 b 模块的 factory 参数为 a 模块的内容 并把内容输出
           // 5.执行 require callback 把参数传递进去 
        }
        console.log("module===" + module);
    }

     

    //模块加载时的队列数据存储对象
    //存储modulename 和 callback
    var moduleCache = {};

    //存储配置的模块和路径
    var modulePaths = {};

    //加载模块
    function require(ids, callback) {
        //模块标识 设为数组  
        ids = typeof ids === 'string' ? [ids] : ids;
        //定义一个队列
        var modList = [];
        //遍历模块标识 找到 模块名和模块 url
        ids.forEach((ele,index) => {
            //根据模块标识 解析模块名和 模块 url                 
            var obj = parsePath(ele);
            modList.push(obj); 
            common_module.mod = common_module.mod || {};
            common_module.mod[obj.name]  = {
                name : obj.name,
                path : obj.path,
                callback : callback,
                length : ++index,
                deps : [],
                factory : []
            };
        });
          
        //开始加载模块  
        modList.forEach((e)=>{
            loadMod(common_module.mod[e.name]); 
        })  
    }

    
    
    //模块url = baseUrl + Path
    function parsePath(e){
        //根据 baseUrl 来解析
        //1.先把baseUrl 切成数组
        var path_arr = common_module.baseUrl.split(/(\/\/|\/)/);  
        //把模块名切成数组
        var mod_path_arr = e.split(/\//); 
        mod_path_arr.forEach((e)=>{
             if(e == "."){
                 path_arr.pop();  
             } 
        });
        var name = mod_path_arr[mod_path_arr.length-1];
        var path = path_arr.join("") + e.replace(/^\.\//,'');

        return {
                 name:name,
                 path:path
               }
         
    }


    //加载模块
    function loadMod(mod) {
        
        var script = document.createElement("script");
        var head = document.getElementsByTagName("head")[0];
        script.type = "text/javascript";
        script.async = "async";
        //脚本加载完毕以后
        script.onload = function() {
            script.onload = script.onerror = null;
            head.removeChild(script);
            script = null;
            //加载成功以后开始解析 
            alert("模块" + mod.name + "加载完成 哈哈哈哈哈哈");
            //模块加载完成的话 其实可以去执行 define 函数
        };

        script.onerror = function() {
            script.onload = script.onerror = null;
            head.removeChild(script);
            script = null;
            //抛出异常
            throw new Error("[" + mod.name + "] module failed to load, the url is" + mod.path);
        }

         
        script.src = mod.path + ".js";
        

        head.insertBefore(script, head.firstChild);
    }



    //定义一个配置函数
    global.require = require;

    // 可以给模块配置路径
    // 把配置的模块和路径存放到 modulePath中
    require.config = function(option) {
        Object.assign(common_module,option);
    }

    global.define = define;
})(window);