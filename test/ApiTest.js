var sails = require('sails');
var supertest = require('supertest');
var shajs = require('sha.js');
var password = shajs('sha256').update('taximo_api_user').digest('hex');

before(function (done) {

    this.timeout(5000);

    sails.lift({}, function (err, server) {
        if (err) returndone(err);
        done(err, server);
    });
});

//Init Test
describe("Mocha Unit Test", function () {
    describe("Create in DB and calculate the time", function () {
        it("should create minimun time and return success and time", function (done) {
            var agent = supertest.agent(sails.hooks.http.app);
            agent.get("/synchronous_shopping?parameters=5,5,5&shoping_centers=1,1-1,2-1,3-1,4-1,5&roads=1,2,10-1,3,10-2,4,10-3,5,10-4,5,10")
                .auth('taximo_api_user', password)
                .expect(200, {
                    "succes": true,
                    "minimum_time": 30
                } ,done);
        });
        it("should return bad request", function (done) {
            var agent = supertest.agent(sails.hooks.http.app);
            agent.get("/synchronous_shopping?parameters=&shoping_centers=1,1-1,2-1,3-1,4-1,5&roads=1,2,10-1,3,10-2,4,10-3,5,10-4,5,10")
                .auth('taximo_api_user', password)
                .expect(400,'"Validate your input"',done);
        });
        it("should not found page", function (done) {
            var agent = supertest.agent(sails.hooks.http.app);
            agent.get("/test")
                .expect(404, done)
        });
    });
});

after(function (done) {
    if (sails && _.isFunction(sails.lower)) {
        sails.lower(done);
    }
});