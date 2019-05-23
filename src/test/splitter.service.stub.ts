import { SplitterService } from "src/app/services/splitter.service";

let splitterServiceStub; //: Partial<SplitterService>;

splitterServiceStub = {
  
  getUsers: function() {
    return [];
  },
  subscribeToUsers: function(subscriber) {
    return null;
  }, 
  getExpenses: function() {
    return [];
  },
  getPaidValues: function() {
    return [];
  }, 
  getFairShares: function() {
    return [];
  },
  getBalances: function() {
    return [];
  }, 
  subscribeToExpenses: function(subscriber) {
    return null;
  },
  subscribeToPayments: function(subscriber) {
    return null;
  },
  getPayments: function() {
    return [];
  }
};

export {splitterServiceStub};