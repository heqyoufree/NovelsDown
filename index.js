/*
 * @Date: 2020-04-13 19:06:27
 * @Author: goEval
 * @LastEditors: goEval
 * @LastEditTime: 2020-05-10 19:31:32
 * @FilePath: \NovelsDown\index.js
 * @Github: https://github.com/heqyou_free
 */
console.time('program');
const childprocess = require('child_process');
const syncrequest = require('sync-request');
const querystring = require('querystring');
const cheerio = require('cheerio');
const program = require('commander');
const http = require('http');
const url = require('url');
const fs = require('fs');

program.version('1.0.0')
    .option('-p, --port [port]', 'port')
    .parse(process.argv);

let resp = fs.readFileSync('./downserver.html')+'<br>init';

const port = program.port || 8887;

const cachedFiles = ['layui.js', 'layui.css', 'layer.js', 'layer.css',
  'common.js', 'common.css', 'jquery.js', 'util.js'];

const history = JSON.parse(fs.readFileSync('./history.json'));

http.createServer((request, response) => {
  response.writeHead(200, {'Content-Type': 'charset=utf-8', 'Access-Control-Allow-Origin': '*'});
  try {
    /**
     * main function
     */
    if (/\d+\/\d+\.html/.test(request.url)) {
      // use internet
      response.end(parseHtml(`https://m.shuhaige.com${request.url}`), () => {
        console.log(`finish ${request.url}`);
      });
      return;
    }
    /**
     * history server
     */
    // update history
    if (/book_\d+/.test(request.url)) {
      console.log('update history');
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
      response.end('success');
      return;
    }
    // response history
    if (/visit/.test(request.url)) {
      console.log('request history');
      response.end(JSON.stringify(history));
      return;
    }
    /**
     * down server
     */
    // start down novel
    if (/\/down\/\d+/.test(request.url)) {
      childprocess.fork('./downtxthtml.js', ['-c', '-b', request.url.match(/\d+/)[0]]);
      resp += '<br>started ' + request.url.match(/\d+/)[0];
      response.end(resp);
      console.log('started' + request.url.match(/\d+/)[0]);
      return;
    }
    // check down novels stats
    if (/stats/.test(request.url)) {
      resp += '<br>request stats';
      console.log('request stats');
      response.end(resp);
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
    const resq = syncrequest.default(request.method, `https://m.shuhaige.com${request.url}`);
    response.end(resq.body.toString());
    return;
  } catch (e) {
    response.writeHead(500);
    response.end(e.message);
    console.error(e.message);
  }
}).setTimeout(15000).listen(port);
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
console.timeEnd('program');

/**
 * parse html
 * @param {string} url
 * @return {string}
 */
function parseHtml(url) {
  const $ = cheerio.load(srequest(url).body.toString());
  $('.header').attr('hidden', 1);
  $('.path').remove();
  $('.tui').remove();
  $('body').find('script').each((i, e) => {
    $(e).remove();
  });
  $('.layui-fixbar').remove();
  $('form').remove();
  $('.footer').remove();
  $('body').addClass('style_8');
  $('.headline').css('margin-top', '0px');
  $('p').each((i, e) => {
    if (/书海阁/.test($(e).text())) {
      $(e).remove();
    }
  });
  $('body').append('<div style="color:black"><p>a</p><p>a</p><p>a</p>' +
    '<p>a</p><p>a</p><p>a</p><p>a</p><p>a</p></div>');
  $('a').eq(3).text('下载本书');
  // eslint-disable-next-line max-len
  $('a').eq(3).attr('href', 'javascript:layui.jquery(window).attr("location", window.location.protocol+"//"+window.location.hostname+":8887/down/"+layui.jquery("body").attr("article-id"));');
  $('#mark').text('换源');
  // eslint-disable-next-line max-len
  $('#mark').attr('href', 'javascript:layui.jquery(window).attr("location", window.location.protocol+"//"+window.location.hostname+":5555/"+layui.jquery("body").attr("article-id")+"/"+layui.jquery("body").attr("chapter-id")+".html");');
  return $.html();
}

/**
 * sync request
 * @param {string} url url
 * @return {Response}
 */
function srequest(url) {
  console.log(`request ${url}`);
  return syncrequest.default('GET', url, {timeout: 10000, retry: true});
}
