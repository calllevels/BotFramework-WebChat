requirejs(["../botchat"], function(BotChat){
  var params = BotChat.queryParams(location.search);

  var user = {
      id: params['userid'] || 'userid',
      name: params["username"] || 'username'
      };

  var bot = {
      id: params['botid'] || 'botid',
      name: params["botname"] || 'botname'
  };

  window['botchatDebug'] = params['debug'] && params['debug'] === "true";

  BotChat.App({
      directLine: {
          // secret: params['s'],
          // token: params['t'],
          // domain: params['domain'],
          // webSocket: params['webSocket'] && params['webSocket'] === "true" // defaults to true
          secret: 'ayeuvoiD2pA.cwA.vEc.hX2HFbjDbWpn2zWJuVyk0tlxtHHf8PDkYHVrZDdEY0Q'
      },
      user: user,
      bot: bot,
      // locale: params['locale'],
      // resize: 'detect'
      sendTyping: true,
  }, document.getElementById("bot-chat"));
});