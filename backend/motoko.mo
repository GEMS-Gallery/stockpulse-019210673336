import Hash "mo:base/Hash";
import Array "mo:base/Array";
import Float "mo:base/Float";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Text "mo:base/Text";

actor {
  // Define the Stock type
  type Stock = {
    symbol: Text;
    name: Text;
    price: Float;
  };

  // Create a stable variable to store stocks
  stable var stockEntries : [(Text, Stock)] = [];
  
  // Initialize the HashMap with the stable variable
  var stocks = HashMap.HashMap<Text, Stock>(10, Text.equal, Text.hash);

  // System functions for upgrades
  system func preupgrade() {
    stockEntries := Iter.toArray(stocks.entries());
  };

  system func postupgrade() {
    stocks := HashMap.fromIter<Text, Stock>(stockEntries.vals(), 10, Text.equal, Text.hash);
  };

  // Add a new stock
  public func addStock(symbol: Text, name: Text, price: Float) : async () {
    let stock : Stock = {
      symbol = symbol;
      name = name;
      price = price;
    };
    stocks.put(symbol, stock);
  };

  // Get all stocks
  public query func getAllStocks() : async [Stock] {
    Iter.toArray(stocks.vals())
  };

  // Update stock price
  public func updateStockPrice(symbol: Text, newPrice: Float) : async () {
    switch (stocks.get(symbol)) {
      case (null) { /* Stock not found, do nothing */ };
      case (?stock) {
        let updatedStock : Stock = {
          symbol = stock.symbol;
          name = stock.name;
          price = newPrice;
        };
        stocks.put(symbol, updatedStock);
      };
    };
  };
}
