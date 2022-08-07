// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
const { WebClient } = require('@slack/web-api');

const token = process.env.SLACK_BOT_TOKEN;
const web = new WebClient(token);

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  endpoints: {
     events: '/slack/events',
     commands: '/slack/commands' 
   }
});


const devs = [
  {
    name: "phil",
    id: 'U01MBDD5Z35',
    seniority_string: "Senior",
    seniority: 3
  },
  {
    name: 'will',
    id: 'U01MHC8DU4C',
    seniority_string: "Senior",
    seniority: 3
  },
  {
    name: "mark",
    id: 'U01Q1J65A81',
    seniority_string: "Mid",
    seniority: 2
  },
  {
    name: "aled",
    id: 'U02E24P0S1J',
    seniority_string: "Mid",
    seniority: 2
  },
  {
    name: "jeff",
    id: 'U02PNUNV196',
    seniority_string: "Senior",
    seniority: 3
  },
  {
    name: "jack",
    id: 'U02V4UJM83X',
    seniority_string: "Junior",
    seniority: 1
  }
]

const seniority = function(string){
  let str = string.toLowerCase();
  if(str == "jnr"){
    return [1]
  }else if(str == "mid"){
    return [2,3]
  }else if(str == "snr"){
    return [3]
  }else if(str == "!jnr"){
    return [2,3]
  }else if(str == "!mid"){
    return [1,3]
  }else if(str == "!snr"){
    return [1,2]
  }else if(str == "any" || str == "all") {
    return [1,2,3]
  }
}


app.command('/ping', async ({ ack, payload, context, respond, event, logger }) => {
  ack();
  const splitString = payload.text.split(" ")
  const devCmd = splitString[0]
  const devArray = seniority(devCmd)

  const tempArray = []
  const hash = {}
  Array.prototype.forEach.call(devArray, function(el) {
    var result = devs.filter(obj => {
      return obj.seniority === el
    })
    tempArray.push(result)
  })
  const finalArray = tempArray.flat()
  const withoutSelf = finalArray.filter(item => item.id !== payload.user_id );
  const randomDev = withoutSelf[Math.floor(Math.random() * withoutSelf.length)];
  
  const pr = splitString[1]
  splitString.splice(0, 2)
  const desc = splitString.join(' ')
  const channelId = payload.channel_id
  const userId = payload.user_id
  
  ////////////////////
  let users
  try {
    users = await app.client.users.list({
      token: context.botToken
    })
  }
  catch (error) {console.error(error);}
  ////////////////////
  let user
  try {
    user = await app.client.users.info({
      token: context.botToken,
      user: userId
    });
  }
  catch (error) {
    console.error(error);
  }
  ////////////////////
  const emojis = ['😎','🤗','😊','🤩','👌','👍','🤘','👋','🖖','👏','🤝','👐','👏','🙌','🕺','🕶','🌝','🔥','⭐️','🌟','✨','⚡️','💎','🪄','🪅','🎊','🎉','✅','🥷','🪅']
  const randEmo = emojis[Math.floor(Math.random() * emojis.length)];
  try {
    const result = await app.client.chat.postMessage({
      token: context.botToken,
      channel: channelId,
      text: `${randomDev.name} pingBot has randomly picked you to review this PR please: ${pr} ${randEmo} (description: ${desc})`
    });
  }
  catch (error) {
    logger.error(error);
  }

});
//<@${randomDev.id}>


(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
