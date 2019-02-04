/**
 * Synchronousshopping.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    parameters: { type: 'string', required: true },
    shoping_centers: { type: 'string', required: true },
    roads: { type: 'string', required: true },
    result: {type:'number', required:false}
  },

};

