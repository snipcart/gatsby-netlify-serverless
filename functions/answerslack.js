var https = require("https");
var qs = require('querystring')

function getURL(href) {
    var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
    return match && {
        href: href,
        protocol: match[1],
        host: match[2],
        hostname: match[3],
        port: match[4],
        pathname: match[5],
        search: match[6],
        hash: match[7]
    }
}

exports.handler = function(event, context, callback) {
    var json = JSON.parse(qs.parse(event.body).payload);

    var answer = json.actions[0].value;
    var access_token = process.env.netlify_access_token;
    var id = json.original_message.attachments[0].text;
    
    if(answer == 'reject'){
        var options = {
            hostname: 'api.netlify.com',
            port: 443,
            path: `/api/v1/submissions/${id}?access_token=${access_token}`,
            method: 'DELETE',
            headers: {        
                'Content-Type': 'application/json'
            }
        };
    
        var req1 = https.request(options, function(res) {

            res.setEncoding('utf8');
            
            res.on('end', function () {
                console.log(`Review with id: ${id} was deleted successfully.`)
            });
        });
        
        req1.on('error', function (e) {
            console.log('Problem with request:', e.message);
        });

        req1.end(); 
    }

    var postData  = JSON.stringify({
        replace_original: true,
        attachments: [{
            text: answer == 'keep'
                ? `The review (${id}) was approved!`
                : `The review (${id}) was rejected.`
        }]
    });

    var url = getURL(json.response_url);

    var options = {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {        
            'Content-Type': 'application/json'
        }
    };

    var req = https.request(options, function(res) {

        res.setEncoding('utf8');
        
        res.on('end', function () {
            callback(null, {
                statusCode: 200
            })
        });
    });
    
    req.on('error', function (e) {
        console.log('Problem with request:', e.message);
    });

    req.write(postData);
    req.end();

    callback(null, {
        statusCode: 200
    })    
}
