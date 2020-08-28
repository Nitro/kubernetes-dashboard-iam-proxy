const expect    = require("chai").expect;
const tokenlib = require("../public/javascripts/tokenlib");
const moment = require('moment');

describe("login token creation", function() {
  it("creates a signed base64 encoded token", function() {
    var accesskey = "XYZ"
    var secretkey = "UVW"
    var encrypted_token = "XYZUVW"
    console.log(get_bearer_token(accesskey,secretkey,"mycluster"))
    expect(accesskey+secretkey).to.equal(encrypted_token)
  });
});
