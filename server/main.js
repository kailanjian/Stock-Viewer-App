import { Meteor } from 'meteor/meteor';
import '../imports/api/stocks.js'

Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.methods({
  'data.getStockInfo'(symbol) {
    Stocks.insert({
      symbol: symbol,
      company: "Placeholder Inc.",
      description: "Not real"
    })
    console.log("inserted into db");
    return {symbol: symbol, company: "Placeholder Inc.", description: "Not real"};
  }
});