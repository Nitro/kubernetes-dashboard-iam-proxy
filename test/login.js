const expect = require('chai').expect
const request = require('request')
global.appConfig = require('../config/default')

describe('Proxy login page', function () {
  it('should return the login UI', function (done) {
    request('http://localhost:8888', function (error, response, body) {
      if (error) {
        done(error)
      }
      expect(body).to.include('<p class="text">Kubernetes Dashboard</p>')
      done()
    })
  })
  it('should respond with code 200', function (done) {
    request('http://localhost:8888', function (error, response, body) {
      if (error) {
        done(error)
      }
      expect(response.statusCode).to.equal(200)
      done()
    })
  })
})
