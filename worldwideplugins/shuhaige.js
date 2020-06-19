/*
 * @Date: 2020-05-31 09:10:45
 * @Author: goEval
 * @LastEditors: goEval
 * @LastEditTime: 2020-05-31 09:44:55
 * @FilePath: \NovelsDown\worldwideplugins\shuhaige.js
 * @Github: https://github.com/heqyou_free
 */

/**
 * shuhaige
 */
class shuhaige {
  /**
   * parse html
   * @param {CheerioStatic} $
   * @return {string}
   */
  parseHtml($) {
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
    $('a').eq(3).attr('href', 'javascript:layui.jquery(window).attr("location", location.protocol+"//"+location.hostname+":8887/down/"+layui.jquery("body").attr("article-id"));');
    $('#mark').text('换源');
    // eslint-disable-next-line max-len
    $('#mark').attr('href', 'javascript:layui.jquery(window).attr("location", location.protocol+"//"+location.hostname+":5555/"+layui.jquery("body").attr("article-id")+"/"+layui.jquery("body").attr("chapter-id")+".html");');
    return $;
  }
  /**
   * identity
   * @return {string}
   */
  static get identity() {
    return 'shuhaige';
  }
  /**
   * domain
   * @return {string}
   */
  static get domain() {
    return 'm.shuhaige.com';
  }
}
module.exports = shuhaige;
