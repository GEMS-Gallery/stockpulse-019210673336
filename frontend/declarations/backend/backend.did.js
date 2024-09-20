export const idlFactory = ({ IDL }) => {
  const Stock = IDL.Record({
    'name' : IDL.Text,
    'price' : IDL.Float64,
    'symbol' : IDL.Text,
  });
  return IDL.Service({
    'addStock' : IDL.Func([IDL.Text, IDL.Text, IDL.Float64], [], []),
    'getAllStocks' : IDL.Func([], [IDL.Vec(Stock)], ['query']),
    'updateStockPrice' : IDL.Func([IDL.Text, IDL.Float64], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
