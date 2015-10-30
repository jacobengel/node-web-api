var r = require('request').defaults({
    json: true
});


module.exports = function(app) {

    _pets = [];

    /* Read */
    app.get('/pets', function(req, res) {

        r({uri: 'http://localhost:3001/dog'}, extractPets);

        r({uri: 'http://localhost:3000/cat'}, extractPets);

        res.json(_pets);

        _pets = [];
    });

    extractPets = function(error, response, body) {
        if (!error && response.statusCode === 200) {
            for (i = 0; i < body.data.length; i++)
            {
                _pets.push(body.data[i]);
            }
        } else {
            response.send(response.statusCode);
        }
    }
};
