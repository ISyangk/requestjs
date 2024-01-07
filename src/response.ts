type ResponseData<T> = {
    data: T;
    code: number;
    msg: string;
  };
  
  export type Pagination<T> = {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPage: number;
    data: T[];
  };
  
  export type ResponseError = {
    code: number;
    msg: string;
  };
  
  export type MapResponseFunction<T> = (data: ResponseData<T>) => T;
  
  export function mapJson<T>(data: ResponseData<T>): T {
    return data.data;
  }