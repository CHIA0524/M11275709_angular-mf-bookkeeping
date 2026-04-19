import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';

export interface ApiResponse<T = any> {
  rtnCode: string;
  rtnMsg: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor() { }

  /**
   * 模擬 API 請求
   * @param success 是否成功 (true: rtnCode=000000, false: rtnCode=999999)
   * @param data 返回資料
   * @param delayMs 延遲時間 (ms)
   */
  mockRequest<T>(success: boolean = true, data?: T, delayMs: number = 500): Observable<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      rtnCode: success ? '000000' : '999999',
      rtnMsg: success ? '成功' : '操作失敗',
      data: data
    };

    if (!success) {
      return throwError(() => response).pipe(delay(delayMs));
    }

    return of(response).pipe(delay(delayMs));
  }

  /**
   * 成功回應
   */
  successResponse<T>(data?: T): ApiResponse<T> {
    return {
      rtnCode: '000000',
      rtnMsg: '成功',
      data
    };
  }

  /**
   * 失敗回應
   */
  errorResponse(message: string = '操作失敗', code: string = '999999'): ApiResponse {
    return {
      rtnCode: code,
      rtnMsg: message
    };
  }
}
