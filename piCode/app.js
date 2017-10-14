const WebSocket = require('ws');
const { exec } = require('child_process');

exec("cat /proc/cpuinfo | grep Serial | cut -d ' ' -f 2", (err, stdout, stderr) => {
    if(err) {
        console.error(err);
        return;
    }

    const ws = new WebSocket('ws://ec2-54-91-55-49.compute-1.amazonaws.com:3000?id='+stdout.replace(/(\r\n|\n|\r)/gm,""));
    
    ws.on('message', (message) => {
        console.log(message);
    });
})

