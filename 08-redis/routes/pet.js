var r = require('request').defaults({
    json: true
});

var redis = require('redis');

var async = require('async');

var client = redis.createClient(6379, '127.0.0.1');

module.exports = function(app) {

    /* Read */
    app.get('/catname/:id', function (req, res) {

        client.get(req.params.id, function(error, cat) {
            if (error) {throw error;};
            if (cat) {
                res.json(JSON.parse(cat));
            } else {
                r({uri: 'http://localhost:3000/cat/' + req.params.id}, function(error, response, body) {
                    if (error) {throw error;return};
                    if (!error && response.statusCode === 200) {
                        res.json(body);
                        client.set(req.params.id, JSON.stringify(body), function (error) {
                            if (error) {throw error;};
                        });
                    } else {
                        res.send(response.statusCode);
                    }
                });
            }
        });

    });

    app.get('/pets', function (req, res) {

        async.parallel({
            cat: function(callback){
                client.get('cats', function(error, cats) {
                    if (error) {callback(error);};
                    if (cats) {
                        callback(null, JSON.parse(cats));
                    } else {
                        r({uri: 'http://localhost:3000/cat'}, function(error, response, body) {
                            if (error) {
                                callback({service: 'cat', error: error});
                                return;
                            };
                            if (!error && response.statusCode === 200) {
                                callback(null, body);
                                client.set('cats', JSON.stringify(body), function(error) {
                                    if (error) {callback(error);};
                                });
                            } else {
                                callback(response.statusCode);
                            }
                        });
                    }
                });
            },
            dog: function(callback){
                client.get('dogs', function(error, dogs) {
                    if (error) {callback(error);};
                    if (dogs) {
                        callback(null, JSON.parse(dogs));
                    } else {
                        r({uri: 'http://localhost:3001/dog'}, function(error, response, body) {
                            if (error) {
                                callback({service: 'dog', error: error});
                                return;
                            };
                            if (!error && response.statusCode === 200) {
                                callback(null, body);
                                client.set('dogs', JSON.stringify(body), function(error) {
                                    if (error) {callback(error);};
                                });
                            } else {
                                callback(response.statusCode);
                            }
                        });
                    }
                });
            }
        },
        function(error, results) {
            res.json({
                error: error,
                results: results
            });
        });

    });

};


// client.setex(req.params.id, 10, JSON.stringify(body), function (error) {
// sets cached value with expiration
