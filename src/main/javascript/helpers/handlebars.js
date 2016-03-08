'use strict';

Handlebars.registerHelper('sanitize', function(html) {
    // Strip the script tags from the html, and return it as a Handlebars.SafeString
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    return new Handlebars.SafeString(html);
});
Handlebars.registerHelper('times', function(n, html) {
  var sum = '';

  for (var i = 0; i < n; i++) {
    sum += html.fn(i);
  }
  return sum;
});
