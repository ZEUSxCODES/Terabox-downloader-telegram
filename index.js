import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Message;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;

import java.util.ArrayList;
import java.util.List;

public class TeraboxBot extends TelegramLongPollingBot {

    // Method to send a message
    private synchronized void sendMessage(Message message, String text, InlineKeyboardMarkup markup) {
        SendMessage sendMessage = new SendMessage();
        sendMessage.setChatId(message.getChatId().toString());
        sendMessage.setText(text);
        if (markup != null) {
            sendMessage.setReplyMarkup(markup);
        }
        try {
            execute(sendMessage);
        } catch (TelegramApiException e) {
            e.printStackTrace();
        }
    }

    // Method to handle /start command
    private void handleStart(Message message) {
        String firstName = message.getFrom().getFirstName();
        String text = "Hi " + firstName + ",\n\nI can download files from Terabox.\n\nMade with ❤️ by @botcodes123.\n\nSend any Terabox link to download.";
        InlineKeyboardMarkup markup = new InlineKeyboardMarkup();
        List<List<InlineKeyboardButton>> keyboard = new ArrayList<>();
        List<InlineKeyboardButton> row = new ArrayList<>();
        row.add(new InlineKeyboardButton().setText("Join Channel").setUrl("https://t.me/Film_Nest"));
        row.add(new InlineKeyboardButton().setText("Report bug").setUrl("https://t.me/Armanidrisi_bot"));
        keyboard.add(row);
        markup.setKeyboard(keyboard);
        sendMessage(message, text, markup);
    }

    // Method to handle messages
    private void handleMessage(Message message) {
        String channelUsername = "@Film_Nest"; // The target channel username

        // Check if the user is subscribed to the channel
        boolean isUserSubscribed = isSubscribed(message.getChatId(), channelUsername);

        if (!isUserSubscribed) {
            // If the user is not subscribed, prompt them to join
            String text = "Please join our channel @Film_Nest to use this bot.";
            InlineKeyboardMarkup markup = new InlineKeyboardMarkup();
            List<List<InlineKeyboardButton>> keyboard = new ArrayList<>();
            List<InlineKeyboardButton> row = new ArrayList<>();
            row.add(new InlineKeyboardButton().setText("Join Channel").setUrl("https://t.me/" + channelUsername));
            keyboard.add(row);
            markup.setKeyboard(keyboard);
            sendMessage(message, text, markup);
            return;
        }

        // The user is subscribed, continue with the usual functionality
        String messageText = message.getText();
        if (messageText != null && (messageText.contains("terabox.com") || messageText.contains("teraboxapp.com"))) {
            // Handle Terabox link processing as usual
            // getDetails and sendFile methods implementation
            // ...
        } else {
            sendMessage(message, "Please send a valid Terabox link.", null);
        }
    }

    // Method to check if the user is subscribed to a channel
    private boolean isSubscribed(Long chatId, String channelUsername) {
        // Implementation to check subscription status
        // Return true if the user is subscribed, false otherwise
        return true; // Example: Always return true for demonstration purposes
    }

    @Override
    public void onUpdateReceived(Update update) {
        Message message = update.getMessage();
        if (message != null && message.hasText()) {
            String text = message.getText();
            if ("/start".equals(text)) {
                handleStart(message);
            } else {
                handleMessage(message);
            }
        }
    }

    @Override
    public String getBotUsername() {
        // Return bot username
        return "YourBotUsername";
    }

    @Override
    public String getBotToken() {
        // Return bot token
        return "YourBotToken";
    }
}
