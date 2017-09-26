  require.config({
    paths: {
      'jquery': 'https://cdn.bootcss.com/jquery/2.2.1/jquery',
    }
  })
  require(['./base/mod/a'], function (mod) {
    console.log(mod)
  })
  require(['./base/mod/b'], function (mod) {
    console.log(mod)
  })
  require(['jquery'], function ($) {
    console.log($('body').length)
  })
