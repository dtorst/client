var baseUrl = 'http://542f0969.ngrok.com';

angular.module('goodCarma.services', [])

.factory('AuthFactory', ['$http',
  function($http) {
    var _authFactory = {};

    _authFactory.register = function(user) {
      return $http.post(baseUrl + '/api/v1/auth/register', user);
    }

    _authFactory.login = function(user) {
      return $http.post(baseUrl + '/api/v1/auth/login', user);
    }

    _authFactory.account = function(userId) {
      return $http.get(baseUrl + '/api/v1/auth/' + userId + '/account');
    }

    return _authFactory;
  }
])

.factory('SessionFactory', ['$window',
  function($window) {
    var _sessionFactory = {};

    _sessionFactory.createSession = function(user) {
      return $window.localStorage.user = JSON.stringify(user);
    },

    _sessionFactory.getSession = function(user) {
      return JSON.parse($window.localStorage.user);
    },

    _sessionFactory.deleteSession = function() {
      delete $window.localStorage.user;
      return true;
    }

    _sessionFactory.checkSession = function() {
      if ($window.localStorage.user) {
        return true;
      } else {
        return false;
      }
    }

    return _sessionFactory;
  }
])

.factory('ReminderFactory', ['$http',
  function($http) {
    var _remFactory = {};

    _remFactory.getAll = function(userId) {
      var t = Date.now();
      return $http.get(baseUrl + '/api/v1/sent/' + userId+'?_t='+t);
    }

    _remFactory.create = function(userId, reminder) {
      return $http.post(baseUrl + '/api/v1/send/' + userId + '/create', reminder);
    }

    _remFactory.delete = function(userId, reminderId) {
      return $http.delete(baseUrl + '/api/v1/sent/' + userId + '/' + reminderId);
    }
    return _remFactory;
  }
])

.factory('ReceivedFactory', ['$http',
  function($http) {
    var _recFactory = {};

    _recFactory.getAll = function(plate) {
      var t = Date.now();
      return $http.get(baseUrl + '/api/v1/received/' + plate+'?_t='+t);
    }
    return _recFactory;
  }
])
