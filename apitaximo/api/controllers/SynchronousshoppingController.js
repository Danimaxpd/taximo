/**
 * SynchronousshoppingController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    /**
    * Function to save data and resulst in database.
    */
    process: function(request, response){
        //Use model and create a record
        Synchronousshopping.create(request.allParams())
            .then(function(Synchronousshopping){
                return response.send({
                    'succes':true,
                    'minimum_time':':V'
                })
            })
            .catch(function(err){
                sails.log.debug(err)
                return response.send({
                    'succes':false,
                    'minimum_time':'error'  
                })
            })
    }
};

