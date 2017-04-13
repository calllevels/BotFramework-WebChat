requirejs(["../botchat"], function (BotChat) {

  chatInit();

  function chatInit() {
    if (checkStorage()) {
      var chatConversationId = localStorage.getItem('chatConversationId');
      var chatToken = localStorage.getItem('chatToken');

      if(!checkUserSession()) {
        chatSession(chatToken);
      } else {
        var userDetails = {
          id: 'userid',
          name: 'anonymous user'
        };
        var botDetails = {
          id: 'botid',
          name: 'dbs bot'
        };
        chatSession(chatToken);
      }
    } else {
      var httpRequest = new XMLHttpRequest();
      httpRequest.open('GET', 'https://dbs-chat-staging.herokuapp.com/token');
      httpRequest.onload = function () {
        if (httpRequest.status === 200) {
          var chatTokenExchange = JSON.parse(httpRequest.responseText);

          localStorage.setItem('chatConversationId', chatTokenExchange.conversationId);
          localStorage.setItem('chatToken', chatTokenExchange.token);
          chatSession(chatTokenExchange.token);
        }
        else {
          console.log('Request failed. Returned status of ' + httpRequest.status);
          chatInit();
        }
      }
      httpRequest.send();
    }
  }

  function checkStorage() {
    if (localStorage.getItem('chatConversationId' != null && localStorage.getItem('chatToken') != null)) {
      return true;
    }
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

  function checkUserSession(chatConversationId, chatToken) {
    var httpRequest = new XMLHttpRequest();
    var getUrl = 'https://dbs-chat-staging.herokuapp.com/user-state'+'/?chatConversationId='+chatConversationId+'&chatToken='+chatToken;
    httpRequest.open('GET', getUrl);
    httpRequest.onload = function () {
      if (httpRequest.status === 200) {
        var userState = JSON.parse(httpRequest.responseText);
        if (userState.session) {
          return true;
        } else {
          return false;
        }
      }
      else {
        console.log('Request failed. Returned status of ' + httpRequest.status);
        checkUserSession(chatConversationId, chatToken);
      }
    }
    httpRequest.send();
  }
});