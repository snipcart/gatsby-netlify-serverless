var https = require("https");

exports.handler = function(event, context, callback) {
    var body = JSON.parse(event.body);

    if(body != null && body.data != null){
        var data = body.data;

        var message = `New review from ${data.email} \n ${data.name}: ${data.message}`;
        var attach = [
            {
                "title": "Review ID",
                "text": body.id
            },
            {
                "title": "Do you want to keep the review?",
                "text": message,
                "fallback": "You can't take actions for this review.",
                "callback_id": "answer_netlify",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                    {
                        "name": "response",
                        "text": "Keep",
                        "type": "button",
                        "value": "keep"
                    },
                    {
                        "name": "response",
                        "text": "Reject",
                        "type": "button",
                        "style": "danger",
                        "value": "reject",
                        "confirm": {
                            "title": "Are you sure?",
                            "text": "Once it's done the review will be deleted",
                            "ok_text": "Yes",
                            "dismiss_text": "No"
                        }
                    }
                ]
            }
        ]

        var postData = JSON.stringify({
            attachments: attach
        });

        var options = {
            hostname: 'hooks.slack.com',
            port: 443,
            path: process.env.slack_webhook_url,
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
}