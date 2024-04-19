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

    // Check if the user is subscribed to the channel
    const isUserSubscribed = await isSubscribed(ctx, channelUsername);

    if (!isUserSubscribed) {
        // If the user is not subscribed, prompt them to join or force subscribe
        ctx.reply(
            Please join our channel @Film_Nest to use this bot. If you've already joined, click below to verify.,
            Markup.inlineKeyboard([
                Markup.button.url("Join Channel", https://t.me/${channelUsername}),
                Markup.button.callback("Verify Subscription", "verify_subscription")
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
                try {
                    ctx.reply(Sending files. Please wait!);
                    sendFile(details.direct_link, ctx);
                } catch (e) {
                    console.error(e);
                }
            } else {
                ctx.reply('Something went wrong 🙃');
            }
        } else {
            ctx.reply("Please send a valid Terabox link.");
        }
    }
}

// Callback query handler for verifying subscription
bot.action("verify_subscription", async (ctx) => {
    const channelUsername = '@Film_Nest'; // The target channel username

    // Check if the user is subscribed to the channel
    const isUserSubscribed = await isSubscribed(ctx, channelUsername);

    if (isUserSubscribed) {
        ctx.answerCbQuery("You're already subscribed. Enjoy using the bot!");
    } else {
        ctx.answerCbQuery("Please make sure you've joined the channel @Film_Nest.");
    }
});

// Replace your current bot.on("message") handler with the handleMessage function
bot.on("message", handleMessage);
