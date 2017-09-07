// 主要就是两个函数 
// define  和 require
(function(global) {
    
     
     
    // 应该有个初始化的操作 获取 baseUrl  当前的baseUrl 其实就是 页面的路径
    // 这样操作的话 其实就跟 require Js 的一样了 
    // 定义一个大的对象 里面包括 baseUrl  path  moduleCache
    // 包括 队列 依赖 
    
    var common_module = {};

    //主要目的是生成baseUrl
    function init(){
       var baseUrl = location.href;
       common_module.baseUrl = baseUrl; 
    } 

    //做一个 路径的解析
    //模块url = baseUrl + Path
    function parsePath(){
        
    }
    
    //组装路径
    //baseUrl + path
    function comboPath(){
        
    }

    //模块名 依赖 模块内容
    //此时的模块名 仍然和文件名保持一致  
    function define(module, deps, factory) {
        
        console.log("module22222==="+typeof module);     
        if (typeof module !== 'string') {
            if (deps !== undefined && factory === undefined) {
                factory = deps;
                deps = module;
            }
            module = getCurrentScript();
            var modName = module.slice(module.lastIndexOf("/")+1).replace(/\.js/,'');
        } else {
            //说明没有依赖 可以直接执行 factory
            if (deps === undefined && factory === undefined) {
                 //直接行 callback
                 factory = module;
                 module = getCurrentScript();
                 var modName = module.slice(module.lastIndexOf("/")+1).replace(/\.js/,'');
                 //factory = factory.toLowerCase() === 'jquery' ? jQuery : factory;
                 moduleCache[modName](factory);
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

    //第一步获取 baseUrl 
    function getBaseUrl(){
        return location.href.match(/\w+\:\d+/)[0];
    } 

    function getCurrentScript() {
        //取得正在解析的script节点
        if (document.currentScript) { //firefox 4+
            return document.currentScript.src;
        }
        // 参考 https://github.com/samyk/jiagra/blob/master/jiagra.js
        var stack;
        try {
            a.b.c(); //强制报错,以便捕获e.stack
        } catch (e) { //safari的错误对象只有line,sourceId,sourceURL
            stack = e.stack;
            if (!stack && window.opera) {
                //opera 9没有e.stack,但有e.Backtrace,但不能直接取得,需要对e对象转字符串进行抽取
                stack = (String(e).match(/of linked script \S+/g) || []).join(" ");
            }
        }
        if (stack) {
            /**e.stack最后一行在所有支持的浏览器大致如下:
             *chrome23:
             * at http://113.93.50.63/data.js:4:1
             *firefox17:
             *@http://113.93.50.63/query.js:4
             *opera12:
             *@http://113.93.50.63/data.js:4
             *IE10:
             *  at Global code (http://113.93.50.63/data.js:4:1)
             */
            stack = stack.split(/[@ ]/g).pop(); //取得最后一行,最后一个空格或@之后的部分
            stack = stack[0] == "(" ? stack.slice(1, -1) : stack;
            return stack.replace(/(:\d+)?:\d+$/i, ""); //去掉行号与或许存在的出错字符起始位置
        }
        var nodes = head.getElementsByTagName("script"); //只在head标签中寻找
        for (var i = 0, node; node = nodes[i++];) {
            if (node.readyState === "interactive") {
                return node.className = node.src;
            }
        }
    }


    //模块加载时的队列数据存储对象
    //存储modulename 和 callback
    var moduleCache = {};

    //存储配置的模块和路径
    var modulePaths = {};

    //加载模块
    function require(ids, callback) {
        console.log(location.href);  
        //模块标识 设为数组  
        ids = typeof ids === 'string' ? [ids] : module;
        
        //定义一个队列
        var queue = [];

        //遍历模块标识 找到 模块名和模块 url
        ids.forEach((ele) => {
            //根据模块标识 解析模块名和 模块 url                 
            var obj = resolvePath(ele);
            queue.push(obj);
            moduleCache[obj.name] = callback;
        });
        //开始加载模块  
        queue.forEach((e) => {
            loadModule(e);
        });
    }



    //加载模块
    function loadModule(module) {
        
        console.log(location.href); 

        //1.先获取baseUrl
        var baseUrl = getBaseUrl(); 

        console.log("baseUrl==="+location.href);

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
            if(module.name == 'jquery'){
                 moduleCache[module.name]($);  
            }
            alert("模块" + module.name + "加载完成 哈哈哈哈哈哈");
            //模块加载完成的话 其实可以去执行 define 函数
        };

        script.onerror = function() {
            script.onload = script.onerror = null;
            head.removeChild(script);
            script = null;
            //抛出异常
            throw new Error("[" + module.name + "] module failed to load, the url is" + module.path);
        }

        if (modulePaths[module.name]) {
            script.src = modulePaths[module.name] + ".js";
            console.log("script.src==="+script.src);
        } else {
            script.src = location.protocol+"//" + baseUrl + module.path + ".js";
        }

        head.insertBefore(script, head.firstChild);
    }


    //解析 path 
    function resolvePath(e) {
        
        var module_obj = {};

        var pathArr = e.split(/\//);
        
        var moduleArr = e.split(/\//);

         
         
        var module_path = e.replace(/^\.\//, '/');
        var module_name = e.slice(e.lastIndexOf("/") + 1);
        module_obj.name = module_name;
        module_obj.path = module_path;
        return module_obj;
        }
    }


    //定义一个配置函数
    window.require = require;
    // 可以给模块配置路径
    // 把配置的模块和路径存放到 modulePath中

    require.config = function(option) {
        var paths = option.paths;
        for (var i in paths) {
            modulePaths[i] = paths[i];
        }
        console.log(modulePaths);
    }

    window.define = define;
})(window);