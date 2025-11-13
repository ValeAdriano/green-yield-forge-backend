// Declaração de tipos para mssql v10
declare module 'mssql' {
  export interface ConnectionPool {
    request(): Request;
    close(): Promise<void>;
  }

  export interface Request {
    query(query: string): Promise<IResult>;
  }

  export interface IResult {
    recordset: any[];
    rowsAffected: number[];
  }

  export function connect(connectionString: string): Promise<ConnectionPool>;
  
  const sql: {
    connect(connectionString: string): Promise<ConnectionPool>;
  };
  
  export default sql;
}

