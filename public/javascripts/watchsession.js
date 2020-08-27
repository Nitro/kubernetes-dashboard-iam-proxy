window.addEventListener('load', function () {
  var checkCookie = (function () {
    var lastCookie = document.cookie // 'static' memory between function calls
    return function () {
      var currentCookie = document.cookie
      var list = {}
      currentCookie.split(';').forEach(function (cookie) {
        var parts = cookie.split('=')
        list[parts.shift().trim()] = decodeURI(parts.join('='))
      })
      if (currentCookie !== lastCookie && !list.jweToken) { // session is not set so show login page
        window.location = window.location.origin
      }
      lastCookie = currentCookie // store latest cookie
    }
  }())
  window.setInterval(checkCookie, 100) // run every 100 ms
})
