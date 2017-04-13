requirejs(["../botchat"], function (BotChat) {
  console.log(localStorage);
  chatInit();

  function chatInit() {
    var userDetails = {
      id: '999',
      name: 'anonymous user'
    };
    var botDetails = {
      id: '1',
      name: 'dbs bot'
    };
    if (checkStorage()) {
      var chatConversationId = localStorage.getItem('chatConversationId');
      var chatToken = localStorage.getItem('chatToken');

      //TODO call back for user session
      var userSession = checkUserSession(chatConversationId, chatToken);
      

      if(userSession) {
        console.log('session valid');
        userDetails = userSession.user;
        chatSession(chatToken, userDetails, botDetails)
      } else {
        console.log('session not valid');
        chatSession(chatToken, userDetails, botDetails)
      }
    } else {
      var httpRequest = new XMLHttpRequest();
      httpRequest.open('GET', 'https://dbs-chat-staging.herokuapp.com/bot/token');
      httpRequest.onload = function () {
        if (httpRequest.status === 200) {
          var chatTokenExchange = JSON.parse(httpRequest.responseText);

          localStorage.setItem('chatConversationId', chatTokenExchange.conversationId);
          localStorage.setItem('chatToken', chatTokenExchange.token);

          chatSession(chatTokenExchange.token, userDetails, botDetails)
        }
        else {
          console.log('Request failed.');
          chatInit();
        }
      }
      httpRequest.send();
    }
  }

  function checkStorage() {
    if (localStorage.getItem('chatConversationId') != null && localStorage.getItem('chatToken') != null) {
      return true;
    }
  }

  function checkUserSession(chatConversationId, chatToken) {
    // for testing include sessionMock
    // var sessionMock = Math.random() >= 0.5;
    var sessionMock = true;
    var getUrl = 'https://dbs-chat-staging.herokuapp.com/bot/session'+'/?chatConversationId='+chatConversationId+'&chatToken='+chatToken+'&mock='+sessionMock;
    var httpRequest = new XMLHttpRequest();

    httpRequest.open('GET', getUrl);
    httpRequest.onload = function () {
      if (httpRequest.status === 200) {
        var userState = JSON.parse(httpRequest.responseText);
        console.log(userState);
        if (userState.hasOwnProperty('error') && userState.error == 'Unauthorized') {
          return false;
        } else {
          return userState;
        }
      }
      else {
        console.log('Request failed.');
        return false;
      }
    }
    httpRequest.send();
  }

  function chatSession(chatToken, userDetails, botDetails) {
    BotChat.App({
      directLine: {
        token: chatToken,
      },
      user: userDetails,
      bot: botDetails,
      // locale: params['locale'],
      // resize: 'detect'
      sendTyping: true,
    }, document.getElementById("bot-chat"));

    // localStorage.removeItem('chatConversationId');
    // localStorage.removeItem('chatToken');
  }

  // TODO
  function ajaxCall(url, methodType, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open(methodType, url, true);
    xhr.send();
  }
});