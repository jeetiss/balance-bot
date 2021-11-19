const { WebClient } = require("@slack/web-api");

// Read a token from the environment variables
const token = process.env.SLACK_TOKEN;

// Initialize
const web = new WebClient(token);

const channel = "C028CMVJUH3";

// "C02MMB5MMNW";

const fridayMessage = (names) =>
  `Hey ${names}, it seems that you are still working) If this task is not so critical, you can continue on Monday. Try to relax and have a nice weekends. Yours, sleepy bot :sleeping:`;

const mondayMessage = (names) =>
  `Hey ${names}, it seems that you are still working) If this task is not so critical, you can continue tomorrow. Try to relax and have a nice evening. Yours, sleepy bot :sleeping:`;

const message = (names) => {
  const today = new Date();
  const dayOfTheWeek = today.getDay();
  if (dayOfTheWeek >= 1 && dayOfTheWeek < 5) {
    return mondayMessage(names);
  }

  return fridayMessage(names);
};

(async () => {
  try {
    const members = await web.conversations.members({ channel });

    if (members.ok) {
      const onlineUsers = await Promise.all(
        members.members.map(async (member) => {
          const isHere = await web.users.getPresence({ user: member });
          if (isHere.ok && (isHere.presence === "active" || isHere.online)) {
            return member;
          }

          return false;
        })
      );

      const textNames = onlineUsers
        .filter(Boolean)
        .map((user) => `<@${user}>`)
        .join(" ");

      const result = await web.chat.postMessage({
        text: message(textNames),
        channel,
      });

      if (result.ok) {
        console.log("✅ message sent");
      }
    }
  } catch (error) {
    console.log(`❌ ${error}`);
  }
})();
