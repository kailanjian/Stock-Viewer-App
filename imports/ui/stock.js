import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import { Stocks } from '../api/stocks.js'

import './stock.html';

Template.stock.events({
  'click .delete'() {
    Meteor.call('stocks.remove', this._id);
  },
});

Template.stock.onCreated(function() {
  console.log(this.data);
  this.seriesNum = 0;
  console.log(this.seriesNum);
  Meteor.call('stocks.isDataLoaded', this.data._id, true);
});


Template.stock.onRendered(function() {
  Meteor.call("showStockLoading", false);
  let stockId = this.data._id;
  Meteor.call('getStockData', this.data.symbol, function(err, res) {
    console.log("got stock data");
    if (err) {
      console.log("Error getting stock info");
      return;
    }

    chart.addSeries(res);


    console.log("notifying data load, stockId=" + stockId);
    Meteor.call('stocks.isDataLoaded', stockId, false);
  });
});

Template.stock.onDestroyed(function() {
  chart.get(this.data.symbol).remove();
});