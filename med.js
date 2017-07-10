var fs = require('fs');
var Crawler = require('crawler');
var request = require('request');

var download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

var uriImages = 'http://images.consultaremedios.com.br/256x256/';

var c = new Crawler({
    maxConnections: 1,
    jQuery: true,
    rateLimit: 15000,
    // This will be called for each crawled page
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {

            var $ = res.$;
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            //console.log($('div[id*="review_"]'));

            var variationList = $('#variation-list').find('a').each(function (index, value) {
                var codigoBarras = value.attribs['data-ean'];
                                
                console.log(codigoBarras);
                download(uriImages + codigoBarras, 'images/' + codigoBarras + '.jpeg', function() { console.log('done'); });
                
            });

        }
        done();

    }
});


var queue = [
    'https://consultaremedios.com.br/tylenol/p'
];


// Queue just one URL, with default callback
c.queue(queue);

var p = 1;
c.on('request', function (options) {
    console.log(p);
    p++;
});