/*
 * @Date: 2020-05-30 18:01:08
 * @Author: goEval
 * @LastEditors: goEval
 * @LastEditTime: 2020-06-20 08:35:23
 * @FilePath: \NovelsDown\worldwideserver.js
 * @Github: https://github.com/heqyou_free
 */

console.time('program');
const syncrequest = require('sync-request');
const cheerio = require('cheerio');
const program = require('commander');
const http = require('http');
const mime = require('mime');
const path = require('path');
const url = require('url');
const fs = require('fs');

program.version('1.0.0')
    .option('-p, --port [port]', 'port')
    .parse(process.argv);


const model = fs.readFileSync('./worldwidemodel.html');

const port = parseInt(process.env.PORT, 10) || (program.port || 8887);

const cachedFiles = ['layui.js', 'layui.css', 'layer.js', 'layer.css',
  'common.js', 'common.css', 'jquery.js', 'util.js'];

const modules = [];
fs.readdir('./worldwideplugins', (err, files) => {
  files.forEach((element) => {
    modules.push(require(`./worldwideplugins/${element}`));
  });
});

http.createServer((request, response) => {
  response.writeHead(200, {
    'Content-Type': mime.getType(path.extname(function() {
      const search = url.parse(request.url).search;
      return search ? request.url.slice(0, request.url.length - search.length) : request.url;
    }())) + ';charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  try {
    /**
     * main function
     */
    if (/\d+\/\d+\.html/.test(request.url)) {
      // use internet
      response.end(parseHtml(`${request.url}`), () => {
        console.log(`finish ${request.url}`);
      });
      return;
    }
    // cache files
    let cached = false;
    cachedFiles.forEach((element) => {
      if (request.url.indexOf(element) >= 0) {
        response.writeHead(200, {'Cache-Control': 'max-age=6000'});
        response.end(fs.readFileSync(`./res/${element}`), () => {
          console.log(`cached ${request.url}`);
        });
        cached = true;
      }
    });
    if (cached) return;
    console.log(`request ${request.url}`);
    // pass proxy
    const resq = syncrequest.default(request.method, `https://m.shuhaige.net${request.url}`);
    response.end(resq.body.toString());
    return;
  } catch (e) {
    response.writeHead(500);
    response.end(e.message);
    console.error(e);
  }
}).setTimeout(15000).listen(port);

console.log('Server running on http://0.0.0.0:' + port);
console.timeEnd('program');

/**
 * parse html
 * @param {string} url
 * @return {string}
 */
function parseHtml(url) {
  for (let index = 0; index < modules.length; index++) {
    const element = modules[index];
    if (element.identity === url.match(/(\w+)\/(\d+)\/(\d+)/)[1]) {
      let result = url.match(/(\w+)\/(\d+)\/(\d+)/);
      let identity = result[1];
      let bookid = result[2];
      let chapterid = result[3];
      let origin = srequest(`http://${element.domain}/`)
    }
  }
}

/**
 * sync request
 * @param {string} url url
 * @return {Response}
 */
function srequest(url) {
  console.log(`request ${url}`);
  let data;
  try {
    data = syncrequest.default('GET', url, {timeout: 10000, retry: true});
  } catch (e) {
    console.log(e);
    data = srequest(url);
  }
  return data;
}
