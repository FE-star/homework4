

// 主要就是两个函数 
// define  和 require
(function (global) {
     
  
   //模块名 依赖 模块内容
   //此时的模块名 仍然和文件名保持一致  
   function define(module, deps, factory){
        if(typeof module !== 'string'){
           if(deps !== undefined && factory === undefined){
                 factory = deps; 
                 deps = module;
           }
           module = getCurrentScript();
        }else{
           if(deps === undefined && factory === undefined){
              factory = function(){
                 return module;
              };
              deps = null;
           }
           module = getCurrentScript(); 
        }
   }

   
    function getCurrentScript(){
            var script, scripts, i, stack;
                
            // 标准浏览器(IE10、Chrome、Opera、Safari、Firefox)通过强制捕获错误(e.stack)来确定为当前运行的脚本
            // http://www.cnblogs.com/rubylouvre/archive/2013/01/23/2872618.html        
            try{
                // 运行一个不存在的方法强制制造错误
                makeerror();
            }
            // 捕获错误
            // safari的错误对象只有line,sourceId,sourceURL
            catch( e ){ 
                stack = e.stack;
            }
            
            if( stack ){        
                // 取得最后一行,最后一个空格或@之后的部分
                stack = stack.split( /[@ ]/g ).pop();
                // 去掉换行符
                stack = stack[0] === '(' ? stack.slice( 1, -1 ) : stack.replace( /\s/, '' );
                //去掉行号与或许存在的出错字符起始位置
                return stack.replace( /(:\d+)?:\d+$/i, '' ).match( rModId )[1];             
            }
            
            // IE6-8通过遍历script标签，判断其readyState为interactive来确定为当前运行的脚本
            scripts = head.getElementsByTagName( 'script' );
            i = scripts.length - 1;
            
            for( ; i >= 0; i-- ){
                script = scripts[i];
                if( script.className === modClassName && script.readyState === 'interactive' ){
                    break;
                }
            }        
            
            return script.src.match( rModId )[1];
    }       

   //模块加载时的队列数据存储对象
   //存储modulename 和 callback
   var moduleCache = {};
   
   //存储配置的模块和路径
   var modulePaths = {};
   
   //加载模块
   function require(module, callback){
       
       //切记要保存 callback
       //module 可能是数组 也可能是字符串
       //首先拿到模块标识的数组 
       var module_arr = typeof module === 'string' ? [module] : module;
       
       //定义一个队列
       //存放 
       var queue = [];
       //遍历模块标识 找到 模块名和模块 url
       module_arr.forEach((ele)=>{
           //根据模块标识 解析模块名和 模块 url                 
           var obj = resolvePath(ele);
           queue.push(obj);
           moduleCache[obj.name] = callback; 
       });   

       //开始加载模块  
       queue.forEach((e)=>{
            loadModule(e);
       });
   }

   
   
   //加载模块
   function loadModule(module){
        
        //1.先获取baseUrl
        var url = window.location.href;
        var baseUrl = url.slice(0,url.lastIndexOf("/")+1); 

        

        var script = document.createElement("script");
        var head = document.getElementsByTagName("head")[0];
        script.type = "text/javascript";
        script.async = "async";
        //脚本加载完毕以后
        script.onload = function(){
            script.onload = script.onerror = null;
            head.removeChild(script);
            script = null;
            //加载成功以后开始解析 
            alert("模块"+module.name + "加载完成 哈哈哈哈哈哈");
            
            //模块加载完成的话 其实可以去执行 define 函数

        };

        
        script.onerror = function(){
           script.onload = script.onerror = null;
           head.removeChild(script);
           script = null;
           //抛出异常
           throw new Error("["+module_obj.name+"] module failed to load, the url is" +module.path);
        }
        
          
        if(modulePaths[module.name]){
           script.src = modulePaths[module.name] + ".js"   
        }else{
           script.src = baseUrl + module.path + ".js";
        }  
        head.insertBefore(script,head.firstChild);
   } 


   //解析 path 
   function resolvePath(e){
      
      var module_obj = {};
      var module_path = e.replace(/^\.\//,'');
      var module_name = e.slice(e.lastIndexOf("/")+1);
      module_obj.name = module_name;
      module_obj.path = module_path;     
      
      return module_obj;
   }


   //定义一个配置函数
    
   
   window.require = require;
   
   // 可以给模块配置路径
   // 把配置的模块和路径存放到 modulePath中
   require.config = function(option){
       var paths = option.paths;
       for(var i in paths){
           modulePaths[i] = paths[i];     
       }

       console.log(modulePaths);   
   }

   window.define = define;


})(window);