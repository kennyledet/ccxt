"use strict";

const ccxt      = require ('./ccxt.es5.js')
const countries = require ('./countries')
const asTable   = require ('as-table')
const util      = require ('util')
const log       = require ('ololog')

require ('ansicolor').nice;

let markets = {}

try {

    markets = require ('./config')

} catch (e) {

    markets = {}
}

ccxt.markets.forEach (id => {
    markets[id] = new (ccxt)[id] ({
        verbose: true,
        // proxy: 'https://crossorigin.me/',
        // proxy: 'https://cors-anywhere.herokuapp.com/',
        // proxy: 'http://cors-proxy.htmldriven.com/?url=',
    })
})

markets['_1broker'].apiKey = 'A0f79063a5e91e6d62fbcbbbbdd63258'

markets['xbtce'].uid    = '68ef0552-3c37-4896-ba56-76173d9cd573'
markets['xbtce'].apiKey = 'dK2jBXMTppAM57ZJ'
markets['xbtce'].secret = 'qGNTrzs3d956DZKSRnPPJ5nrQJCwetAnh7cR6Mkj5E4eRQyMKwKqH7ywsxcR78WT'

markets['coinspot'].apiKey = '36b5803f892fe97ccd0b22da79ce6b21'
markets['coinspot'].secret = 'QGWL9ADB3JEQ7W48E8A3KTQQ42V2P821LQRJW3UU424ATYPXF893RR4THKE9DT0RBNHKX8L54F35KBVFH'
markets['coinspot'].proxy = 'https://cors-anywhere.herokuapp.com/'

markets['lakebtc'].proxy = 'https://crossorigin.me/'

markets['luno'].apiKey = 'nrpzg7rkd8pnf'
markets['luno'].secret = 'Ps0DXw0TpTzdJ2Yek8V5TzFDfTWzyU5vfLdCiBP6vsI'

markets['cex'].apiKey = 'eqCv267WySlu577JnFbGK2RQzIs'
markets['cex'].secret = 'pZnbuNEm5eE4W1VRuFQvZEiFCA'
markets['cex'].uid = 'up105393824'

var countryName = function (code) {
    return ((typeof countries[code] !== 'undefined') ? countries[code] : code)
}

let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms));

let testMarketSymbolTicker = async (market, symbol) => {
    await sleep (market.rateLimit)
    let ticker = await market.fetchTicker (symbol)
    log (market.id, symbol, 'ticker', ticker,
        ticker['datetime'],
        'high: '    + ticker['high'],
        'low: '     + ticker['low'],
        'bid: '     + ticker['bid'],
        'ask: '     + ticker['ask'],
        'volume: '  + ticker['quoteVolume'])

    if (ticker['bid'] > ticker['ask'])
        console.log (this.id, symbol, 'ticker', 'bid is greater than ask!')

    return ticker;
}

let testMarketSymbolOrderbook = async (market, symbol) => {
    await sleep (market.rateLimit) 
    let orderbook = await market.fetchOrderBook (symbol)
    log (market.id, symbol, 'order book',
        orderbook['datetime'],
        'bid: '       + ((orderbook.bids.length > 0) ? orderbook.bids[0][0] : 'N/A'), 
        'bidVolume: ' + ((orderbook.bids.length > 0) ? orderbook.bids[0][1] : 'N/A'),
        'ask: '       + ((orderbook.asks.length > 0) ? orderbook.asks[0][0] : 'N/A'),
        'askVolume: ' + ((orderbook.asks.length > 0) ? orderbook.asks[0][1] : 'N/A'))

    let bids = orderbook.bids
    if (bids.length > 1) {
        let first = 0
        let last = bids.length - 1
        if (bids[first][0] < bids[last][0])
            console.log (market.id, symbol, 'bids reversed')
        else if (bids[first][0] > bids[last][0])
            console.log (market.id, symbol, 'bids ok')
    }
    let asks = orderbook.asks
    if (asks.length > 1) {
        let first = 0
        let last = asks.length - 1
        if (asks[first][0] > asks[last][0])
            console.log (market.id, symbol, 'asks reversed', asks[first][0], asks[last][0])
        else if (asks[first][0] < asks[last][0])
            console.log (market.id, symbol, 'asks ok')
    }

    if (bids.length && asks.length)
        if (bids[0][0] > asks[0][0])
            console.log (this.id, symbol, 'order book', 'bid is greater than ask!')

    return orderbook
}

let testMarketSymbol = async (market, symbol) => {
    await testMarketSymbolTicker (market, symbol)
    if (market.id == 'coinmarketcap') {
        // console.log (await market.fetchTickers ());
        console.log (await market.fetchGlobal ());
    } else {
        await testMarketSymbolOrderbook (market, symbol)

    }
}

let loadMarket = async market => {
    let products  = await market.loadProducts ()
    let keys = Object.keys (products)
    console.log (market.id, keys.length, 'symbols', keys.join (', '))
}

let testMarket = async market => {

    let delay = market.rateLimit

    let keys = Object.keys (market.products)

    let symbol = keys[0]
    let symbols = [
        'BTC/USD',
        'BTC/CNY',
        'BTC/ETH',
        'ETH/BTC',
        'BTC/JPY',
        'LTC/BTC',
    ]
    for (let s in symbols) {
        if (keys.includes (symbols[s])) {
            symbol = symbols[s]
            break
        }
    }

    log.green ('SYMBOL:', symbol)
    if ((symbol.indexOf ('.d') < 0)) {
        await testMarketSymbol (market, symbol)
    }
            
    // let trades = await market.fetchTrades (Object.keys (market.products)[0])
    // console.log (market.id, trades)

    if (!market.apiKey || (market.apiKey.length < 1))
        return true

    // await sleep (delay)

    let balance = await market.fetchBalance ()
    console.log (market.id, 'balance', balance)

    // sleep (delay)

    // try {
    //     let marketSellOrder = await market.createMarketSellOrder (Object.keys (market.products)[0], 1)
    //     console.log (market.id, 'ok', marketSellOrder)
    // } catch (e) {
    //     console.log (market.id, 'error', 'market sell', e)
    // }

    // sleep (delay)

    // try {
    //     let marketBuyOrder = await market.createMarketBuyOrder (Object.keys (market.products)[0], 1)
    //     console.log (market.id, 'ok', marketBuyOrder)
    // } catch (e) {
    //     console.log (market.id, 'error', 'market buy', e)
    // }

    // sleep (delay)

    // try {
    //     let limitSellOrder = await market.createLimitSellOrder (Object.keys (market.products)[0], 1, 3000)
    //     console.log (market.id, 'ok', limitSellOrder)
    // } catch (e) {
    //     console.log (market.id, 'error', 'limit sell', e)
    // }

    // sleep (delay)

    // try {
    //     let limitBuyOrder = await market.createLimitBuyOrder (Object.keys (market.products)[0], 1, 3000)
    //     console.log (market.id, 'ok', limitBuyOrder)
    // } catch (e) {
    //     console.log (market.id, 'error', 'limit buy', e)
    // }

}

//-----------------------------------------------------------------------------

var test = async function () {

    process.on ('uncaughtException',  e => { log.bright.red.error (e); process.exit (1) })
    process.on ('unhandledRejection', e => { log.bright.red.error (e); process.exit (1) })

    //-------------------------------------------------------------------------
    // list all supported exchanges
    
    console.log (asTable.configure ({ delimiter: ' | ' }) (Object.values (markets).map (market => {
        let website = Array.isArray (market.urls.www) ? market.urls.www[0] : market.urls.www
        let countries = Array.isArray (market.countries) ? market.countries.map (countryName).join (', ') : countryName (market.countries)
        let doc = Array.isArray (market.urls.doc) ? market.urls.doc[0] : market.urls.doc
        return {
            'id':        market.id,
            'name':      market.name,
            'countries': countries,
        }        
    })))

    if (process.argv.length > 2) {
        let id = process.argv[2]
        if (!markets[id])
            throw new Error ('Market `' + id + '` not found')
        const market = markets[id]
        await loadMarket (market)
        if (process.argv.length > 3) {
            let symbol = process.argv[3]
            await testMarketSymbol (market, symbol)
        } else {
            await testMarket (market)
        }
    } else {

        for (const id of Object.keys (markets)) {

            if (['lakebtc', 'coinspot'].indexOf (id) < 0) {

                log.bright.green ('MARKET:', id)

                try {
                    const market = markets[id]
                    await loadMarket (market)
                    await testMarket (market)
                } catch (e) {
                    if (e instanceof ccxt.DDoSProtectionError || e.message.includes ('ECONNRESET')) {
                        log.bright.yellow ('[DDoS Protection Error] ' + e.message + ' (ignoring)')
                    } else if (e instanceof ccxt.TimeoutError) {
                        log.bright.yellow ('[Timeout Error] ' + e.message + ' (ignoring)')
                    } else if (e instanceof ccxt.AuthenticationError) {
                        log.bright.yellow ('[Authentication Error] ' + e.message + ' (ignoring)')
                    } else if (e instanceof ccxt.MarketNotAvailaibleError) {
                        log.bright.yellow ('[Market Not Available Error] ' + e.message + ' (ignoring)')
                    } else {
                        throw e;
                    }
                }
            }
        }
    }

} ()
