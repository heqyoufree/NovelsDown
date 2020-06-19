/* eslint-disable camelcase */
/* eslint-disable comma-dangle */
/* eslint-disable max-len */
/* eslint-disable quotes */
/* eslint-disable no-var */

var script = document.createElement('script');
script.type = 'text/javascript';
script.src = '../res/layui.js';
script.addEventListener('load', function() {
  layui.use(['util'], function() {
    var $ = layui.jquery;
    var util = layui.util;
    $('.header .i_back').click(function() {
      history.back();
    });
    $('.header .i_history').click(function() {
      $(window).attr('location', '/history.html');
    });
    $('.search .i_search').click(function() {
      $(window).attr('location', $('.search').attr('action'));
    });
    $('.search .i_cancel').click(function() {
      $(this).next('input').val('');
    });
    $('.search').submit(function() {
      if (!$(this).find('input').val().match(/^.+$/)) {
        return false;
      }
    });
    var page_id = $('body').attr('id') || '';
    if (page_id == 'library') {
      $('.filter li').click(function() {
        $('.library ul:not(.filter)').hide();
        if ($(this).hasClass('active')) {
          $(this).removeClass('active');
        } else {
          $(this).addClass('active').siblings().removeClass('active');
          $('.library ul').eq($(this).index()+1).show();
        }
      });
    } else if (page_id == 'history') {
      var list = [];
      console.log('test');
      $.get("http://" + location.host + "/visit", function(data) {
        var storage = JSON.parse(data);
        for (const i in storage) {
          if ({}.hasOwnProperty.call(storage, i)) {
            storage[i].id = i;
            list.push(storage[i]);
          }
        }
        console.log('finish');
        finished = false;
        list.sort(function(a, b) {
          return b.readtime - a.readtime;
        });
        var html = '';
        for (var i=0; i<list.length; i++) {
          html += '<li article-id="'+list[i].id+'">';
          html += '<a href="/'+list[i].id+'/'+list[i].readid+'.html" class="mark_read layui-btn layui-bg-cyan">继续阅读</a>';
          html += '<a class="mark_del layui-btn layui-btn-danger">删除</a>';
          html += '<a href="/shu_'+list[i].id+'.html"><img src="//img.shuhaige.com/'+list[i].id+'/'+list[i].dataid+'.jpg" onerror="this.onerror=null;this.src=\'/static/image/nocover.jpg\'"></a>';
          html += '<p class="bookname"><a href="/shu_'+list[i].id+'.html">'+list[i].name+'</a></p></a>';
          html += '<p class="author"><a href="/author/'+list[i].author+'/"><i class="layui-icon i_author"></i> '+list[i].author+'</a></p>';
          html += '<p></p>';
          html += '<p class="chapter">读到：<a href="/'+list[i].id+'/'+list[i].readid+'.html">'+list[i].readname+'</a></p>';
          html += '<p>时间：'+util.timeAgo(list[i].readtime, 1)+'</p>';
          html += '</li>';
        }
        $('ul.list').html(html);
        $('.caption b').text(list.length);
        $('.caption a').click(function() {
          if ($('ul.list').hasClass('edit')) {
            $('ul.list').removeClass('edit');
            $(this).text('编辑');
            $('div.clear').hide();
          } else {
            $('ul.list').addClass('edit');
            $(this).text('完成');
            $('div.clear').show();
          }
        });
        $('ul.list').on('click', 'a.mark_del', function() {
          var li = $(this).parents('li');
          window.localStorage.removeItem('book_'+li.attr('article-id'));
          li.remove();
          $('.caption b').text($('ul.list li').length);
          return false;
        });
      });
      // for (var i=0; i<window.localStorage.length; i++) {
      //   if (window.localStorage.key(i).substr(0, 5) === 'book_') {
      //     var book = JSON.parse(window.localStorage.getItem(window.localStorage.key(i)));
      //     if (!book.readid) continue;
      //     book.id = window.localStorage.key(i).substr(5);
      //     list.push(book);
      //   }
      // }
    } else if (page_id == 'mark') {
      $('.caption a').click(function() {
        if ($('ul.list').hasClass('edit')) {
          $('ul.list').removeClass('edit');
          $(this).text('编辑');
        } else {
          $('ul.list').addClass('edit');
          $(this).text('完成');
        }
      });
    }
    var articleid = $('body').attr('article-id') || 0;
    if (articleid > 0) {
      var visit = window.localStorage.getItem('visit_'+articleid) || 0;
      if (navigator.userAgent.toLowerCase().indexOf('spider') < 0 && Math.floor(visit/8640000) !== Math.floor($.now()/8640000)) {
        $.get('/visit/'+articleid+'/');
        window.localStorage.setItem('visit_'+articleid, $.now());
      }
      if ($('body').attr('id') == 'read') {
        $('.read li span').remove();
        $('.read li').removeClass('now');
        var book = JSON.parse(window.localStorage.getItem('book_'+articleid) || '{"readid":0}');
        if (book.readid > 0) {
          var read=$('.read li[chapter-id='+book.readid+']');
          read.addClass('now');
          read.children('a').prepend('<span><i class="layui-icon i_history"></i> 上次读到</span>');
          // $('html,body').animate({scrollTop: read.offset().top-45+'px'});
        }
      } else if ($('body').attr('id')=='chapter') {
        var chapterid = $('body').attr('chapter-id');
        var book = {name: $('#bookname').text(), author: $('#author').text(), dataid: $('body').attr('data-id')||0, readid: chapterid, readname: $('#chapter h1').text(), readtime: $.now()};
        window.localStorage.setItem('book_'+articleid, JSON.stringify(book));
        $.get('http://' + location.host + '/book_'+articleid, book);
        var size = parseInt(window.localStorage.getItem('size')) || 18;
        var theme = window.localStorage.getItem('theme') || '0';
        $('#chapter').append('<ul class="tabbar"><li>上一章</li><li>目录</li><li>设置</li><li>书页</li><li>下一章</li><li>加入书签</li><li>推荐</li><li>书库</li><li>排行</li><li>阅读记录</li></ul><div class="setting"><ul class="size"><li></li><li></li></ul><ul class="theme"><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li></ul></div>');
        $('.tabbar li').click(function() {
          switch ($(this).index()) {
            case 0:
              $(window).attr('location', $('.pager a').eq(0).attr('href'));
              break;
            case 1:
              // $(window).attr('location', $('.pager a').eq(1).attr('href'));
              $(window).attr('location', '/'+articleid+'/');
              break;
            case 2:
              if ($(this).hasClass('now')) {
                $('.setting').hide();
                $(this).removeClass('now');
              } else {
                $('.setting').show();
                $(this).addClass('now');
              }
              break;
            case 3:
              $(window).attr('location', '/shu_'+articleid+'.html');
              break;
            case 4:
              $(window).attr('location', $('.pager a').eq(2).attr('href'));
              break;
            case 7:
              $(window).attr('location', '/shuku/');
              break;
            case 8:
              $(window).attr('location', '/top.html');
              break;
            case 9:
              $(window).attr('location', '/history.html');
              break;
          }
        });
        document.onkeyup = function(e) {
          var e = e || window.event;
          if (e.keyCode == '37') {
            $(window).attr('location', $('.pager a').eq(0).attr('href'));
          }
          if (e.keyCode == '39') {
            $(window).attr('location', $('.pager a').eq(2).attr('href'));
          }
        };
        var setsize = function(s) {
          $('.size li').removeClass('disabled');
          if (size <= 10) {
            size = 10;
            $('.size li').eq(0).addClass('disabled');
          } else if (size >= 40) {
            size = 40;
            $('.size li').eq(1).addClass('disabled');
          }
          $('.content p').css('font-size', size+'px');
          window.localStorage.setItem('size', size);
        };
        setsize();
        $('.size li').click(function() {
          if ($(this).index() > 0) {
            if (size >= 40) return;
            size += 2;
          } else {
            if (size <= 10) return;
            size -= 2;
          }
          setsize();
        });
        var settheme = function() {
          $('.theme li').removeClass('now');
          $('.theme li').eq(theme).addClass('now');
          $('#chapter').attr('class', 'style_'+theme);
          window.localStorage.setItem('theme', theme);
        };
        settheme();
        $('.theme li').click(function() {
          theme = $(this).index();
          settheme();
        });
        $('#chapter').click(function(e) {
          if (e.target.nodeName=='LI' || e.target.nodeName=='A') return;
          if ($('.tabbar').css('bottom') === '0px') {
            $('.setting').hide();
            $('.tabbar li').eq(2).removeClass('now');
            $('.tabbar').css('bottom', '-100px');
            return $('[lay-type="bar1"]').html('&#xe620;');
          }
          $('.tabbar').css('bottom', 0);
          $('[lay-type="bar1"]').html('&#x1006;');
        });
        $('.header,.tabbar,.setting').click(function(e) {
          e.stopPropagation();
        });
        return;
      }
    }
  });
});
document.getElementsByTagName('head')[0].appendChild(script);
