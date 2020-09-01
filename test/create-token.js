const expect    = require("chai").expect;
const moment = require('moment');
const CryptoJS = require('crypto-js');
const TokenLib = require("../public/javascripts/tokenlib");

describe("login token creation", function() {
  it("creates a signed base64 encoded token", function() {
    let accesskey = "myaccesskey"
    let secretkey = "mysecretkey"
    let clustername = "mycluster"
    TokenLib.moment = moment
    TokenLib.cryptojs = CryptoJS
    TokenLib.AMZDATE = '20200831'
    TokenLib.DATESTAMP = '20200831T172523Z'
    let encryptedtoken = 'k8s-aws-v1.aHR0cHM6Ly9zdHMuYW1hem9uYXdzLmNvbS8_QWN0aW9uPUdldENhbGxlcklkZW50aXR5JlZlcnNpb249MjAxMS0wNi0xNSZYLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPW15YWNjZXNza2V5JTJGMjAyMDA4MzFUMTcyNTIzWiUyRnVzLWVhc3QtMSUyRnN0cyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjAwODMxJlgtQW16LUV4cGlyZXM9NjAmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JTNCeC1rOHMtYXdzLWlkJlgtQW16LVNpZ25hdHVyZT1jMWRlYWVmNTdhMjgxOWQ2Nzc1ZjNlZTUwYWI2OTVjZjdlNDk1ZmEyMDkwMDU1MDI2YjA1Njk4YjJmMTg5NTFl'
    expect(TokenLib.get_bearer_token(accesskey,secretkey,clustername)).to.equal(encryptedtoken)
  });
});
