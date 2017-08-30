!function (root) {
	var _head = document.getElementsByTagName('head')[0],
		_base,
		_path = {},
		_localBase,
		_require,
		DOT_REG = /\/\.\//g,// "/./"
		DOUBLE_DOT_REG = /\/[^\/]+\/\.\.\//, // "/**/../"
		DOUBLE_SLASH_REG = /([^:/])\/\//g; //"//"

  function _isFunction(fn){
    return typeof fn === 'function';
  }
  //not absolute path
  function _isUnnormalId(id){
    return (/^https?:|^file:|^\/|\.js$/).test(id);
  }
  function _isRelativePath(path){
    return (path + '').indexOf('.') === 0;
  }
  function _resolvePath(base, path){
    path = base.substring(0, base.lastIndexOf('/')+1) + path;
    path = path.replace(DOT_REG,'/');
    while(path.match(DOUBLE_DOT_REG)){
      path = path.replace(DOUBLE_DOT_REG, '/');
    }
    path.replace(DOUBLE_SLASH_REG, '$1/');
    return path;
  }
  var Cache = function(){
    var map = {};
    return {
      get: function(key){
        return map[key];
      },
      set: function(key,value){
        if (key in map) {
          return false;
        }
        map[key] = value;
        return true;
      }
    }
  }();
  function _normalize(base, id){
    //如果是绝对路径，直接return    
    if (_isUnnormalId(id)) {
      return id;
    }
    if (_isRelativePath(id)) {
      return _resolvePath(base, id) + '.js';
    }
    return id;
  }
  function Module(url){
    _isUnnormalId(url) || (url = _path[url]);
    Cache.set(url,this);
    this.path = url;
    this.status = 'pending';
    this.factory = null;
    this.deps = null;
    this.callbacks = {};
    this.load();
  }
  Module.prototype = {
    constructor: Module,
    on: function(event, cb){
      (this.callbacks[event] = this.callbacks[event] || []).push(cb);
      if(event === this.status && ~['completed','load'].indexOf(this.status) ) {
        cb(this);
      }
      if (event === this.status && event === 'error') {
        cb(this,this.error);
      }
    },
    fire: function(event, args){
      (this.callbacks[event] || []).forEach((callback)=>{
        callback.call(this, args);
      })
    },
    setStatus: function(status, info){
      if (this.status !== status) {
        this.status = status;
        switch(status){
          case 'loading':
            this.fire('loading');
          case 'completed':
            this.fire('completed');
          case 'error':
            this.fire('error', info)
            break;
          default:
            break;
        }
      }
    },
    load: function(){
      var node = document.createElement('script'),
        self = this;
      node.type = 'text/javascript';
      node.async = 'async';
      node.src = this.path;
      node.addEventListener('error', _onError, false);
      _head.appendChild(node);
      this.setStatus('loading');
      function _onError(err){
        node.removeEventListener('error', _onError, false);
        _head.removeChild(node);
        self.setStatus('error', 'load script failed:' + self.path);
      }

    },
    getExports: function(){
      if (this.status === 'completed') {
        // var module = {exports:{}};
        var depExports = this.deps.map((dep)=>{
          var mod = Cache.get(_normalize(this.path, dep));
          if (mod) {
            return mod.getExports();
          }
        })
        // var result = this.factory(...depExports, makeRequire({base: this.path}),module.exports, module);
        var result = this.factory(...depExports, makeRequire({base:this.path}));
        this.exports = result;
        this.getExports = function(){
          return this.exports;
        }
        return this.getExports();
      } else {
        return new Error('this module is not load completed yet.');
      }
    }
  }
  function getCurrentScript(){
    var doc = document;
    if (doc.currentScript) {
      return doc.currentScript.src;
    }
    var stack;
    try{
      //强制报错，以便补货出错对象
      a.b.c();
    }catch(e){
      //safari错误对象只有line，sourceId，sourceURL
      stack = e.stack;
      if (!stack && window.opera) {
        //opera 9没有e.stack，但有e.Backtrace，但不能直接取得，需要对e对象转字符串抽取
        stack = (String(e).match(/of linked script \S+/g) || []).join(" ");
      }
    }
    if (stack) {
      /*
      *e.stack最后一行在所有浏览器的支持如下：
      *chrome23：
      * at http://1.1.1.1/data.js:4:1
      *firefox17:
      *@http://1.1.1.1/data.js:4
      *opera12:
      *@http://1.1.1.1/data.js:4
      *IE10:
      * at Global code (http://1.1.1.1/data.js:4:1)
      */
      //获取最后一行@和空格后的部分
      stack = stack.split(/[@ ]/g).pop();
      //去掉IE10的（）
      stack = stack[0]=="("?stack.slice(1,-1):stack;
      //去掉行尾的出错行号
      return stack.replace(/(:\d+)?:\d+$/i,'');
    }
    var nodes = _head.getElementsByTagName("script");
    for(var i = 0, node; node = nodes[i++];){
      if (node.readyState === 'interactive') {
        return node.className = node.src;
      }
    }
  }
  function config(opts){
    _base = opts.base === undefined? _base: opt.base;
    _path = opts.paths || {};
  }
  function load(url){
    return new Promise((resolve, reject)=>{
      var mod = Cache.get(url) ||  new Module(url);
      mod.on('completed', ()=>{
        resolve(mod.getExports());
      });
      mod.on('error', reject);
    })
  }
  function makeRequire(opts){
    var {base} = opts;
    function _r(dep, succ){
      if (succ) {
        var deps = dep;
        if(!Array.isArray(dep)){
          deps = [dep];
        }
        Promise.all(deps.map((dep)=>{
          return load(_normalize(base, dep));
        })).then((list)=>{
          if(typeof succ === 'function'){
            succ.apply(root,list);
          }
        }).catch((err)=>{
          throw new Error(err);
        });
      } else {
        //require('a')形式
        dep = _normalize(base, dep);
        var mod = Cache.get(dep);
        if (!mod) {
          throw new Error('cannot get module by id:' + dep);
        } else {
          return mod.getExports();
        }
      }
    }
    return _r;
  }
  function require() {
  	if (_require){
  		return _require.apply(root, arguments);
  	}
    if (_base) {
      _require = makeRequire({base: _base});
      _localBase = location.href;
    } else {
      _require = makeRequire({base: location.href});
    }
    return _require.apply(root, arguments);

  }
  //define([deps],fn), define(fn), define('name', [deps], fn)
  function define(name, deps, factory) {
    var id = getCurrentScript(),
      mod = Cache.get(id);
    if (!factory) {
      //define([deps], fn)
      if (deps) {
        // Object.assign(_path,{[name]:id});
        if (_isFunction(deps)) {
          factory = deps;
        } else {
          var tmp = deps;
          factory = function(){
            return tmp;
          }
        }
        deps = name;
      } else {
        //define(fn)
        if (_isFunction(name)) {
          factory = name;
        } else {
          var tmp = name;
          factory = function(){
            return tmp;
          }
        }
        deps = [];
      }
    }
    if (!Array.isArray(deps)) {
      deps = [deps];
    }
    mod.deps = deps;
    mod.factory = factory;
    if (deps.length) {
      Promise.all(deps.map((dep)=>{
        return new Promise((resolve, reject)=>{
          dep = _normalize(id, dep);
          var depModule = Cache.get(dep) || new Module(dep);
          depModule.on('completed', ()=>{
            resolve(depModule.getExports());
          });
          depModule.on('error', reject);
        })
      })).then(()=>{
        mod.setStatus('completed');
      }).catch((err)=>{
        mod.setStatus('error', err);
      })
    }else {
      mod.setStatus('completed');
    }

  }

  root.require = require;
  require.config = config;
  root.define = define;
  define.amd = true;
}(window)