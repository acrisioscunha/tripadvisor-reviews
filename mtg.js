var fs = require('fs');
var Crawler = require('crawler');

var cards = ['Ivy Elemental', 'Llanowar Elves'];
var cotacoes = [];
var lojas = [];
var lojasCardsMinValor = []

var c = new Crawler({
    maxConnections: 1,
    jQuery: true,
    rateLimit: 5000,
    // This will be called for each crawled page
    callback: function (error, res, done) {

        if (error) {
//            console.log(error);
        } else {

            var $ = res.$;

            var card = $('p.subtitulo-card').text();

            var table = $('#cotacao-1 tr').each(function (index, value) {

                var loja = $('#cotacao-1 tr').eq(index).find('td').eq(0).find('img.icon').eq(0)[0];

                if (typeof loja !== 'undefined') {

                    loja = loja.attribs.title;

                    var indexLoja = lojas.indexOf(loja);

                    if (indexLoja === -1) {
                        lojas.push(loja);
                    }

                    indexLoja = lojas.indexOf(loja);

                    if (typeof lojasCardsMinValor[indexLoja] === 'undefined') {

                        lojasCardsMinValor[indexLoja] = [];

                    }

                    if (typeof lojasCardsMinValor[indexLoja][card] === 'undefined') {

                        lojasCardsMinValor[indexLoja][card] = 0;

                    }

                    var foil = $('#cotacao-1 tr').eq(index).find('td').eq(1).text();
                    foil = (foil.match(/Foil/g) || []).length;

                    if (foil <= 0) {

                        var valor = $('#cotacao-1 tr').eq(index).find('td').eq(2).find('p.lj').text();

                        var count = (valor.match(/R\$/g) || []).length;

                        if (count) {

                            valor = valor.replace(new RegExp('\n', 'g'), '').replace(new RegExp(' ', 'g'), '');
                            valor = valor.split('R$');
                            valor.splice(0, 1);

                            if (valor.length === 1) {
                                valor = valor[0];
                            } else {
                                valor = valor[1];
                            }

                            valor = parseFloat(valor.replace(',', '.'));

                            if (lojasCardsMinValor[indexLoja][card] === 0) {

                              lojasCardsMinValor[indexLoja][card] = valor;

                              if (typeof cotacoes[indexLoja] === 'undefined') {

                                cotacoes[indexLoja] = {
                                  nome: loja,
                                  cards: 1,
                                  total: valor
                                };

                              } else {

                                cotacoes[indexLoja].cards += 1;
                                cotacoes[indexLoja].total += valor;

                              }

                            } else if (lojasCardsMinValor[indexLoja][card] > 0
                                      && valor < lojasCardsMinValor[indexLoja][card]) {


                              cotacoes[indexLoja].total -= lojasCardsMinValor[indexLoja][card];
                              cotacoes[indexLoja].total += valor;

                              lojasCardsMinValor[indexLoja][card] = valor;

                            }

//console.log(loja, card, valor, lojasCardsMinValor[indexLoja][card]);

                        }

                    }

                }

            });

        }
        done();

    }

});


var url = 'https://www.ligamagic.com.br/?view=cards%2Fsearch&card=@search';

var queue = [];

cards.forEach(function (card) {

    queue.push(url.replace('@search', encodeURIComponent(card)));

});

c.queue(queue);

var p = 1;
c.on('request', function (options) {
    console.log(p);
    p++;
});

c.on('drain', function (options) {

    cotacoes.sort(function(a, b){
        return (a.cards > b.cards) ? -1 : 1;
    });
    console.log(cotacoes);

});
