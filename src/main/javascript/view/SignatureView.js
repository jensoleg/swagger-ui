'use strict';

SwaggerUi.Views.SignatureView = Backbone.View.extend({
  events: {
    'mousedown .snippet_json'          : 'jsonSnippetMouseDown',
    'mousedown .snippet_xml'          : 'xmlSnippetMouseDown'
  },

  initialize: function () {
    console.log('SignatureView::initialize');
  },

  render: function () {
    $(this.el).html(Handlebars.templates.signature(this.model));
    this.isParam = this.model.isParam;
    return this;
  },

  // handler for snippet to text area
  snippetToTextArea: function(val) {
    if (this.options.parameterView) {
      var textArea = $('textarea', $(this.options.parameterView.el));

      // Fix for bug in IE 10/11 which causes placeholder text to be copied to "value"
      if ($.trim(textArea.val()) === '' || textArea.prop('placeholder') === textArea.val()) {
        textArea.val(val);
        // TODO move this code outside of the view and expose an event instead
        if( this.model.jsonEditor && this.model.jsonEditor.isEnabled()){
          this.model.jsonEditor.setValue(JSON.parse(this.model.sampleJSON));
        }
      }
    }
  },

  jsonSnippetMouseDown: function (e) {
    if (this.model.isParam) {
      if (e) { e.preventDefault(); }

      this.snippetToTextArea(this.model.sampleJSON);
    }
  },

  xmlSnippetMouseDown: function (e) {
    if (this.model.isParam) {
      if (e) { e.preventDefault(); }

      this.snippetToTextArea(this.model.sampleXML);
    }
  }
});