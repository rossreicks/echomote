"use strict";
exports.__esModule = true;
var https = require('https');
//Example POST method invocation 
var Client = require('node-rest-client').Client;
var client = new Client();
function handler(request, context) {
    if (request.directive.header.namespace === Namespaces.Discovery && request.directive.header.name === Names.Discover) {
        handleDiscovery(request, context);
    }
    else if (request.directive.header.namespace === Namespaces.Volume) {
        if (request.directive.header.name === Names.SetVolume) {
            handleSetSpeakerVolumeControl(request, context);
        }
    }
    else if (request.directive.header.namespace === Namespaces.Power) {
        if (request.directive.header.name === Names.TurnOn) {
            handlePowerOn(request, context);
        }
        else if (request.directive.header.name === Names.TurnOff) {
            handlePowerOff(request, context);
        }
    }
}
exports.handler = handler;
;
function handleDiscovery(request, context) {
    var response = {
               event: {
                  header: {
                     namespace: "Alexa.Discovery",
                     name: "Discover.Response",
                     payloadVersion: "3",
                     messageId: "5f8a426e-01e4-4cc9-8b79-65f8bd0fd8a4"
                  },
                  payload:{}
               }
            };

    var endpoints = [];
    client.get('http://ec2-54-91-55-49.compute-1.amazonaws.com:5000/get-devices', (data, res) => {
        for(var i = 0; i < data.length; i++) {
            endpoints.push(appendStaticData(data[i]));
        }
        
        response.event.payload.endpoints = endpoints;
        console.log(response);
        var header = request.directive.header;
        header.name = Names.DiscoverResponse;
        console.log('DEBUG', 'Discovery Response: ' + JSON.stringify({ header: header, payload: response }));
        context.succeed(response);
    });
}

function appendStaticData(endpoint) {
    endpoint.displayCategories = [];
    endpoint.isReachable =  true;
    endpoint.cookie = {};
    endpoint.capabilities = [
        {
            "interface": "Alexa.Speaker",
            "version": "1.0",
            "type": "AlexaInterface",
            "properties": {
                "supported": [
                    {
                        "name": "volume"
                    },
                    {
                        "name": "muted"
                    }
                ]
            }
        },
        {
             "type":"AlexaInterface",
             "interface":"Alexa.ChannelController",
             "version":"1.0",
             "properties":{
                "supported":[
                   {
                      "name":"channel"
                   }
                ]
             }
          },
        {
            "interface": "Alexa.PowerController",
            "version": "1.0",
            "type": "AlexaInterface"
        },
        {
            "interface": "Alexa.Input",
            "version": "1.0",
            "type": "AlexaInterface"
        },
        {
            "type":"AlexaInterface",
            "interface":"Alexa.InputController",
            "version":"1.0",
            "properties":{
                "supported":[
                {
                    "name":"input"
                }
                ]
            }
        }
    ];
    endpoint.manufacturerName = "Senior Design Dec2017";

    return endpoint;
}
function handleSetSpeakerVolumeControl(request, context) {
    // get device ID passed in during discovery
    var endpointId = request.directive.endpoint.endpointId;
    // get user token pass in request
    var token = request.directive.endpoint.scope.token;
    // get the volume set
    var volume = request.directive.payload.volume;
    // at this point you should make the call to your device cloud for control 
    // stubControlFunctionToYourCloud(endpointId, token);
    // placeholder response that just issues a correct SetVolume response
    var header = request.directive.header;
    header.name = Names.Response;
    header.namespace = Namespaces.Response;
    var response = {
        context: {
            properties: [{
                    namespace: Namespaces.Volume,
                    name: Names.PowerState,
                    value: volume,
                    timeOfSample: new Date(),
                    uncertaintyInMilliseconds: 500
                },
                {
                    namespace: Namespaces.Volume,
                    name: Names.Muted,
                    value: false,
                    timeOfSample: new Date(),
                    uncertaintyInMilliseconds: 500
                }]
        },
        event: {
            header: header,
            payload: {
                volume: volume,
                muted: false
            }
        }
    };
    console.log('DEBUG', 'Alexa.Speaker SetVolume Response: ' + JSON.stringify(response));
    context.succeed(response);
}
;
function handlePowerOff(request, context) {
    // get device ID passed in during discovery
    var endpointId = request.directive.endpoint.endpointId;
    // get user token pass in request
    var token = request.directive.endpoint.scope.token;
    // at this point you should make the call to your device cloud for control 
    //Post('/power', {deviceId: endpointId, powerState: "OFF"});
    // set content-type header and data as json in args parameter 
    var args = {
        data: { deviceId: endpointId },
        headers: { "Content-Type": "application/json" }
    };
    client.post('http://ec2-54-91-55-49.compute-1.amazonaws.com:5000/power', args, function (data, response) {
        // parsed response body as js object 
        console.log(data);
        // raw response 
        console.log(response);
        // placeholder response that just issues a correct SetVolume response
    var header = request.directive.header;
    header.name = Names.Response;
    header.namespace = Namespaces.Response;
    var response = {
        context: {
            properties: [{
                    namespace: Namespaces.Power,
                    name: Names.PowerState,
                    value: "OFF",
                    timeOfSample: new Date(),
                    uncertaintyInMilliseconds: 500
                }]
        },
        event: {
            header: header,
            payload: {}
        }
    };
    console.log('DEBUG', Namespaces.Power + Names.PowerState + 'Response: ' + JSON.stringify(response));
    context.succeed(response);
    });
}
function handlePowerOn(request, context) {
    // get device ID passed in during discovery
    var endpointId = request.directive.endpoint.endpointId;
    // get user token pass in request
    var token = request.directive.endpoint.scope.token;
    // at this point you should make the call to your device cloud for control 
    // stubControlFunctionToYourCloud(endpointId, token);
    // placeholder response that just issues a correct SetVolume response
    var args = {
        data: { deviceId: endpointId },
        headers: { "Content-Type": "application/json" }
    }
    client.post('http://ec2-54-91-55-49.compute-1.amazonaws.com:5000/power', args, function (data, response) {
        var header = request.directive.header;
        header.name = Names.Response;
        header.namespace = Namespaces.Response;
        var response = {
            context: {
                properties: [{
                        namespace: Namespaces.Power,
                        name: Names.PowerState,
                        value: "ON",
                        timeOfSample: new Date(),
                        uncertaintyInMilliseconds: 500
                    }]
            },
            event: {
                header: header,
                payload: {}
            }
        };
        console.log('DEBUG', Namespaces.Power + Names.PowerState + 'Response: ' + JSON.stringify(response));
        context.succeed(response);
    });
}
var Namespaces;
(function (Namespaces) {
    Namespaces["Volume"] = "Alexa.Speaker";
    Namespaces["Power"] = "Alexa.PowerController";
    Namespaces["Channel"] = "Alexa.ChannelController";
    Namespaces["Input"] = "Alexa.InputController";
    Namespaces["Response"] = "Alexa";
    Namespaces["Discovery"] = "Alexa.Discovery";
})(Namespaces = exports.Namespaces || (exports.Namespaces = {}));
var Names;
(function (Names) {
    Names["SelectInput"] = "SelectInput";
    Names["Response"] = "Response";
    Names["DiscoverResponse"] = "Discover.Response";
    Names["Discover"] = "Discover";
    Names["SetVolume"] = "SetVolume";
    Names["TurnOn"] = "TurnOn";
    Names["TurnOff"] = "TurnOff";
    Names["PowerState"] = "powerState";
    Names["Muted"] = "muted";
})(Names = exports.Names || (exports.Names = {}));
function Post(url, data) {
    //url = 'http://ec2-54-91-55-49.compute-1.amazonaws.com:5000' + url;
    // var options = {
    //     url: url,
    //     method: "POST",
    //     headers: {"Content-type": "application/json"},
    //     form: data
    // }
    // request(options, function(error, response, body) {
    //     if(!error && response.statusCode == 200) {
    //         console.log('request sent');
    //     }
    // })
    // Build the post string from an object
    var post_data = JSON.stringify(data);
    console.log(post_data);
    // An object of options to indicate where to post to
    var post_options = {
        host: 'http://ec2-54-91-55-49.compute-1.amazonaws.com',
        port: '5000',
        path: url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': post_data,
            'deviceID': post_data
        },
        body: post_data
    };
    var post_request = https.request(post_options, function (res) {
        var body = '';
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('end', function () {
            console.log(body);
        });
        res.on('error', function (e) {
            console.log(e);
        });
    });
    // post the data
    post_request.write(post_data);
    post_request.end();
}
