// Dom7
var $$ = Dom7;

// Framework7 App main instance
var app = new Framework7({
  root: '#app', // App root element
  id: 'io.framework7.testapp', // App bundle ID
  name: 'Framework7', // App name
  theme: 'auto', // Automatic theme detection
  // App root data
  data: function () {
    return {
      user: {
        firstName: 'John',
        lastName: 'Doe',
      },
    };
  },
  // App root methods
  methods: {
    helloWorld: function () {
      app.dialog.alert('Hello World!');
    },
  },
  // App routes
  routes: routes,
});

// Init/Create main view
var mainView = app.views.create('.view-main', {
  url: '/'
});


// Init Messages
var messages = app.messages.create({
  el: '.messages',

  // First message rule
  firstMessageRule: function (message, previousMessage, nextMessage) {
    // Skip if title
    if (message.isTitle) return false;
    /* if:
      - there is no previous message
      - or previous message type (send/received) is different
      - or previous message sender name is different
    */
    if (!previousMessage || previousMessage.type !== message.type || previousMessage.name !== message.name) return true;
    return false;
  },
  // Last message rule
  lastMessageRule: function (message, previousMessage, nextMessage) {
    // Skip if title
    if (message.isTitle) return false;
    /* if:
      - there is no next message
      - or next message type (send/received) is different
      - or next message sender name is different
    */
    if (!nextMessage || nextMessage.type !== message.type || nextMessage.name !== message.name) return true;
    return false;
  },
  // Last message rule
  tailMessageRule: function (message, previousMessage, nextMessage) {
    // Skip if title
    if (message.isTitle) return false;
    /* if (bascially same as lastMessageRule):
    - there is no next message
    - or next message type (send/received) is different
    - or next message sender name is different
  */
    if (!nextMessage || nextMessage.type !== message.type || nextMessage.name !== message.name) return true;
    return false;
  }
});

// Init Messagebar
var messagebar = app.messagebar.create({
  el: '.messagebar'
});

// Response flag
var responseInProgress = false;


// // 소켓 io서버 설정하기
var socket = io.connect("http://127.0.0.1:8080");
// var socket = io.connect("https://grapevine-chatserver.mybluemix.net/");

var myInfo = {
  name: "defualt",
  blood: "O rh+",
  age: "30",
  gender: "female",
  lat: 0,
  lng: 0
};

setUserData();

function geoFindMe(callback) {
  if (!navigator.geolocation) {
    // alert("사용자 위치를 파악할 수 없습니다");
    return;
  }

  function success(position) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;

    callback(lat, lng);
  }

  function error() {
    console.error("err gps")
  }

  navigator.geolocation.getCurrentPosition(success, error);
}

function setUserData() {
  //     console.log("location ?")
  geoFindMe(function (lat, lng) {
    myInfo.lat = lat;
    myInfo.lng = lng;
    sendMyInfo()
  });
}

function sendMyInfo() {
  socket.emit("enter", myInfo);

  console.log(myInfo);
}

// Send Message
$$('.send-link').on('click', function () {

  console.log('클릭버튼 누른다');

  var text = messagebar.getValue().replace(/\n/g, '<br>').trim();
  // return if empty message
  if (!text.length) return;

  // Clear area
  messagebar.clear();

  // Return focus to area
  messagebar.focus();

  // Add message to messages
  messages.addMessage({
    text: text,
  });

  if (responseInProgress) return;
  // Receive dummy message

  socket.emit('message', text);

  socket.on('message', (data) => {
    msg = data.data.output.text[0];
    console.log('몇번 호출됩니까?');
    receiveMessage(msg);
  });

  // axios.post('http://127.0.0.1:8080/chat', {
  //   msg: text
  // })
  //   .then(function (response) {
  //     const rawMsg = response.request.response;
  //
  //     var jsonMsg = JSON.parse(rawMsg);
  //     var sendMsg = jsonMsg.data.output.generic[0].title;
  //
  //     console.log(sendMsg);
  //
  //     receiveMessage(sendMsg);
  //   })
  //   .catch(function (error) {
  //     console.log(error);
  //   });
});

function initMap() {
  map = new google.maps.Map(document.getElementById('map_google1'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });

  var orig = {
    lat : 0,
    lng : 0
  };

  var dest = {
    lat : 0,
    lng : 0
  };

  closeShel(function (shelInfo) {
    orig.lat = myInfo.lat;
    orig.lng = myInfo.long;

    dest.lat = Number(shelInfo.lat);
    dest.lng = Number(shelInfo.lag);

    //
    var directionsDisplay = new google.maps.DirectionsRenderer;
    var directionsService = new google.maps.DirectionsService;


    directionsDisplay.setMap(map);
    //

    calculateAndDisplayRoute(directionsService, directionsDisplay, orig, dest);

    getCalInfo(orig, dest, function (call) {
      console.log(call.destinationAddresses);
      console.log(call.rows[0].elements[0].distance.text);
      console.log(call.rows[0].elements[0].duration.text);

      callback(call);
    })
  });
}



function calculateAndDisplayRoute(directionsService, directionsDisplay, orig, dest) {
  console.log(orig);
  console.log(dest);
  directionsService.route({
    origin: orig,  // Haight.
    destination: dest,  // Ocean Beach.
    // Note that Javascript allows us to access the constant
    // using square brackets and a string value as its
    // "property."
    travelMode: 'WALKING'
  }, function(response, status) {
    if (status == 'OK') {
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

function getCalInfo(orig, dest, callbackFunc) {
  var service = new google.maps.DistanceMatrixService;

  var origin = orig;
  var destination = dest;

  service.getDistanceMatrix({
    origins: [origin],
    destinations: [destination],
    travelMode: 'WALKING',
    unitSystem: google.maps.UnitSystem.METRIC
  }, function(response, status) {
    if (status !== 'OK') {
      alert('Error was: ' + status);
    } else {
      // var outputDiv = document.getElementById('output');
      // outputDiv.innerHTML = '';

      // var result = response.rows[0].elements[0];

      // console.log('raw데이터');
      // console.log(response);

      callbackFunc(response);
      // // 거리와 시간 콘솔로 뿌려보기
    }
  });
}


function receiveMessage(msg) {
  var img = 'images/botImg.jpg';
  responseInProgress = true;
  setTimeout(function () {
    // Get random answer and random person

    // Show typing indicator
    messages.showTyping({
      header: 'chatbot is typing',
      avatar: img
    });

    setTimeout(function () {
      // Add received dummy message
      messages.addMessage({
        text: "<div id='map_google1'></div>",
        type: 'received',
        name: 'chatbot',
        avatar: img
      });
      // Hide typing indicator
      messages.hideTyping();
      responseInProgress = false;
      initMap();
    }, 2000);
  }, 1000);
}


