﻿'use strict';

var path = require('path');
var request = require('request');

var TOKEN = '481988096:AAG7jELb5ZtWpkKeHqE3RcdKC0Bt9njOF_c';

var baseRequest = request.defaults({
    baseUrl: 'https://api.telegram.org/bot' + TOKEN + '/'
});




var noop = function (err) {
    if (err) { console.log(err); }
};
var callMethod = function (methodName, params, cb) {
    cb = cb || noop;
    var req = { uri: methodName, method: 'POST' };
    if (Object.keys(params).length) {
        req.formData = params;
    }
    baseRequest(req, function (err, response, body) {
        // console.log(err, body);
        if (err) {
            return cb(err);
        }
        cb(err, JSON.parse(body));
    });
};

var getUpdatesOffset = 0;
var getUpdates = function (cb) {
    var params = { offset: getUpdatesOffset, timeout: 60 };
    callMethod('getUpdates', params, function (err, data) {
        if (err) {
            return cb(err);
        }
        if (data.result.length) {
            getUpdatesOffset = data.result[data.result.length - 1].update_id + 1;
        }
        cb(err, data);
    });
}

var handlers = {
    '/btc': function (message) {
        callMethod('sendMessage', { chat_id: message.chat.id, text: '19174$' }); //test
    },
    '/eth': function (message) {
        callMethod('sendMessage', { chat_id: message.chat.id, text: '715$' });
    },
    '/ltc': function (message) {
        callMethod('sendMessage', { chat_id: message.chat.id, text: '327$' });
    },

    // this part of code was borrowed from https://gist.github.com/glukki/50ddfd6a99ee3fd634b1#file-index-js

    '/cat': function (message) {
        request('http://random.cat/meow', function (err, res, body) {
            if (err) {
                console.log(err);
                return callMethod('sendMessage', { chat_id: message.chat.id, text: 'Something went wrong, try again!' });
            }

            var imageUrl = JSON.parse(body).file;
            var file = request(imageUrl);
            var params = {
                chat_id: message.chat.id,
                caption: imageUrl
            };

            if (path.extname(imageUrl) === '.gif') {
                callMethod('sendChatAction', { chat_id: message.chat.id, action: 'upload_document' });
                params.document = file;
                callMethod('sendDocument', params);
            } else {
                callMethod('sendChatAction', { chat_id: message.chat.id, action: 'upload_photo' });
                params.photo = file;
                callMethod('sendPhoto', params);
            }
        });
    }
};

var commands = Object.keys(handlers);
var messageHandler = function (update) {
    if (!update.message || !update.message.text) {
        return console.log('unhandled update', update);
    }

    if (commands.indexOf(update.message.text) !== -1) {
        return handlers[update.message.text](update.message);
    }

    var text = 'You are using CurrencyBot that can show you actual cryptocurrency rates of three main cryptocurrencies such as Bitcoin, Ethereum and Litecoin. And it has additional functionality of showing cat pictures. Here are the commands that you can use: ' + commands.join(' ');
    callMethod('sendMessage', { chat_id: update.message.chat.id, text: text });
};

var runBot = function () {
    getUpdates(function (err, data) {
        if (err) {
            console.log(err);
            return runBot();
        }
        if (!data.ok) {
            console.log(data);
            return runBot();
        }
        data.result.map(messageHandler);
        runBot();
    });
};

callMethod('getMe', {}, function (err, data) {
    if (err) {
        throw err;
    }
    runBot();
});