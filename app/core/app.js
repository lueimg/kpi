
(function () {

  // ========== initialize main module ========== //
  angular
    .module('documentarioApp', [
      'ngAnimate',
      'ngCookies',
      // 'ngFileUpload',
      'ngResource',
      'ngRoute',
      'ngSanitize',
      'adaptv.adaptStrap',
      'mgcrea.ngStrap',
      'doc.features',
      // 'ui.select',
      'ui.bootstrap'
    ]);
  angular.module('doc.features', []);
  angular.module('documentarioApp')
  /**
   * Decorate $resource so we can add in common functionality.
   */
    .config(['$provide', function ($provide) {
      $provide.decorator('$resource', ['$delegate', 'notification',
        function ($delegate, notification) {
          /**
           * Angular tries to extend the top level default action configuration with resource verb objcts.
           * https://github.com/angular/angular.js/blob/master/src/ngResource/resource.js#L548
           * Since "extend" doesn't perform a deep merge, verb object ends up overriding the configuration.
           * In order to overcome it, we will be extending each verb with its default configuration.
           */

          var defaults = {
                get: {method: 'GET'},
                query: {method: 'GET'},
                save: {method: 'POST'},
                remove: {method: 'DELETE'},
                delete: {method: 'DELETE'},
                update: {method: 'PUT'}
              },
              decorator = function (url, paramDefaults, verbs) {
                angular.forEach(verbs, function (verb, verbName) {
                  /**
                   * Extend each verb with its default configuration
                   * If the default configuration for the verb is not defined, don't do anything
                   */
                  if (defaults[verbName] && !verb.hasOwnProperty('method')) {
                    angular.extend(verb, defaults[verbName]);
                  }
                  /**
                   * Each model and verb can specify their own error handler.
                   * Default to orca.genericErrorHandler if not specified.
                   */
                  verb.interceptor = verb.interceptor || {};
                  /**
                   * Check explicitly for undefined.
                   * This allows us to set responseError to null in a model to avoid having
                   * an assigned error handler.
                   *
                   */
                  // General error Handler, Server should return the exact message each time
                  if (verb.interceptor.responseError === undefined) {
                    verb.interceptor.responseError = function (httpRequest) {
                      if (httpRequest.data && httpRequest.data.message) {
                        notification.error(httpRequest.data.message);
                      }
                      // TODO: check this with every service call message and find an specific code for this
                      /*else if(httpRequest.data && httpRequest.data.results){
                        notification.error(httpRequest.data.results.message);
                      }*/
                    };
                  }
                });

                return $delegate(url, paramDefaults, verbs);
              };

          return decorator;
        }]);
    }]);

})();
