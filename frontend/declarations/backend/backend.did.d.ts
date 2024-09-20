import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Stock { 'name' : string, 'price' : number, 'symbol' : string }
export interface _SERVICE {
  'addStock' : ActorMethod<[string, string, number], undefined>,
  'getAllStocks' : ActorMethod<[], Array<Stock>>,
  'updateStockPrice' : ActorMethod<[string, number], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
