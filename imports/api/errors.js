import { Mongo } from 'meteor/mongo';

export const Errors = new Mongo.Collection('errors');

const STOCK_INFO_ERROR = "stockInfoError";
const STOCK_LOADING_ERROR = "stockInfoLoading";

if (Meteor.isServer) {
  Meteor.publish('errors', function() {
    return Errors.find();
  });
}

Meteor.methods({
  'showStockInfoError'(value) {
    console.log("changing error visibility");
    Errors.update({code: STOCK_INFO_ERROR}, {code: STOCK_INFO_ERROR, showing: value});
  },
  'getStockInfoError'() {
    return Errors.findOne({code: STOCK_INFO_ERROR}).value;
  },
  'showStockLoading'(value) {
    console.log("changing loading visibility");
    Errors.update({code: "stockInfoLoading"}, {code: "stockInfoLoading", showing: value});
  },
  'getStockInfoLoading'() {
    return Errors.findOne({code: "stockInfoLoading"}).value;
  }
});