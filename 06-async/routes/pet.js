var r = require('request').defaults({
    json: true
});

var async = require('async');
var _ = require('lodash');

module.exports = function(app) {
    
    /* Read */
    app.get('/pets', function (req, res) {

        async.parallel({
            cat: function(callback){
                r({uri: 'http://localhost:3000/cat'}, function(error, response, body) {
                    if (error) {
                        callback({service: 'cat', error: error});
                        return;
                    };
                    if (!error && response.statusCode === 200) {
                        callback(null, body);
                    } else {
                        callback(response.statusCode);
                    }
                });
            },
            dog: function(callback){
                r({uri: 'http://localhost:3001/dog'}, function(error, response, body) {
                    if (error) {
                        callback({service: 'dog', error: error});
                        return;
                    };
                    if (!error && response.statusCode === 200) {
                        callback(null, body);
                    } else {
                        callback(response.statusCode);
                    }
                });
            },
            bird: function(callback){
                r({uri: 'http://localhost:3004/bird'}, function(error, response, body) {
                    if (error) {
                        callback({service: 'bird', error: error});
                        return;
                    };
                    if (!error && response.statusCode === 200) {
                        callback(null, body);
                    } else {
                        callback(response.statusCode);
                    }
                });
            }
        },
        function(error, results) {

            var names = {};

            var aggregateNames = function(pet) {
                if (!names[pet.name]) {
                    names[pet.name] = 0;
                }

                names[pet.name] += 1;
            };

            _.each(results.cat.data, aggregateNames);
            _.each(results.dog.data, aggregateNames);
            _.each(results.bird.data, aggregateNames);

            res.json({
                error: error,
                info: 'pets found successfully',
                results: results,
                names: names
            });
        });
    });
};
