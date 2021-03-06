requirejs.config({
  urlArgs: "version=1.2.3",
  paths: {
    'text': '/scripts/requirejs-text/text',
    'durandal': '/scripts/Durandal/js',
    'plugins': '/scripts/Durandal/js/plugins',
    'transitions': '/scripts/Durandal/js/transitions',
    'helpers': '/app/helpers',
    'models': '/app/models',
    'query': '/app/query',
    'services': '/app/services',
  }
});

define('knockout', function () { return ko; });
define('amplify', function () { return amplify; });
define('jquery', function () { return jQuery; });
define('socket.io-client', function () { return io() });
define(function (require) {
  var system = require('durandal/system'),
    viewLocator = require('durandal/viewLocator'),
    app = require('durandal/app');

  system.debug(true);
  app.title = 'PoolCue';

  app.configurePlugins({
    router: true,
    dialog: true,
    widget: {
      kinds: ['manualgame', 'waitinggame', 'currentgame', 'leaderboard', 'gamequeue']
    }
  });
  app.start().then(function () {
    viewLocator.useConvention('viewmodels', 'views');
    app.setRoot('viewmodels/shell', 'entrance');
  });
});
ko.bindingHandlers.switch = {
    init:function(element, valueAccessor){
      var elem = $(element);
      var value = valueAccessor();
      elem.bootstrapToggle({
        on: 'Enabled',
        off: 'Disabled'
      });
      elem.change(function () {
        value.target(elem[0].checked);
      });
    }
}
ko.bindingHandlers.alert = {
  update: function(element, valueAccessor, allBindings) {
        // First get the latest data that we're bound to
        var value = valueAccessor();

        // Next, whether or not the supplied model property is observable, get its current value
        var valueUnwrapped = ko.unwrap(value);

        // Grab some more data from another binding property
        var duration = allBindings.get('slideDuration') || 400; // 400ms is default duration unless otherwise specified

        // Now manipulate the DOM element
        if (valueUnwrapped === true)
            $(element).fadeTo(500, 1).slideDown(duration, function(){
              $(element).fadeTo(4000, 0, function(){
                value(false);
              })
            }); // Make the element visible
        else
            $(element).slideUp(duration, function(){

            });   // Make the element invisible
    }
};
ko.bindingHandlers.typeahead = {
  init: function (element, valueAccessor) {
    var elem = $(element);
    var value = valueAccessor();

    // Setup Bootstrap Typeahead for this element.
    elem.typeahead({
      highlight: true,
      minLength: 1
    },
      {
        source: substringMatcher(function () {
          return ko.utils.unwrapObservable(value.source);
        }),
        onselect: function (val) {
          value.target(val);
        }
      }).on('typeahead:selected', function(evt, item) {
           value.target(item);
      }).on('typeahead:autocompleted', function(evt, item) {
           value.target(item);
      });

    // Set the value of the target when the field is blurred.
    elem.blur(function () { value.target(elem.val()); });
  },
  update: function (element, valueAccessor, allBindings) {
    var elem = $(element);
    var value = valueAccessor();
    elem.val(value.target());
  }
};
var substringMatcher = function (source) {
  return function findMatches(query, syncResults) {
    var values = source().map(function (a) { return a.name; })
    var matches, substringRegex;
    matches = [];
    substringRegex = new RegExp(query, 'i');
    $.each(values, function (i, str) {
      if (substringRegex.test(str)) {
        matches.push(str);
      }
    });
    syncResults(matches);
  };
};