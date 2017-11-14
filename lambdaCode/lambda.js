"use strict";
exports.__esModule = true;
var https = require('https');
//Example POST method invocation 
var Client = require('node-rest-client').Client;
var client = new Client();
var hostname = "ec2-34-229-46-76.compute-1.amazonaws.com";
function handler(request, context) {
    console.log(JSON.stringify(request));
    if (request.directive.header.namespace === Namespaces.Discovery && request.directive.header.name === Names.Discover) {
        handleDiscovery(request, context);
    }
    else if (request.directive.header.namespace === Namespaces.Volume) {
        if (request.directive.header.name === Names.AdjustVolume) {
            handleVolume(request, context);
        }
    }
    else if (request.directive.header.namespace === Namespaces.Power) {
        handlePower(request, context);
    }
    else if(request.directive.header.namespace === Namespaces.Channel) {
        handleChannel(request, context);
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

    client.get('http://'+ hostname +':5000/get-devices', (data, res) => {
        
        response.event.payload.endpoints = data;
        request.directive.header.name = Names.DiscoverResponse;
        context.succeed(response);
    });
}

function handleVolume(request, context) {
    // get device ID passed in during discovery
    var endpointId = request.directive.endpoint.endpointId;
    // get user token pass in request
    var token = request.directive.endpoint.scope.token;
    // get the volume set
    var volume = request.directive.payload.volume;
    // at this point you should make the call to your device cloud for control 
    // stubControlFunctionToYourCloud(endpointId, token);
    // placeholder response that just issues a correct SetVolume response
    var args = {
        data: { deviceId: endpointId, direction: volume > 0 ? "UP" : "DOWN" },
        headers: { "Content-Type": "application/json" }
    };
    client.post('http://'+ hostname +':5000/volume', args, function (data, response) {
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
        context.succeed(response);
    });
}
;
function handlePower(request, context) {
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
    client.post('http://' + hostname + ':5000/power', args, function (data, response) {
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
        context.succeed(response);
    });
}

function handleChannel(request, context) {
    var endpointId = request.directive.endpoint.endpointId;
    var channel = request.directive.payload.channel.number;
    if(!channel) {
        channel = request.directive.payload.channelMetadata.name;
    }
    
    var args = {
        data: { deviceId: endpointId, channel: channel },
        headers: { "Content-Type": "application/json" }
    };
    
    client.post('http://' + hostname + ':5000/channel', args, function (data, response) {
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
                        namespace: Namespaces.Channel,
                        name: Names.ChannelResponse,
                        value: request.directive.payload.channel,
                        timeOfSample: new Date(),
                        uncertaintyInMilliseconds: 500
                    }]
            },
            event: {
                header: header,
                payload: {}
            }
        };
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
    Names["ChannelResponse"] = "channel"
    Names["ChangeChannel"] = "ChangeChannel";
    Names["Discover"] = "Discover";
    Names["AdjustVolume"] = "AdjustVolume";
    Names["TurnOn"] = "TurnOn";
    Names["TurnOff"] = "TurnOff";
    Names["PowerState"] = "powerState";
    Names["Muted"] = "muted";
})(Names = exports.Names || (exports.Names = {}));
