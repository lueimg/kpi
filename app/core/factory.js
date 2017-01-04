
  angular
    .module('doc.features')
  /**
   * Show notification using angular strap
   */
    .factory('notification', ['$alert', function ($alert) {
      return {
        // @todo : it sounds cool :D but seriously it would be better XD
        great: function (message) {
          $alert({
            title: message,
            placement: 'top',
            type: 'success',
            show: true,
            container: '.message',
            duration: '8',
            animation: 'am-fade-and-slide-top'
          });
        },
        warn: function (message) {
          $alert({
            title: message,
            placement: 'top',
            type: 'warning',
            show: true,
            container: '.message',
            duration: '8',
            animation: 'am-fade-and-slide-top'
          });
        },
        error : function (message) {
          $alert({
            title: message,
            placement: 'top',
            type: 'danger',
            show: true,
            container: '.message',
            duration: '8',
            animation: 'am-fade-and-slide-top'
          });
        },
        genericErrorHandler: function (response) {
          $alert({
            title: response.message || 'Opps algo paso, Por favor refresque la pagina.',
            placement: 'top',
            type: 'danger',
            show: true,
            container: '.message',
            duration: '8',
            animation: 'am-fade-and-slide-top'
          });
        }
      };
    }])
    .factory('CurrentUser', ['$resource', function ($resource) {
      var CurrentUser = $resource('/Auth', {});

      /**
       *
       * @param {array} table from entities table
       * @param {string} permission from restriction column , _view, _create, _edit, _delete
       * @returns {boolean} returns permission
       */
      CurrentUser.prototype.isAllowed = function (table, permission) {
        table = table.toUpperCase();

        if (this.role_id === 2) {
          // Role 2 is administrador , has total access
          return true;
        }

        return this.restrictions &&
          this.restrictions[table] &&
          this.restrictions[table][permission] &&
          this.restrictions[table][permission] === 1;
      };

      return CurrentUser;
    }]);

