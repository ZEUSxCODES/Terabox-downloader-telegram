const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const { getDetails } = require("./api");
const { sendFile } = require("./utils");

const bot = new Telegraf(process.env.BOT_TOKEN);

// Function to check if the user is subscribed to a channel
async function isSubscribed(ctx, channelUsername) {
    try {
        const chatMember = await ctx.telegram.getChatMember(channelUsername, ctx.from.id);
        const status = chatMember.status;
        // Return true if the user is a member, administrator, or creator
        return status === 'member' || status === 'administrator' || status === 'creator';
    } catch (e) {
        console.error('Error checking subscription:', e);
        return false;
    }
}

// Command handler for /start
bot.start(async (ctx) => {
    try {
        ctx.reply(
            `Hi ${ctx.message.from.first_name},\n\nI can download files from Terabox.\n\nMade with ❤️ by @botcodes123.\n\nSend any Terabox link to download.`,
            Markup.inlineKeyboard([
                Markup.button.url("Join Channel", "https://t.me/Film_Nest"),
                Markup.button.url("Report bug", "https://t.me/Armanidrisi_bot"),
            ])
        );
    } catch (e) {
        console.error(e);
    }
});

// Handler for all messages
async function handleMessage(ctx) {
    const channelUsername = '@Film_Nest'; // The target channel username

    try {
        // Check if the user is subscribed to the channel
        const isUserSubscribed = await isSubscribed(ctx, channelUsername);

        if (!isUserSubscribed) {
            // If the user is not subscribed, prompt them to join
            ctx.reply(
                `Please join our channel @Film_Nest to use this bot.`,
                Markup.inlineKeyboard([
                    Markup.button.url("Join Channel", `https://t.me/${channelUsername}`)
                ])
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
                    ctx.reply(`Sending files. Please wait!`);
                    sendFile(details.direct_link, ctx);
                } else {
                    ctx.reply('Something went wrong 🙃');
                }
            } else {
                ctx.reply("Please send a valid Terabox link.");
            }
        }
    } catch (error) {
        console.error('Error handling message:', error);
        ctx.reply('Oops! Something went wrong. Please try again later.');
    }
}

// Replace your current bot.on("message") handler with the handleMessage function
bot.on("message", handleMessage);

async function main() {
    // Set up express and webhook
    const app = express();
    await bot.createWebhook({ domain: process.env.WEBHOOK_URL });

    // Listen on the specified port
    app.listen(process.env.PORT || 3000, () => {
        console.log("Server started.");
    });
}

main();
