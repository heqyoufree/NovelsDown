/*
 * @Date: 2020-04-30 15:38:37
 * @Author: goEval
 * @LastEditors: goEval
 * @LastEditTime: 2020-05-08 14:47:57
 * @FilePath: \NovelsDown\historyserver.js
 * @Github: https://github.com/heqyou_free
 */
const fs = require('fs');
const url = require('url');
const http = require('http');
const program = require('commander');
const querystring = require('querystring');


program.version('1.0.0')
    .option('-p, --port [port]', 'port')
    .parse(process.argv);

const port = program.port || 8886;

if (!fs.existsSync('./history.json')) {
  fs.writeFileSync('./history.json', '{}');
}

const history = JSON.parse(fs.readFileSync('./history.json'));

http.createServer((request, response) => {
  response.writeHead(200, {'Content-Type': 'charset=utf-8', 'Access-Control-Allow-Origin': '*'});
  if (/book_\d+/.test(request.url)) {
    const articleid = request.url.match(/\d+/)[0];
    const arg = url.parse(request.url).query;
    const args = querystring.parse(arg);
    if (history[articleid]) {
      if (history[articleid].readid < args.readid) {
        history[articleid] = args;
      }
    } else {
      history[articleid] = args;
    }
    fs.writeFileSync('./history.json', JSON.stringify(history));
    response.end();
  }
  if (/visit/.test(request.url)) {
    response.end(JSON.stringify(history));
  }
  console.log(JSON.stringify(history));
}).setTimeout(20000, () => {
  console.log('timeout');
}).listen(port);
