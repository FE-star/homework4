!function (root) {

  function require(params) {
    if(Array.isArray(params)){
      params.map((param)=>{
        appendScript(param)
      })
    } else {
      if(typeof params == 'object'){
        for(var name in params){
          require._[name] = params.name
        }
      } else {
        console.log(15,params)
      }
    }
  }

  function appendScript(path) {
    console.log('path',path)
    const script = document.createElement('script')
    script.src = path
    script.onload = function () {
      const factory = require.stack.shift()
      let module
      if(typeof factory === 'function'){
        module = factory()
      } else {
        module = factory
      }
      require._[path] = module
      cb(module)
    }
    document.body.appendChild(script)
  }

  require.config = function (e) {
    return require(e)
  }

  require._ = {}
  require.stack = []

  function define(params) {
    console.log('define',params)
    require.stack.push(factory)
  }

  window.require = require
  window.define = define

}(window)