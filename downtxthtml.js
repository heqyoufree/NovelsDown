/*
 * @Date: 2020-04-14 12:47:01
 * @Author: goEval
 * @LastEditors: goEval
 * @LastEditTime: 2020-05-09 16:56:04
 * @FilePath: \NovelsDown\downtxthtml.js
 * @Github: https://github.com/heqyou_free
 */
const syncrequest = require('sync-request');
const cheerio = require('cheerio');
const program = require('commander');
const fs = require('fs');
const childprocess = require('child_process');

program.version('1.0.0')
    .option('-c --child', 'child process')
    .option('-b, --book [url]', 'url of book')
    .parse(process.argv);

if (!fs.existsSync(`./down/${program.book}`)) {
  fs.mkdirSync(`./down/${program.book}`);
  try {
    childprocess.execSync(`mklink "../../website/${program.book}" ` +
  `"./down/${program.book}" /J`);
  } catch (e) {
    console.error(e);
  }
}

if (fs.existsSync(`./down/${program.book}.txt`)) {
  fs.unlinkSync(`./down/${program.book}.txt`);
}

let count = 1;
let i = 1;
const bookurl = `https://m.shuhaige.com/${program.book}`;
let _ = cheerio.load(srequest(bookurl).body.toString());
log('started ' + (_('select').find('option').length - 1)*100 + '章+');
for (i = 1; i < (_('select').find('option').length + 1); i++) {
  _ = i === 1 ? _ : cheerio.load(srequest(`${bookurl}_${i}`).body.toString());
  _('ul.read').find('li').each((i, e) => {
    log(program.book + '/' + count + '/' + _(e).find('a').text());
    const id = _(e).attr('chapter-id');
    const html = srequest(`${bookurl}/${id}.html`).body.toString();
    fs.appendFileSync(`./down/${program.book}.txt`, '--------------------\n' +
    `${_(e).find('a').text()}\n--------------------\n`);
    fs.appendFileSync(`./down/${program.book}.txt`, getText(html));
    fs.writeFileSync(`./down/${program.book}/${id}.html`, parseHtml(html));
    i++;
    count++;
  });
}
log('finished');

/**
 * log
 * @param {any} data
 */
function log(data) {
  if (program.child) {
    try {
      syncrequest.default('POST', 'http://127.0.0.1:7777', {headers: {'Content-Type': 'charset=utf-8'}, body: data});
    } catch (e) {}
  }
  console.log(data);
}

/**
 * sync request
 * @param {string} url url
 * @return {Response}
 */
function srequest(url) {
  let data;
  try {
    data = syncrequest.default('GET', url, {timeout: 10000, retry: true});
  } catch (e) {
    data = srequest(url);
  }
  return data;
}

/**
 * parse html
 * @param {string} str url
 * @return {string}
 */
function getText(str) {
  const $ = cheerio.load(str);
  $('div.content').find('p').filter((i, el) => {
    if (/书海阁/.test($(el).text())) {
      return true;
    }
  }).remove();
  let textSteam = '';
  $('div.content').find('p').each((i, e) => {
    textSteam += '    ' + $(e).text() + '\n';
  });
  return textSteam;
}

/**
 * parse html
 * @param {string} str
 * @return {string}
 */
function parseHtml(str) {
  const $ = cheerio.load(str);
  $('.header').remove();
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
  $('a').eq(0).attr('href', '..' + $('a').eq(0).attr('href'));
  $('a').eq(2).attr('href', '..' + $('a').eq(2).attr('href'));
  $('a').eq(4).attr('href', '..' + $('a').eq(4).attr('href'));
  $('a').eq(6).attr('href', '..' + $('a').eq(6).attr('href'));
  $('head').append('<meta charset="utf-8">');
  $('meta').each((i, e) => {
    if ($(e).attr('name') === 'keywords') {
      $(e).remove();
    }
    if ($(e).attr('name') === 'description') {
      $(e).remove();
    }
  });
  $('body').append('<div style="color:black"><p>a</p><p>a</p><p>a</p>' +
    '<p>a</p><p>a</p><p>a</p><p>a</p><p>a</p></div>');
  $('link').attr('href', '../res/common.css');
  $('script').attr('src', '../res/common.js');
  $('#mark').text('换源');
  $('#mark').attr('href', function() {
    // eslint-disable-next-line max-len
    return `javascript:layui.jquery(window).attr('location', window.location.protocol+'//'+window.location.hostname+':8887/'+layui.jquery('body').attr('article-id')+'/'+layui.jquery('body').attr('chapter-id')+'.html');`;
  }());
  return $.html();
}
