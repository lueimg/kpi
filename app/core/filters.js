(function () {
  angular
    .module('doc.features')
    /*
     * Format number ids into a 3 length string
     */
    .filter('leftPad', [function () {
      return function (num) {
        var s = '000' + num;
        return s.substr(s.length - 3);
      };
    }])
    .filter('zoneIds', [function () {
      return function (num) {
        var s = '00' + num;
        return s.substr(s.length - 2);
      };
    }])
    .filter('propsFilter', function () {
      return function (items, props) {
        var out = [],
            keys;

        if (angular.isArray(items)) {
          keys = Object.keys(props);

          items.forEach(function (item) {
            var itemMatches = false,
                i,
                prop,
                text;

            for (i = 0; i < keys.length; i++) {
              prop = keys[i];
              text = props[prop].toLowerCase();
              if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                itemMatches = true;
                break;
              }
            }

            if (itemMatches) {
              out.push(item);
            }
          });
        } else {
          // Let the output be the input untouched
          out = items;
        }

        return out;
      };
    });
})();
