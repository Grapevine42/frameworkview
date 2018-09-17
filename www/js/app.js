// Dom7
var $$ = Dom7;

// Framework7 App main instance
var app  = new Framework7({
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




// 소켓 io서버 설정하기
// var socket = io.connect("http://127.0.0.1:8080");
var socket = io.connect("https://grapevine-chatserver.mybluemix.net/");


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

  let msg;

  socket.on('message', (data)=>{
    msg = data.data.output.text[0];
    console.log('몇번 호출됩니까?');
    receiveMessage(msg);
  });
});


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
        text: msg,
        type: 'received',
        name: 'chatbot',
        avatar: img
      });
      // Hide typing indicator
      messages.hideTyping();
      responseInProgress = false;
    }, 2000);
  }, 1000);
}


