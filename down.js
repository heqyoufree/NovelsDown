/*
 * @Date: 2020-04-13 19:04:23
 * @Author: goEval
 * @LastEditors: goEval
 * @LastEditTime: 2020-05-09 16:59:16
 * @FilePath: \NovelsDown\down.js
 * @Github: https://github.com/heqyou_free
 */
const syncrequest = require('sync-request');
const cheerio = require('cheerio');
const program = require('commander');

program.version('1.0.0')
    .option('-b, --book [url]', 'url of book')
    .parse(process.argv);

if (fs.existsSync(`./down/${program.book}.txt`)) {
  fs.unlinkSync(`./down/${program.book}.txt`);
}

let i = 1;
const bookurl = `https://m.shuhaige.com/${program.book}`;
let _ = cheerio.load(srequest(bookurl).body.toString());
for (i = 1; i < (_('select').find('option').length + 1); i++) {
  _ = i === 1 ? _ : cheerio.load(srequest(`${bookurl}_${i}`).body.toString());
  _('ul.read').find('li').each((i, e) => {
    fs.appendFileSync(`./down/${program.book}.txt`, '--------------------\n' +
    `${_(e).find('a').text()}\n--------------------\n`);
    fs.appendFileSync(`./down/${program.book}.txt`, getText(`${bookurl}/${_(e).attr('chapter-id')}.html`));
    i++;
  });
}

/**
 * sync request
 * @param {string} url url
 * @return {Response}
 */
function srequest(url) {
  // console.log(`request ${url}`)
  let data;
  try {
    data = syncrequest.default('GET', url, {timeout: 10000, retry: true});
  } catch (e) {
    data = srequest(url);
  }
  // console.log(`request finish ${url}`)
  return data;
}

/**
 * parse html
 * @param {string} url url
 * @return {string}
 */
function getText(url) {
  const $ = cheerio.load(srequest(url).body.toString());
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
