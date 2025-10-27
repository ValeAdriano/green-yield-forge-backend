declare module 'mssql' {
  import { EventEmitter } from 'events';

  export interface IResult<T = any> {
    recordsets: Array<T[]>;
    recordset: T[];
    rowsAffected: number[];
    returnValue: any;
    output: any;
  }

  export interface IRequest extends EventEmitter {
    query(command: string): Promise<IResult>;
    input(name: string, type: any, value: any): IRequest;
    output(name: string, type: any, value?: any): IRequest;
    execute(command: string): Promise<IResult>;
    executeCommand(command: string): Promise<IResult>;
    stream(onRow?: (row: any) => void): void;
    pipe(stream: any): any;
    cancel(): any;
  }

  export interface IConnectionPool extends EventEmitter {
    connect(): Promise<IConnectionPool>;
    close(): Promise<void>;
    request(): IRequest;
    transaction(): any;
    batch(batch: string, callback?: (err: any, result: IResult<any>) => void): Promise<IResult<any>>;
    batch(batch: string, callback?: (err: any, result: IResult<any>) => void): Promise<IResult<any>>;
    query(command: string): Promise<IResult<any>>;
    connected: boolean;
    connecting: boolean;
    drivers: Array<string>;
    driver: string;
  }

  export function connect(config: string | any): Promise<IConnectionPool>;
  export function query(command: string): Promise<IResult>;
  export const Request: any;
  export const Transaction: any;
  export const PreparedStatement: any;
  export const Connection: any;

  export default {
    connect,
    query,
    Request,
    Transaction,
    PreparedStatement,
    Connection,
  };
}

