angular.module('goodCarma.controllers', [])


.controller('AccountCtrl', ['$scope', '$rootScope', 'AuthFactory', 'SessionFactory',
  function($scope, $rootScope, AuthFactory, SessionFactory) {
   // $scope.account = {};

      $rootScope.showLoading('Fetching Account Info...');
      var user = SessionFactory.getSession();
      AuthFactory.account(user._id).success(function(data) {
        $scope.account = data.account;
        $rootScope.hideLoading();
      }).error(function(data) {
        $rootScope.hideLoading();
        $rootScope.toast('Oops...something went awry!');
      });
  }
])

.controller('LoginCtrl', ['$scope', '$rootScope', '$location', 'AuthFactory', 'SessionFactory',
  function($scope, $rootScope, $location, AuthFactory, SessionFactory) {

    $scope.login = {
      email: '',
      password: ''
    };

    $scope.loginUser = function() {
      $rootScope.showLoading("Authenticating..");
      AuthFactory.login($scope.login).success(function(data) {
        SessionFactory.createSession(data.user);
        $location.path('/home');
        $rootScope.hideLoading();
      }).error(function(data) {
        if (data.status == 400) {
          $rootScope.hideLoading();
          $rootScope.toast('Invalid Credentials');
        }
      });
    };

  }
])

.controller('RegisterCtrl', ['$scope', '$rootScope', '$location', 'AuthFactory', 'SessionFactory',
  function($scope, $rootScope, $location, AuthFactory, SessionFactory) {
    $scope.reg = {
      email: '',
      password: '',
      name: '',
      phone: '',
      plate: ''
    };

    $scope.plate = {};

    $scope.registerUser = function() {
      
      $scope.reg.plate = $scope.plate.state + "&" + $scope.plate.license;

      $rootScope.showLoading("Registering..");
      AuthFactory.register($scope.reg).success(function(data) {
        SessionFactory.createSession(data.user);
        // redirect
        $location.path('/home');
        $rootScope.hideLoading();
      }).error(function(data) {
        if (data.status == 400) {
          $rootScope.hideLoading();
          $rootScope.toast('Invalid Credentials');
        } else if (data.status == 409) {
          $rootScope.hideLoading();
          $rootScope.toast('A user with this username already exists');
        }
      });
    };
  }
])

.controller('ContentController', ['$scope', '$ionicSideMenuDelegate', 
  function($scope, $ionicSideMenuDelegate) {
  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };
}])

.controller('HomeCtrl', ['$scope', '$rootScope', 'SessionFactory', 'ReminderFactory', '$ionicModal', '$timeout',
  function($scope, $rootScope, SessionFactory, ReminderFactory, $ionicModal, $timeout) {

    $scope.badgeNumber = '5';
    $scope.sentMessages = [];

    // Trigger Load reminders
    $timeout(function() {
      $rootScope.$broadcast('load-reminders');
    }, 9); // Race Condition

    $scope.doRefresh = function() {
      $rootScope.$broadcast('load-reminders');
      $scope.$broadcast('scroll.refreshComplete');
    }

    $rootScope.createNew = function() {
      $scope.modal.show();
    }

    $ionicModal.fromTemplateUrl('templates/newReminder.html', function(modal) {
      $scope.modal = modal;
    }, {
      animation: 'slide-in-up',
      focusFirstInput: true
    });

    $rootScope.$on('load-reminders', function(event) {
      $rootScope.showLoading('Fetching Reminders..');
      var user = SessionFactory.getSession();
      ReminderFactory.getAll(user._id).success(function(data) {
        $scope.sentMessages = data.sentMessages;
        $rootScope.hideLoading();
      }).error(function(data) {
        $rootScope.hideLoading();
        $rootScope.toast('Oops.. Something went wrong');
      });
    });

    $scope.deleteReminder = function(reminder) {
      $rootScope.showLoading('Deleting Reminder..');

      ReminderFactory.delete(reminder.userId, reminder._id)
        .success(function(data) {
          console.log(data);
          $rootScope.hideLoading();
          $rootScope.$broadcast('load-reminders');
        }).error(function(data) {
          $rootScope.hideLoading();
          console.log(data);
        })
    }

  }
])

.controller('ReceivedCtrl', ['$scope', '$timeout', '$rootScope', '$filter', 'ReceivedFactory', 'SessionFactory',
function($scope, $timeout, $rootScope, $filter, ReceivedFactory, SessionFactory) {
  $scope.receivedMessages = [];

    // Trigger Load reminders
    $timeout(function() {
      $rootScope.$broadcast('load-messages');
    }, 9); // Race Condition

    $scope.doRefresh = function() {
      $rootScope.$broadcast('load-messages');
      $scope.$broadcast('scroll.refreshComplete');
    }

    $rootScope.$on('load-messages', function(event) {
      $rootScope.showLoading('Fetching Messages...');
      var user = SessionFactory.getSession();
      ReceivedFactory.getAll(user.plate).success(function(data) {
        $scope.receivedMessages = data.receivedMessages;
//        $scope.receivedMessages.date = $filter('date')($scope.receivedMessages.time, 'dd/MM/yyyy HH:mm');
        $rootScope.hideLoading();
      }).error(function(data) {
        $rootScope.hideLoading();
        $rootScope.toast('Oops...something went awry!');
      });
    });

  }
])

.controller('NewReminderCtrl', ['$scope', '$ionicPopup', '$filter', '$rootScope', 'ReminderFactory', 'SessionFactory',
  function($scope, $ionicPopup, $filter, $rootScope, ReminderFactory, SessionFactory) {

    /** http://codepen.io/ooystein/pen/edjyH **/
    $scope.reminder = {
      'sentMessage': '',
      'plate': '',
      'time': ''
    };

    $scope.plate = {};

    /* $scope.$watch('reminder.formattedDate', function(unformattedDate) {
      $scope.reminder.formattedDate = $filter('date')(unformattedDate, 'dd/MM/yyyy HH:mm');
    });
    */
    $scope.createReminder = function() {
      $rootScope.showLoading('Creating...');

      $scope.reminder.plate = $scope.plate.state + "&" + $scope.plate.number;
      var user = SessionFactory.getSession();
      var _r = $scope.reminder;
      var d = new Date();
      _r.time = d.getTime();

      /*
      if (_r.shdlSMS) _r.shdlSMS = d.getTime();
      if (_r.shdlCall) _r.shdlCall = d.getTime();

      delete _r.formattedDate;
      delete _r.fullDate;
      */
      ReminderFactory.create(user._id, _r).success(function(data) {
        $rootScope.hideLoading();
        $scope.modal.hide();
        $rootScope.$broadcast('load-reminders');
      }).error(function(data) {
        $rootScope.hideLoading();
        console.log(data);
      });

    };

  }
]);
