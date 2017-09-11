!function (root) {

  function require(params,cb) {
    console.log(5,'params',params,'cb',cb)
    if(Array.isArray(params)){
      params.map((param)=>{
        if(require._[param]){
          appendScript(require._[param],cb)
        } else {
          appendScript(param,cb)
        }
      })
    } else if(typeof params == 'object'){
      for(var name in params.paths){
        require._[name] = params.paths[name]
      }
    }else{
      return
    }
  }

  function appendScript(path,cb) {
    //console.log(23,'path',path,'cb',cb)
    //appendScript(require._[param],cb)
    const script = document.createElement('script')

    script.src = path

    script.onload = function () {

      const factory = require.stack.shift()

      //console.log('factory',factory)

      let module

      if(typeof factory === 'function'){

        module = factory()

      } else if(typeof factory === 'object'){

        module = factory.callbak

        require(factory.deps,function (res) {

          cb(module(res))

        })

        return

      }else if(!factory) {

        cb(window.$)

        return

      }else {

        module = factory

      }

      cb(module)

    }

    document.body.appendChild(script)

  }

  require.config = function (e) {
    return require(e)
  }

  require._ = {}
  require.stack = []


  function define(deps,callbak) {
    //console.log(54,'deps',deps,'define',callbak)
    if(!Array.isArray(deps)){
      require.stack.push(deps)
    }else{
      require.stack.push({deps:deps, callbak:callbak})
    }
  }

  window.require = require
  window.define = define

}(window)
