'use strict';

SwaggerUi.Views.SignatureView = Backbone.View.extend({
  events: {
    'mousedown .snippet': 'snippetToTextArea',
    'change select.alternatives': 'selectAlternate'
  },

  initialize: function (options) {
  },

  render: function () {
    $(this.el).html(Handlebars.templates.signature(this.model));
    this.isParam = this.model.isParam;

    if (this.model.polymorphic) {
      this.wrapPolymorphic();
    }

    return this;
  },

  wrapPolymorphic: function () {
    for (var type in this.model.polymorphic) {
      var alternates  = this.model.polymorphic[type];
      var id = this.model.id + '-' + type;
      var master = $(this.el).find("span.strong:contains('" + type + "')").closest('span.model');
      var newMaster = Handlebars.templates.signature_alternates({
        id: id,
        type: type,
        alternates: alternates,
      });
      var replacement = master.replaceWith(newMaster);

      this.showAlternate($(this.el).find('form.polymorphic#' + id), alternates[0].id);
    }
  },

  selectAlternate: function (e) {
    this.showAlternate($(e.target).closest('form.polymorphic'), e.target.value);
  },

  showAlternate: function (alternates, type) {
    alternates.find('.alternate').hide();
    alternates.find('.alternate_' + type).show();
  },

  // handler for snippet to text area
  snippetToTextArea: function (e) {
    if (this.isParam) {
      if (e) {
        e.preventDefault();
      }

      this.$el.trigger('snippet', this.model.sampleJSON);
    }
  }
});
