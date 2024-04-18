const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const { getDetails } = require("./api");
const { sendFile } = require("./utils");

const bot = new Telegraf(process.env.BOT_TOKEN);

async function isSubscribed(ctx, channelUsername) {
  try {
    const chatMember = await ctx.telegram.getChatMember(channelUsername, ctx.from.id);
    const status = chatMember.status;

    // Return true if the user is a member, administrator, or creator
    return status === 'member' || status === 'administrator' || 'creator';
  } catch (e) {
    console.error('Error checking subscription:', e);
    return false;
  }
}

async function handleMessage(ctx) {
  const channelUsername = '@Film_Nest'; // The target channel username

  // Check if the user is subscribed to the channel
  const isUserSubscribed = await isSubscribed(ctx, channelUsername);

  if (!isUserSubscribed) {
    // If the user is not subscribed, prompt them to join
    await ctx.reply(
      `Please join our channel @Film_Nest to use this bot.`,
      Markup.inlineKeyboard([Markup.button.url("Join Channel", `https://t.me/${channelUsername}`)])
    );
    return;
  }

  // The user is subscribed, continue with the usual functionality
  if (ctx.message && ctx.message.text) {
    const messageText = ctx.message.text;
    if (messageText.includes("terabox.com") || messageText.includes("teraboxapp.com")) {
      // Handle Terabox link processing as usual
      const details = await getDetails(messageText);
      if (details && details.direct_link) {
        try {
          await ctx.reply(`Sending Files. Please wait!`);
          sendFile(details.direct_link, ctx);
        } catch (e) {
          console.error(e);
        }
      } else {
        await ctx.reply('Something went wrong 🙃');
      }
    } else {
      await ctx.reply("Please send a valid Terabox link.");
    }
  }
}

bot.on("message", handleMessage);

async function main() {
  // Set up express and webhook
  const app = express();
  await bot.createWebhook({ domain: process.env.WEBHOOK_URL });

  // Listen on the specified port
  app.listen(process.env.PORT || 3000, () => {
    console.log("Server Started");
  });
}

main();
