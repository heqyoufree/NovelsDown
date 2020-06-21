/*
 * @Date: 2020-04-14 12:47:01
 * @Author: goEval
 * @LastEditors: goEval
 * @LastEditTime: 2020-06-20 08:33:12
 * @FilePath: \NovelsDown\downtxthtml.js
 * @Github: https://github.com/heqyou_free
 */
const cheerio = require('cheerio');
const program = require('commander');
const querystring = require('querystring');
const fs = require('fs');
const requ = require('request');
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
const bookurl = `https://m.shuhaige.net/${program.book}`;
const txtbuffer = {};
let articles = -1;
requ({url: bookurl, timeout: 30000}, (error, resp, body) => {
  if (error) {
    console.error('1', e);
  } else {
    const _ = cheerio.load(body);
    log('started ' + (_('select').find('option').length - 1)*100 + '章+');
    parsepage(_);
    console.log(_('select').find('option').length);
    for (let i = 2; i < (_('select').find('option').length + 1); i++) {
      requ({url: `${bookurl}_${i}`, timeout: 30000}, (e, r, b) => {
        if (error) {
          console.error('2', e);
        } else {
          parsepage(cheerio.load(b), i === _('select').find('option').length);
        }
      });
    }
  }
});

/**
 * parse
 * @param {CheerioStatic} _
 * @param {any} islast
 */
function parsepage(_, islast) {
  if (islast) {
    articles = (_('select').find('option').length - 1)*100 + _('ul.read').find('li').length + 1;
    console.log('articles', articles);
  }
  _('ul.read').find('li').each((i, e) => {
    const id = _(e).attr('chapter-id');
    requestChapter(`${bookurl}/${id}.html`, (body) => {
      txtbuffer[id] = `--------------------\n${_(e).find('a').text()}\n--------------------\n`;
      txtbuffer[id] += getText(body);
      fs.writeFileSync(`./down/${program.book}/${id}.html`, parseHtml(body));
      count++;
      log(program.book + '/' + count + '/' + articles + '/' + _(e).find('a').text());
      if (count % 10 === 0 || count === articles) {
        const sdic = Object.keys(txtbuffer). map(Number).sort((a, b) => {
          return a - b;
        });
        let txt = '';
        for (ki in sdic) {
          if ({}.hasOwnProperty.call(sdic, ki)) {
            txt += txtbuffer[sdic[ki]];
          }
        }
        fs.writeFileSync(`./down/${program.book}.txt`, txt);
      }
    });
  });
}

// eslint-disable-next-line require-jsdoc
async function requestChapter(url, callback) {
  requ({url: url, timeout: 10000}, (error, resp, body) => {
    if (error) {
      console.error('3', error);
      requestChapter(url, callback);
    } else {
      callback(body);
    }
  });
}

/**
 * log
 * @param {any} data
 */
function log(data) {
  if (program.child) {
    querystring.stringify({d: data});
    requ(`http://127.0.0.1:7777?${querystring.stringify({d: data})}`);
  }
  console.log(data);
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
