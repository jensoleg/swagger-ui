$(document).ready(function() {

  /* Bootstrapping */

  var targetContainerClass = '.model-signature .description';

  waitUntilModelSignatureElementsExist();

  /* Main */

  function runScript() {
    cleanUpGeneralLayout();
    formatInnerElements();
    removeInlineModelsInLeftPane();
  };

  /* Helper Functions */

  function formatInnerElements() {
    $.each($(targetContainerClass + ' > div'), function(index, element) {
      $element = $(element);

      // Move elements inside .propWrap outisde and delete the .propWrap element
      var $propWrapElement = $element.find('.propWrap');
      $propWrapElement.parent().append($propWrapElement.html());
      $propWrapElement.remove();

      // Remove the class on the div since it's not used
      $element.removeAttr('class');

      // Wrap the inner elements inside .propLabels, this takes care of the leftside
      $element.html('<span class="propLabels">' + $element.html() + '</span>');

      // The only thing that needs to be moved out is .propDesc, which is the right handside
      $propDescElement = $element.find('.propDesc');
      $propDescElement.parent().after($propDescElement);

      // The type highlighting requires the title attribute
      var $propTypeElement = $element.find('.propType');
      $propTypeElement.attr('title', $propTypeElement.text());
      $propTypeElement.wrap('<div style="display: block"></div>');
    });

    relocatePropValsToRightSide();
    stripExcessStringIn('.propLabels');
    stripExcessStringIn('.propVals');
  }

  function cleanUpGeneralLayout() {
    $.each($(targetContainerClass), function(index, modelElement) {
      var $strongElements = $(modelElement).find('.strong');

      // span.strong is the wrapper for the object header, make it so
      for (var i=0; i<=$strongElements.length; i+=2) {
        var $openingStrongElement = $($strongElements[i]);
        var $closingStrongElement = $($strongElements[i+1]);
        var replacedText = $openingStrongElement.text().replace(/{/, '');

        var new_html = "<span class='strong objectName'>\
                          <span class='bracketsIcon'>{}</span>\
                          <span class='objectNameText'></span>\
                        </span>";

        $openingStrongElement.html(new_html);
        $openingStrongElement.find('.objectNameText').text(replacedText);
        $closingStrongElement.remove();

        // Remove all the hover crap
        $(".optionsWrapper").remove();
      }
    });
  }

  function stripExcessStringIn(containerClass) {
    $(containerClass).contents().filter(function() {
      return this.nodeType == Node.TEXT_NODE;
    }).remove();
  }

  function relocatePropValsToRightSide() {
    $.each($(".propVals"), function(index, element) {
      var text = $(element).text().replace(/\'/g, '"');
      var options = JSON.parse(text);
      var content = "Can be ";

      for (var i=0; i<options.length; i++) {
        if(options.length > 1 && i == (options.length - 1)) {
          content = content.slice(0, -2);
          content += ' or <code>' + escapeHTML(options[i]) + '</code>';
        } else {
          content += '<code>' + escapeHTML(options[i]) + '</code>, ';
        }
      }

      // Append the content to the right
      $(element).closest('div').append('<span class="propDesc">' + content + '</span>');
    });
  }

  // Escape function borrowed from Prototype.js
  function escapeHTML(text) {
    return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function waitUntilModelSignatureElementsExist() {
    setTimeout(function() {
      var $modelSignatureElements = $(targetContainerClass);

      if ($modelSignatureElements.length == 0) {
        waitUntilModelSignatureElementsExist();
      } else {
        runScript();
      }
    }, 100);
  };

  function removeInlineModelsInLeftPane() {
    $(".code-signature:contains('inline_model')").map(function() {
      $(this).siblings(".parameter-location").remove();
      $(this).remove();
    });
  }
});
