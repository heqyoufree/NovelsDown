/*
 * @Date: 2020-04-27 10:44:22
 * @Author: goEval
 * @LastEditors: goEval
 * @LastEditTime: 2020-05-08 10:20:38
 * @FilePath: \NovelsDown\downserver.js
 * @Github: https://github.com/heqyou_free
 */
const childprocess = require('child_process');
const program = require('commander');
const http = require('http');
const fs = require('fs');

program.version('1.0.0')
    .option('-p, --port [port]', 'port')
    .parse(process.argv);

let resp = fs.readFileSync('./downserver.html')+'<br>init';
const novels = [];
const port = program.port || 8888;

http.createServer((request, response) => {
  response.writeHead(200, {'Content-Type': 'charset=utf-8', 'Access-Control-Allow-Origin': '*'});
  if (!/\/\d+/.test(request.url.replace(/\/\d+/, ''))) {
    console.log(novels);
    for (let i = 0; i < novels.length; i++) {
      if (novels[i] === request.url.match(/\d+/)[0]) {
        resp += '<br>already started ' + request.url.match(/\d+/)[0];
        console.log('already started' + request.url.match(/\d+/)[0]);
        response.end(resp);
        return;
      }
    }
    novels.push(request.url.match(/\d+/)[0]);
    childprocess.fork('./downtxthtml.js', ['-c', '-b', request.url.match(/\d+/)[0]]);
    resp += '<br>started ' + request.url.match(/\d+/)[0];
    response.end(resp);
    console.log('started' + request.url.match(/\d+/)[0]);
    return;
  }
  console.log('request stats');
  response.end(resp);
}).listen(port);
http.createServer((request, response) => {
  let body = '';
  request.setEncoding('utf8');
  request.on('data', (chunk) => {
    body += chunk;
  });
  request.on('end', () => {
    resp += '<br>' + body;
  });
  response.end();
}).listen(7777);
console.log('Server running on http://0.0.0.0:' + port);
