import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var'
import { Template } from 'meteor/templating';

import { Stocks } from '../api/stocks.js';
import { Errors } from '../api/errors.js';

import './body.html';
import './stock.js';

var Highcharts = require('highcharts/highstock');

chart = undefined;

stockSymbolLoading = new ReactiveVar(false);


function createChart() {
  chart = Highcharts.stockChart("stock-chart", {
    rangeSelector: {
      selected: 4
    },
    yAxis: {
      plotLines: [{
        value: 0,
        width: 2,
        color: "silver"
      }]
    }, 
    plotOptions: {
      series: {
        showInNavigator: true
      }
    },
    tooltip: {
      pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
      valueDecimals: 2,
      split: true
    },
    series: []
  });
  return chart;
}

Template.body.onCreated(function bodyOnCreated() {
  Meteor.subscribe('stocks');
  Meteor.subscribe('errors');
});

// lets hold on to this code for now
/*
Template.stock.onRendered(function() {

  let stocks = Stocks.find();
  console.log("finding stocks: ");
  console.log(stocks.count());
  stocks.forEach(function(row) {
    console.log(row);
  });
  console.log(stocks.fetch());
});
*/

Template.body.onRendered(function() {
  createChart();
});

Template.body.helpers({
  stocks() {
    return Stocks.find({});
  },
  stockSymbolLoading() {
    let loading = Errors.findOne({code: "stockInfoLoading"});
    console.log("updated stockSymbolLoading " + JSON.stringify(loading));
    return (loading) ? loading.showing : false;
  },
  stockInfoError() {
    let infoError = Errors.findOne({code: "stockInfoError"});
    console.log("updated stock info error " + infoError);
    if (infoError) {
      return infoError.showing;
    } else
    {
      return false;
    }
  }
});

Template.body.events({
  'submit .new-stock'(event) {
    
    // No POST
    event.preventDefault();

    const target = event.target;
    const text = target.text.value;

    Meteor.call("showStockLoading", true);

    Meteor.call('stocks.insert', text);
    console.log("yay form submitted with result ");

    target.text.value = "";

    console.log(Errors.findOne({}));
  }
});

/*
    {symbol: 'AAPL', company: 'Apple', description: 'Apple Company Stock'},
    {symbol: 'TXN', company: 'Texas Instruments', description: 'Texas Instruments Microchip Company'}
    */
 