var appName;
var popupMask;
var popupDialog;
var clientId;
var realm;
var redirect_uri;
var clientSecret;
var scopeSeparator;
var additionalQueryStringParams;

function handleLogin() {
  var scopes = [];

  var auths = window.swaggerUi.api.authSchemes || window.swaggerUi.api.securityDefinitions;
  if (auths) {
    var key;
    var defs = auths;
    for (key in defs) {
      var auth = defs[key];
      if (auth.type === 'oauth2' && auth.scopes) {
        var scope;
        if (Array.isArray(auth.scopes)) {
          // 1.2 support
          var i;
          for (i = 0; i < auth.scopes.length; i++) {
            scopes.push(auth.scopes[i]);
          }
        }
        else {
          // 2.0 support
          for (scope in auth.scopes) {
            scopes.push({scope: scope, description: auth.scopes[scope], OAuthSchemeKey: key});
          }
        }
      }
    }
  }

  if (window.swaggerUi.api
    && window.swaggerUi.api.info) {
    appName = window.swaggerUi.api.info.title;
  }

  $('.api-popup-dialog').remove(); 
  popupDialog = $(
    [
      '<div class="modal api-popup-dialog in" id="credentials-modal" tabindex="-1" role="dialog" aria-labelledby="credentials-modal-label" aria-hidden="false" style="display: block;">',
      '<div class="modal-dialog">',
      '<div class="modal-content">',
      '<div class="modal-header">',
      '<button type="button" class="close api-popup-cancel" data-dismiss="modal"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>',
      '<h3 class="modal-title" id="credentials-modal-label">Select OAuth2.0 Scopes</h3>',
      '</div>',
      '<div class="modal-body">',
      '<p>Scopes are used to grant an application different levels of access to data on behalf of the end user. Each API may declare one or more scopes.',
      '<a href="#">Learn how to use</a>',
      '</p>',
      '<p><strong>' + appName + '</strong> API requires the following scopes. Select which ones you want to grant to Swagger UI.</p>',
      '<form>',
      '<div class="api-popup-scopes">',
      '<div class="scopes">',
      '</div>',
      '</div>',
      '<form>',
      '<p class="error-msg"></p>',
      '</div>',
      '<div class="modal-footer">',
      '<div class="api-popup-actions"><button class="api-popup-cancel btn btn-default" type="button">Cancel</button><button class="api-popup-authbtn btn btn-primary" type="button">Authorize</button></div>',
      '</div>',
      '</div>',
      '</div>',
      '</div>'].join(''));
  $(document.body).append(popupDialog);

  popup = popupDialog.find('.scopes').empty();
  for (i = 0; i < scopes.length; i++) {
    scope = scopes[i];
    str = '<span data-toggle-scope="' + scope.scope + '"' +'" oauthtype="' + scope.OAuthSchemeKey +'"/>' + '" class="scope">' + scope.scope;
    if (scope.description) {
      if ($.map(auths, function(n, i) { return i; }).length > 1) //if we have more than one scheme, display schemes
	    str += '<br/><span class="api-scope-desc">' + scope.description + ' ('+ scope.OAuthSchemeKey+')' +'</span>';
	  else
	    str += '<br/><span class="api-scope-desc">' + scope.description + '</span>';
    }
    str += '</span>';
    popup.append(str);
  }

  popupDialog.find('scopes').click(function () {
    popupMask.hide();
    popupDialog.hide();
    popupDialog.empty();
    popupDialog = [];
  });

  popupDialog.find('[data-toggle-scope]').click(function () {
    $(this).hasClass("active") ? $(this).removeClass('active') : $(this).addClass('active');
  });

  popupDialog.find('button.api-popup-cancel').click(function () {
    popupMask.hide();
    popupDialog.hide();
    popupDialog.empty();
    popupDialog = [];
  });

  $('button.api-popup-authbtn').unbind();
  popupDialog.find('button.api-popup-authbtn').click(function () {
    popupMask.hide();
    popupDialog.hide();

    var authSchemes = window.swaggerUi.api.authSchemes;
    var host = window.location;
    var pathname = location.pathname.substring(0, location.pathname.lastIndexOf("/"));
    var defaultRedirectUrl = host.protocol + '//' + host.host + pathname + '/o2c.html';
    var redirectUrl = window.oAuthRedirectUrl || defaultRedirectUrl;
    var url = null;
    var scopes = []
    var o = popup.find('input:checked'); 
    var OAuthSchemeKeys = [];
    var state;
    for(k =0; k < o.length; k++) {
      var scope = $(o[k]).attr('data-toggle-scope');
      if (scopes.indexOf(scope) === -1)
        scopes.push(scope);
      var OAuthSchemeKey = $(o[k]).attr('oauthtype');      
      if (OAuthSchemeKeys.indexOf(OAuthSchemeKey) === -1)
          OAuthSchemeKeys.push(OAuthSchemeKey);
    }
    
    //TODO: merge not replace if scheme is different from any existing 
    //(needs to be aware of schemes to do so correctly)
    window.enabledScopes=scopes;    
    
    for (var key in authSchemes) { 
      if (authSchemes.hasOwnProperty(key) && OAuthSchemeKeys.indexOf(key) != -1) { //only look at keys that match this scope.
        var flow = authSchemes[key].flow;

        if (authSchemes[key].type === 'oauth2' && flow && (flow === 'implicit' || flow === 'accessCode')) {
          var dets = authSchemes[key];
          url = dets.authorizationUrl + '?response_type=' + (flow === 'implicit' ? 'token' : 'code');
          window.swaggerUi.tokenName = dets.tokenName || 'access_token';
          window.swaggerUi.tokenUrl = (flow === 'accessCode' ? dets.tokenUrl : null);
          state = key;
        }
        else if(authSchemes[key].type === 'oauth2' && flow && (flow === 'application')) {
            var dets = authSchemes[key];
            window.swaggerUi.tokenName = dets.tokenName || 'access_token';
            clientCredentialsFlow(scopes, dets.tokenUrl, key);
            return;
        }        
        else if(authSchemes[key].grantTypes) {
          // 1.2 support
          var o = authSchemes[key].grantTypes;
          for (var t in o) {
            if (o.hasOwnProperty(t) && t === 'implicit') {
              var dets = o[t];
              var ep = dets.loginEndpoint.url;
              url = dets.loginEndpoint.url + '?response_type=token';
              window.swaggerUi.tokenName = dets.tokenName;
            }
            else if (o.hasOwnProperty(t) && t === 'accessCode') {
              var dets = o[t];
              var ep = dets.tokenRequestEndpoint.url;
              url = dets.tokenRequestEndpoint.url + '?response_type=code';
              window.swaggerUi.tokenName = dets.tokenName;
            }
          }
        }
      }
    }

    redirect_uri = redirectUrl;

    url += '&redirect_uri=' + encodeURIComponent(redirectUrl);
    url += '&realm=' + encodeURIComponent(realm);
    url += '&client_id=' + encodeURIComponent(clientId);
    url += '&scope=' + encodeURIComponent(scopes.join(scopeSeparator));
    url += '&state=' + encodeURIComponent(state);
    for (var key in additionalQueryStringParams) {
        url += '&' + key + '=' + encodeURIComponent(additionalQueryStringParams[key]);
    }

    window.open(url);
  });

  popupMask.show();
  popupDialog.show();
}

function handleLogout() {
  for (key in window.authorizations.authz) {
    window.authorizations.remove(key)
  }
  window.enabledScopes = null;
  var oauthBtn = $('.api-ic');
  oauthBtn.addClass('btn-default');
  oauthBtn.removeClass('btn-success');
  oauthBtn.removeClass('btn-warning');

  oauthBtn.text('oauth');

  $('#input_apiKey').val('');
}

function initOAuth(opts) {
  var o = (opts || {});
  var errors = [];

  appName = (o.appName||errors.push('missing appName'));
  popupMask = (o.popupMask||$('#api-common-mask'));
  popupDialog = (o.popupDialog||$('.api-popup-dialog'));
  clientId = (o.clientId||errors.push('missing client id'));
  clientSecret = (o.clientSecret||null);
  realm = (o.realm||errors.push('missing realm'));
  scopeSeparator = (o.scopeSeparator||' ');
  additionalQueryStringParams = (o.additionalQueryStringParams||{});

  if (errors.length > 0) {
    log('auth unable initialize oauth: ' + errors);
    return;
  }

  $('pre code').each(function (i, e) {
    hljs.highlightBlock(e)
  });

  var oauthBtn = $('.api-ic');
  oauthBtn.unbind();
  oauthBtn.click(function (s) {
    if ($(s.target).hasClass('btn-default'))
      handleLogin();
    else {
      handleLogout();
    }
  });
}

function clientCredentialsFlow(scopes, tokenUrl, OAuthSchemeKey) {
    var params = {
      'client_id': clientId,
      'client_secret': clientSecret,
      'scope': scopes.join(' '),
      'grant_type': 'client_credentials'
    }
    $.ajax(
    {
      url : tokenUrl,
      type: "POST",
      data: params,
      success:function(data, textStatus, jqXHR)
      {
        onOAuthComplete(data,OAuthSchemeKey);
      },
      error: function(jqXHR, textStatus, errorThrown)
      {
        onOAuthComplete("");
      }
    });
    
  }

window.processOAuthCode = function processOAuthCode(data) {
  var OAuthSchemeKey = data.state;
  var params = {
    'client_id': clientId,
    'code': data.code,
    'grant_type': 'authorization_code',
    'redirect_uri': redirect_uri
  };

  if (clientSecret) {
    params.client_secret = clientSecret;
  }

  $.ajax(
    {
      url: window.swaggerUi.tokenUrl,
      type: "POST",
      data: params,
      success: function (data, textStatus, jqXHR) {
        onOAuthComplete(data, OAuthSchemeKey);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        onOAuthComplete("");
      }
    });
};

window.onOAuthComplete = function onOAuthComplete(token,OAuthSchemeKey) {
  if (token) {
    if (token.error) {
      var checkbox = $('input[type=checkbox],.secured')
      checkbox.each(function (pos) {
        checkbox[pos].checked = false;
      });
      alert(token.error);
    }
    else {
      var b = token[window.swaggerUi.tokenName];      
      if (!OAuthSchemeKey){
          OAuthSchemeKey = token.state;
      }
      if (b) {
        // if all roles are satisfied
        var o = null;
        $.each($('.auth #api_information_panel'), function (k, v) {
          var children = v;
          if (children && children.childNodes) {
            var requiredScopes = [];
            $.each((children.childNodes), function (k1, v1) {
              var inner = v1.innerHTML;
              if (inner)
                requiredScopes.push(inner);
            });
            var diff = [];
            for (var i = 0; i < requiredScopes.length; i++) {
              var s = requiredScopes[i];
              if (window.enabledScopes && window.enabledScopes.indexOf(s) == -1) {
                diff.push(s);
              }
            }
            if (diff.length > 0) {
              o = v.parentNode.parentNode;
              // sorry, not all scopes are satisfied
              $(o).find('.api-ic').addClass('btn-warning');
              $(o).find('.api-ic').removeClass('btn-default');
              $(o).find('.api-ic').removeClass('btn-success');
            }
            else {
              o = v.parentNode.parentNode;
              // all scopes are satisfied
              $(o).find('.api-ic').addClass('btn-success');
              $(o).find('.api-ic').removeClass('btn-default');
              $(o).find('.api-ic').removeClass('btn-warning');
            }
          }
        });
        $('.api-ic').text('signout');
        $('#input_apiKey').val(b);
        window.swaggerUi.api.clientAuthorizations.add(OAuthSchemeKey, new SwaggerClient.ApiKeyAuthorization('Authorization', 'Bearer ' + b, 'header'));
      }
    }
  }
};