var fs = require('fs');
var Horseman = require('node-horseman');
var horseman = new Horseman({
    timeout: 20000,
    loadImages: false,
    injectJquery: true,
    webSecurity: true,
    ignoreSSLErrors: true
});

var page = process.argv.slice(2)[0];
console.log(page);

if (page === '0') {
    fs.appendFile('reviewsHorseman.csv', 'memberName,memberReviews,memberLikes,rating,title,comment,date\n', function (err) {
        if (err)
            throw err;
    });
}

var url = 'https://www.tripadvisor.com.br/Attraction_Review-g303285-d313922-Reviews-or@@@@@@-Beach_Park-Aquiraz_State_of_Ceara.html#REVIEWS';
var m = 10;
var queue = [
    'https://www.tripadvisor.com.br/Attraction_Review-g303285-d313922-Reviews-Beach_Park-Aquiraz_State_of_Ceara.html#REVIEWS'
];

for (var i = 1; i < 989; i++) {
    queue.push(url.replace('@@@@@@', m * i));
}

horseman.open(queue[0])
    .click('p.partial_entry span.taLnk:eq(0)')
    .waitForNextPage()
    .evaluate(function () {        

        $ = window.$ || window.jQuery;
        var reviews = [];
        $('#taplc_location_reviews_list_0').find('div[id*="review_"]').each(function (index, value) {
            var r = $('#' + value.id);
            var rating = r.find('span.ui_bubble_rating');
            var rating = rating[0].className.slice(-2);
            var date = r.find('span.ratingDate').text();
            var title = r.find('a span.noQuotes').text();
            var comment = r.find('p.partial_entry').text();
            var memberName = r.find('div.username span').text();
            var memberLocation = r.find('div.location span').text().split(',');
            var memberReviews = r.find('div.memberBadgingNoText .badgetext').eq(0).text();
            var memberLikes = r.find('div.memberBadgingNoText .badgetext').eq(1).text();
            var review = {
                id: value.id,
                rating: rating,
                date: date,
                title: title,
                comment: comment,
                memberName: memberName,
                memberReviews: memberReviews,
                memberLikes: memberLikes,
                memberCity: memberLocation[0],
                memberState: memberLocation[1],
                line: '|' + memberName + '|,|' + memberReviews + '|,|' + memberLikes + '|,|' + rating + '|,|' + title + '|,|' + comment + '|,|' + date + '|\n'          
            };
            reviews.push(review);

        });

        return reviews;
    })
    .then(function (reviews) {
        reviews.forEach(function(review){
            fs.appendFile('reviewsHorseman.csv', review.line, function (err) {
                if (err)
                    throw err;
            });            
        });
    })
    .close();
