requirejs(["../botchat"], function (BotChat) {

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

    if (localStorage.getItem('chatConversationId') != null && localStorage.getItem('chatToken') != null) {
      if (localStorage.getItem('chatTime') < Math.round((new Date()).getTime() / 1000)) {
        // expired get new token
        getUrl = 'https://dbs-chat-staging.herokuapp.com/bot/token';
        ajaxCall(getUrl, 'GET', function(res) {
          switch(res[0]) {
            case 0:
              // console.log('Request failed.');
              chatInit();
              break;
            case 1:
              var chatTokenExchange = res[1];
              localStorage.setItem('chatConversationId', chatTokenExchange.conversationId);
              localStorage.setItem('chatToken', chatTokenExchange.token);
              localStorage.setItem('chatTime', (Math.round((new Date()).getTime() / 1000) + chatTokenExchange.expires_in));
              chatSession(chatTokenExchange.token, userDetails, botDetails)
              break;
          }
        });
      } else {
        var chatConversationId = localStorage.getItem('chatConversationId');
        var chatToken = localStorage.getItem('chatToken');

        checkUserSession(chatConversationId, chatToken, function(userSession) {
          if (userSession == 'no session') {
            // console.log('session not valid');
            chatSession(chatToken, userDetails, botDetails);
          } else {
            // console.log('session valid');
            var userId = String(userSession.user.id);
            userDetails = {
              id: userId,
              name: userSession.name
            }
            chatSession(chatToken, userDetails, botDetails);
          }
        });
      }
    } else {
      getUrl = 'https://dbs-chat-staging.herokuapp.com/bot/token';
      ajaxCall(getUrl, 'GET', function(res) {
        switch(res[0]) {
          case 0:
            // console.log('Request failed.');
            chatInit();
            break;
          case 1:
            var chatTokenExchange = res[1];
            localStorage.setItem('chatConversationId', chatTokenExchange.conversationId);
            localStorage.setItem('chatToken', chatTokenExchange.token);
            localStorage.setItem('chatTime', Math.round((new Date()).getTime() / 1000));
            chatSession(chatTokenExchange.token, userDetails, botDetails)
            break;
        }
      });
    }
  }

  function checkUserSession(chatConversationId, chatToken, callback) {
    // for testing include sessionMock
    
    var sessionMock = true;
    var getUrl = 'https://dbs-chat-staging.herokuapp.com/bot/session' + '/?chatConversationId=' + chatConversationId + '&chatToken=' + chatToken + '&mock=' + sessionMock;

    ajaxCall(getUrl, 'GET', function(res) {
      switch (res[0]){
        case 0:
          callback('no session');
          break;
        case 1:
          if (res.hasOwnProperty('error') && res.error == 'Unauthorized') {
            callback('no session');
            break;
          } else {
            callback(res[1]);
            break;
          }
      }
    });

  }

  function ajaxCall(url, methodType, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open(methodType, url, true);
    xhr.send();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          // console.log("xhr done successfully");
          var respJson = JSON.parse(xhr.responseText);
          callback([1, respJson]);
        } else {
          callback([0]);
          // console.log("xhr failed");
        }
      } else {
        // console.log("xhr processing going on");
      }
    }
    // console.log("request sent succesfully");
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
  }
});
