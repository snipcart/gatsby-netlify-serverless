const https = require('https');

exports.handler = function(event, context, callback) {
    var id = event.queryStringParameters.id;
    var token = process.env.netlify_access_token;

    if(id == undefined){
        callback('A product id must be specified.', {
            statusCode: 500
        })
    }

    var options = {
        hostname: 'api.netlify.com',
        port: 443,
        method: 'GET',
        headers: {        
            'Content-Type': 'application/json'
        }
    };
    
    var queryToken = `access_token=${token}`;
    var opts1 = Object.assign({}, options, { path: `/api/v1/sites/${process.env.site_id}/forms?${queryToken}`});

    var req = https.request(opts1, function(res) {

        res.setEncoding('utf8');
        var body = "";

        res.on('data', data => {
            body += data;
        });

        res.on('end', function () {
            body = JSON.parse(body);

            var form = body.filter(x => x.name == `product-${id}`)[0];
            var opts2 = Object.assign({}, options, { path: `/api/v1/forms/${form.id}/submissions?${queryToken}`});

            var req2 = https.request(opts2, function(res2) {
                res2.setEncoding('utf8');         
                var body2 = "";

                res2.on("data", (data) => {
                    body2 += data;
                });

                res2.on('end', function () {
                    callback(null, {
                        statusCode: 200,
                        headers: {
                            "Access-Control-Allow-Origin" : "*",
                            'Content-Type': 'application/json'
                        },
                        body: body2
                    })
                });
            });

            req2.end();
        });
    });

    req.end();
}
