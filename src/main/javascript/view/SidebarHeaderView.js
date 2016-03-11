'use strict';

SwaggerUi.Views.SidebarHeaderView = Backbone.View.extend({
  initialize: function (opts) {
    this.options = opts || {};
    this.router = this.options.router;
  },

  events: {
    'click [data-endpoint]': 'clickSidebarItem'
  },

  render: function () {
    $(this.el).html(Handlebars.templates.sidebar_header(this.model));

    for (var i = 0; i < this.model.operationsArray.length; i++) {
      var item = this.model.operationsArray[i].operation;
      item.nickname = this.model.operationsArray[i].nickname;
      item.parentId = this.model.operation.parentId;
      this.addSidebarItem(item, i);
    }

    return this;
  },

  addSidebarItem: function (item, i) {
    var sidebarItemView = new SwaggerUi.Views.SidebarItemView({
      model: item,
      tagName: 'div',
      className : 'item',
      attributes: {
          "data-endpoint": item.parentId + '_' + item.nickname
      },
      router: this.router,
      swaggerOptions: this.options.swaggerOptions
    });
    $(this.el).append(sidebarItemView.render().el);
  },

  clickSidebarItem: function (e) {

    var self = this;

    var elem = $(e.target);
    var eln = $("#" + elem.attr("data-endpoint"));

    if (elem.is(".item")) {
      scroll(elem.attr("data-endpoint"));
      setSelected(elem);
      updateUrl(eln.find(".path a").first().attr("href"))
    }

    /* scroll */
    function scroll(elem) {
      var i = $(".sticky-nav").outerHeight();
      var r = $("#" + elem).offset().top - i - 10;
      matchMedia() && (r = $("#" + elem).offset().top - 10);
      scrollT(r)
    }

    /* set selected value and select operation (class) */
    function setSelected(element) {
      {
        var nav = $(".sticky-nav [data-navigator]");
        $("#" + element.attr("data-endpoint"))
      }
      nav.find("[data-resource]").removeClass("active");
      nav.find("[data-selected]").removeAttr("data-selected");
      element.closest("[data-resource]").addClass("active");
      element.attr("data-selected", "");
      $(".sticky-nav").find("[data-selected-value]").html(element.text())
    }

    /* update navigation */
    function updateUrl(element) {
      history.pushState && history.pushState(null, null, element)
    }

    function matchMedia() {
      return window.matchMedia("(min-width: 992px)").matches
    }

    function scrollT(e) {
      /*if ("self" === e) {
        var n = $(window).scrollTop();
        return $(window).scrollTop(n)
      }

      return $(window).scrollTop(e)*/

      var scollsession = window.scrollSession = window.scrollSession ? window.scrollSession + 1 : 1;

      if ("self" === e) {
        e = $(window).scrollTop();
      }

      var $body = $('body');
      var bodyScrollTop = $body.scrollTop();
      var diff = e - bodyScrollTop;
      var jumpStart = bodyScrollTop;
      if (diff < 0 && diff < -100) {
        //scrollUp
        //jumpStart = e + 100;
      } else if (diff > 0 && diff > 100) {
        //scrollDown
        //jumpStart = e - 100;
      }

      $body.stop();

      if (diff !== 0) {
        $body.scrollTop(jumpStart).animate({
          scrollTop: e,
        }, {
          duration: 1000,
          queue: false,
          start: function (animationPromise) {
            console.log(scollsession + ' Scroll Started');
            $(".sticky-nav [data-navigator]").attr('data-scrolling', 'true');
          },
          done: function () {
            console.log(scollsession + ' Scroll Done');
          },
          always: function (animationPromise, jumpToEnd) {
            console.log(scollsession + ' Scroll Stopped');
            $(".sticky-nav [data-navigator]").removeAttr('data-scrolling');
          }
        });
      }
    }
  }

});