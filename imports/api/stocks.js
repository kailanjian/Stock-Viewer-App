import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { HTTP } from 'meteor/http';
import { Session } from 'meteor/session'

import { Errors } from '../api/errors.js';

export const Stocks = new Mongo.Collection('stocks');

if (Meteor.isServer) {
  Meteor.publish('stocks', function stocksPublication() {
    return Stocks.find();
  });
}

Meteor.methods({
  'stocks.insert'(symbol) {
    check(symbol, String);

    // TODO: do validation here to make sure it is a valid symbol
    /*
    if (!valid) {
      throw new Meteor.Error('not-authorized');
    }
*/
/*     */
    Meteor.call('showStockInfoError', false);
    if (Meteor.isServer)
    {
      try {
        Meteor.call('getStockInfo', symbol, function(err, res) {
          if (err) {
            console.log("Error getting stock info");
            //stockSymbolLoading.set(false);
            Meteor.call('showStockInfoError', true);
            Meteor.call("showStockLoading", false);
            return;
          }
          console.log("INSERTING STOCK: " + res);
          Stocks.insert({
            symbol: res.symbol,
            company: res.company,
            description: res.description,
            isDataLoading: true
          });
        });
      }
      catch (e) {
        console.log("Failed to get stock info");
      }
      
    }
  },
  'stocks.remove'(stockId) {
    check(stockId, String);

    Stocks.remove(stockId);
  },
  'stocks.isDataLoaded'(stockId, value) {
    check(stockId, String);

    Stocks.update(stockId, {
      $set: {isDataLoading: value}
    });
  },
  'displayError'(error) {
    console.log(error);
    if (Meteor.isClient) {
      window.alert(error);
    }
  },
  'getStockInfo'(symbol) {
    if(Meteor.isServer) {
      console.log("getting stock info");
      // get key from settings file
      // only accessible on server, but thats fine because we are only on server
      const key = Meteor.settings.quandl.key;
      const url = "https://www.quandl.com/api/v3/datasets/WIKI/" + symbol + ".json?api_key=" + key;

      console.log("URL: " + url);
      var apiCall = function(callback) {
        HTTP.get(url, function(error, res) {
          if (error) {
            console.log("error accessing api");
            var myError = new Meteor.Error("api-error", "stock symbol invalid");
            callback(myError, null);
          } else {

            console.log("got response in server: ")
            console.log("URL: " + url);
            let responseObject = JSON.parse(res.content);
            const company = responseObject.dataset.name.split("(")[0];
            const description = responseObject.dataset.description.split(".")[0];

            let result = {symbol: symbol, company: company, description: description}; 
            console.log("now returning " + result);
            callback(null, result);
          }
        });
      }


      var response = Meteor.wrapAsync(apiCall)();
      return response;

    }
  },
  'getStockData'(symbol) {
    if(Meteor.isServer) {
      console.log("getting stock data");
      // get key from settings file
      // only accessible on server, but thats fine because we are only on server
      const key = Meteor.settings.quandl.key;
      const url = "https://www.quandl.com/api/v3/datasets/WIKI/" + symbol + "/data.json?api_key=" + key;

      var apiCall = function(callback) {
        HTTP.get(url, function(error, res) {
          if (error) {
            console.log("error accessing api");
            console.log(error);
            return;
          }

          console.log("got response in server: ")
          console.log("URL: " + url);
          console.log(JSON.stringify(res).substring(0, 300));
          console.log(JSON.stringify(res.content).substring(0, 300));
          let responseObject = JSON.parse(res.content);
          let data = responseObject.dataset_data.data;

          let formattedData = {name: symbol, data: [], id: symbol};


          let newData = [];
          for (let i = 0; i < data.length; i++) {
            let date = (new Date(data[i][0])).getTime();
            let price = data[i][1];
            newData.push([date, price])
          }

          newData.sort(function(a, b) {
            return a[0] - b[0];
          });
          console.log("New Data" + newData.slice(0, 10));

          formattedData.data = newData;
          
          
          let result = formattedData;
          console.log("now returning " + formattedData.data.slice(0, 100));
          callback(undefined, formattedData);
        });
      }


      var response = Meteor.wrapAsync(apiCall)();
      return response;

    }
  }
  // other methods here
})