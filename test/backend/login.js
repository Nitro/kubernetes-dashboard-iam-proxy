const expect    = require("chai").expect;
const request = require('request');
global.appConfig = require('../../config/default')

describe("Proxy login page", function() {
  it('Login page content', function(done) {
    request('http://localhost:8888' , function(error, response, body) {
      expect(body).to.include('<p class="text">Kubernetes Dashboard</p>');
      done();
    });
  });
  it('Login page status', function(done) {
    request('http://localhost:8888' , function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });
  });
});

describe("Proxy login action success", function() {
  it('Login page content', function(done) {
     global.appConfig.upstreamDashboard.url = ''
    request.post('http://localhost:8888/' , function(error, response, body) {
      expect(body).to.include('<p class="text">Kubernetes Dashboard</p>');
      done();
    });
  });
  it('Login page status', function(done) {
    request('http://localhost:8888' , function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });
  });
});
