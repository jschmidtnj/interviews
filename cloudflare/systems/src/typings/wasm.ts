declare class Go {
  importObject: WebAssembly.Imports;
  run(instance: WebAssembly.Instance): void;
}

type callback<TResult> = (err: string, result: TResult) => void;

declare function index(call: callback<string>): void;
declare function hello(call: callback<string>): void;

declare interface ISignRes {
  jwt: string;
  publicKey: string;
}

/**
 * get a signed jwt and the public key as a string
 */
declare function sign(username: string, call: callback<string>): void;

declare interface IVerifyRes {
  message: string;
  code: number;
}
/**
 * verify jwt, return username in plain text
 */
declare function verify(jwt: string, call: callback<string>): void;

/**
 * get the readme for the module
 */
declare function getREADME(call: callback<string>): void;


declare interface IStatsRes {
  averageEncodeTime: number;
  averageDecodeTime: number;
}
/**
 * get stats for jwt
 */
declare function getStats(call: callback<string>): void;
