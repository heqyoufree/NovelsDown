/*
 * @Date: 2020-05-30 18:01:08
 * @Author: goEval
 * @LastEditors: goEval
 * @LastEditTime: 2020-05-31 08:46:16
 * @FilePath: \NovelsDown\bqgserver.js
 * @Github: https://github.com/heqyou_free
 */

console.time('program');
const childprocess = require('child_process');
const syncrequest = require('sync-request');
const querystring = require('querystring');
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

let resp = fs.readFileSync('./downserver.html') + '<br>init';

let model = fs.readFileSync('./worldwidemodel.html');

const port = parseInt(process.env.PORT, 10) || (program.port || 8887);

const cachedFiles = ['layui.js', 'layui.css', 'layer.js', 'layer.css',
  'common.js', 'common.css', 'jquery.js', 'util.js'];

const history = JSON.parse(fs.readFileSync('./history.json'));

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
      response.end(parseHtml(`https://m.biquge.se${request.url}`), () => {
        console.log(`finish ${request.url}`);
      });
      return;
    }
    // /**
    //  * history server
    //  */
    // // update history
    // if (/book_\d+/.test(request.url)) {
    //   console.log('update history');
    //   const articleid = request.url.match(/\d+/)[0];
    //   const arg = url.parse(request.url).query;
    //   const args = querystring.parse(arg);
    //   if (history[articleid]) {
    //     if (history[articleid].readid <p args.readid) {
    //       history[articleid] = args;
    //     }
    //   } else {
    //     history[articleid] = args;
    //   }
    //   fs.writeFileSync('./history.json', JSON.stringify(history));
    //   response.end('success');
    //   return;
    // }
    // // response history
    // if (/visit/.test(request.url)) {
    //   console.log('request history');
    //   response.end(JSON.stringify(history));
    //   return;
    // }
    // /**
    //  * down server
    //  */
    // // start down novel
    // if (/\/down\/\d+/.test(request.url)) {
    //   childprocess.fork('./downtxthtml.js', ['-c', '-b', request.url.match(/\d+/)[0]]);
    //   resp += '<br>started ' + request.url.match(/\d+/)[0];
    //   response.end(resp);
    //   console.log('started' + request.url.match(/\d+/)[0]);
    //   return;
    // }
    // // check down novels stats
    // if (/stats/.test(request.url)) {
    //   resp += '<br>request stats';
    //   console.log('request stats');
    //   response.end(resp);
    //   return;
    // }
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
    const resq = syncrequest.default(request.method, `https://m.biquge.se${request.url}`);
    response.end(resq.body.toString());
    return;
  } catch (e) {
    response.writeHead(500);
    response.end(e.message);
    console.error(e.message);
  }
}).setTimeout(15000).listen(port);
// http.createServer((request, response) => {
//   const arg = url.parse(request.url).query;
//   const args = querystring.parse(arg);
//   resp += '<br>' + args.d;
//   response.end();
// }).listen(7777);

console.log('Server running on http://0.0.0.0:' + port);
console.timeEnd('program');

/**
 * parse html
 * @param {string} url
 * @return {string}
 */
function parseHtml(url) {
  const $ = cheerio.load(srequest(url).body.toString());
  const _ = cheerio.load(model);
  _('title').text($('title').text());
  _('body').attr('article-id', $('#pt_mulu').attr('href').replace(/\//g, ''));
  _('body').attr('chapter-id', $('#pt_mulu').attr('href').replace(/\//g, ''));
  _('body').attr('data-id', $('#pt_mulu').attr('href').replace(/\//g, ''));
  _('#bookname').text($('td').eq(1).text());
  _('#author').text(function() {
    let result = '';
    $('meta').each((i, e) => {
      if ($(e).attr('name') === 'description') {
        result = $(e).attr('content').match(/笔趣阁提供了.*创作的/)[0];
      }
    });
    return result;
  }());
  _('.headline').text($('#nr_title').text());
  _('a').eq(0).attr('href', $('#pt_prev').attr('href'));
  _('a').eq(1).attr('href', $('#pt_mulu').attr('href'));
  _('a').eq(2).attr('href', $('#pt_next').attr('href'));
  _('.content').html(`<p>${$('#nr1').html()}</p>`);
  _('a').eq(4).attr('href', $('#pt_prev').attr('href'));
  _('a').eq(5).attr('href', $('#pt_mulu').attr('href'));
  _('a').eq(6).attr('href', $('#pt_next').attr('href'));
  return _.html();
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
