var fs = require('fs');
var Crawler = require('crawler');

fs.appendFile('reviews.csv', 'memberName,memberReviews,memberLikes,rating,title,comment,date\n', function (err) {
  if (err) throw err;
});

var c = new Crawler({
    maxConnections : 1,
    jQuery: true,
    rateLimit: 15000,
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            
            var $ = res.$;
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            //console.log($('div[id*="review_"]'));
            
            let reviews = $('#taplc_location_reviews_list_0').find('div[id*="review_"]').each(function(index, value){
                var r = $('#' + value.attribs.id);
                var rating = $('#' + value.attribs.id).find('span.ui_bubble_rating');
                var rating = rating[0].attribs.class.slice(-2);
                var date = r.find('span.ratingDate').text();
                var title = r.find('a span.noQuotes').text();
                var comment = r.find('p.partial_entry').text();
                var more = r.find('p.partial_entry span.taLnk');
                var memberName = r.find('div.username span').text();
                var memberReviews = r.find('div.memberBadgingNoText .badgetext').eq(0).text();
                var memberLikes = r.find('div.memberBadgingNoText .badgetext').eq(1).text();
                
                if(more !== '') {
                    console.log.more[0];
                }
                 
                var line = '"' + memberName + '",' + memberReviews + ',' + memberLikes + ',' + rating + ',"' + title + '","' + comment + '","'  + date + '"\n';
                
                fs.appendFile('reviews.csv', line, function (err) {
                    if (err) throw err;
                });
                
            });
            
        }
        done();
        
    }
});

// 'https://www.tripadvisor.com.br/Attraction_Review-g303285-d313922-Reviews-or10-Beach_Park-Aquiraz_State_of_Ceara.html#REVIEWS'
var url = 'https://www.tripadvisor.com.br/Attraction_Review-g303285-d313922-Reviews-or@@@@@@-Beach_Park-Aquiraz_State_of_Ceara.html#REVIEWS';
var m = 10;
var queue = [
    'https://www.tripadvisor.com.br/Attraction_Review-g303285-d313922-Reviews-Beach_Park-Aquiraz_State_of_Ceara.html#REVIEWS'
];

for (var i = 1; i < 989; i++) {
    queue.push(url.replace('@@@@@@', m * i));
}

// Queue just one URL, with default callback
c.queue(queue);

var p = 1;
c.on('request',function(options){
    console.log(p);
    p++;
});