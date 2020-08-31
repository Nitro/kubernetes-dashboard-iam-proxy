const expect    = require("chai").expect;
const moment = require('moment');
const CryptoJS = require('crypto-js');
const TokenLib = require("../../public/javascripts/tokenlib");

describe("login token creation", function() {
  it("creates a signed base64 encoded token", function() {
    var accesskey = "XYZ"
    var secretkey = "UVW"
    var encrypted_token = "XYZUVW"
    TokenLib.moment = moment
    TokenLib.cryptojs = CryptoJS
    console.log(TokenLib.get_bearer_token(accesskey,secretkey,"mycluster"))
    expect(accesskey+secretkey).to.equal(encrypted_token)
  });
});
