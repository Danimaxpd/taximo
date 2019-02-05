/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */
var auth = require('http-auth');
var shajs = require('sha.js');

var basic = auth.basic({
  realm: 'admin area'
}, function (username, password, onwards) {
  var psh256 = shajs('sha256').update('taximo_api_user').digest('hex');
  return onwards(username === 'taximo_api_user' && password === psh256);
});

module.exports.policies = {
  '*': [true],
  // Prevent end users from doing CRUD operations on products reserved for admins
  // (uses HTTP basic auth)
  'synchronousshopping/*': [auth.connect(basic)],
};
