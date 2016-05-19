$(function () {
  var url;
  if (typeof swaggerSpec === 'undefined')
    url = '/output.json';
  else
    url = swaggerSpec;

  var apiKey = '';
  if (typeof defaultApiKey !== 'undefined')
    apiKey = defaultApiKey;

  var removeApiInput = false;
  if (typeof disableApiKey !== 'undefined')
    removeApiInput = disableApiKey;

  $('div#swagger-ui-container').append('\
    <div id="spinner-container"> \
      <div class="sk-fading-circle"> \
        <div class="sk-circle1 sk-circle"></div> \
        <div class="sk-circle2 sk-circle"></div> \
        <div class="sk-circle3 sk-circle"></div> \
        <div class="sk-circle4 sk-circle"></div> \
        <div class="sk-circle5 sk-circle"></div> \
        <div class="sk-circle6 sk-circle"></div> \
        <div class="sk-circle7 sk-circle"></div> \
        <div class="sk-circle8 sk-circle"></div> \
        <div class="sk-circle9 sk-circle"></div> \
        <div class="sk-circle10 sk-circle"></div> \
        <div class="sk-circle11 sk-circle"></div> \
        <div class="sk-circle12 sk-circle"></div> \
      </div> \
    </div>');

  window.swaggerUi = new SwaggerUi({
    url: url,
    apiKey: apiKey,
    removeApiInput: removeApiInput,
    dom_id: "swagger-ui-container",
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
    onComplete: function (swaggerApi, swaggerUi) {
      $('#spinner-container').hide();

      $('pre code').each(function (i, e) {
        hljs.highlightBlock(e)
      });

      if (swaggerUi.options.url) {
        $('#input_baseUrl').val(swaggerUi.options.url);
      }
      if (swaggerUi.options.apiKey) {
        $('#input_apiKey').val(swaggerUi.options.apiKey);
      }

      $("[data-toggle='tooltip']").tooltip();

      if (swaggerUi.options.removeApiInput) {
        $('.token-generator').remove();
      } else {
        $('#input_apiKey').change(addApiKeyAuthorization);
        addApiKeyAuthorization();
      }
    },
    onFailure: function (data) {
      log("Unable to Load SwaggerUI");
    },
    docExpansion: "none",
    sorter: "alpha"
  });

  function addApiKeyAuthorization(){
    var key = encodeURIComponent($('#input_apiKey')[0].value);
    if(key && key.trim() != "") {
      var fullKeyValue = "Token token=" + key;
      var apiKeyAuth = new SwaggerClient.ApiKeyAuthorization("Authorization", fullKeyValue, "header");
      window.swaggerUi.api.clientAuthorizations.add("api_key", apiKeyAuth);
      log("added key " + key);
    }
  }
  window.swaggerUi.load();

  function log() {
    if ('console' in window) {
      console.log.apply(console, arguments);
    }
  }
});
