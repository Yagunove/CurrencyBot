var TelegramBot = require('node-telegram-bot-api');

// Устанавливаем токен, который выдавал нам бот.
var token = '481988096:AAFgLQMQPgN-8mFnn2adPh-cQla2K0S3ugI';
// Включить опрос сервера
var bot = new TelegramBot(token, { polling: true });


