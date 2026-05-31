import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService, ApiResponse } from './api.service';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserInfo {
  username: string;
  displayName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // 預設使用者
  private defaultUser: UserInfo = {
    username: 'admin',
    displayName: '系統管理員'
  };

  private currentUserSubject = new BehaviorSubject<UserInfo | null>(this.defaultUser);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router,
    private http: HttpClient
  ) {}

  /**
   * 登入 (Mock - 總是成功)
   */
  login(request: LoginRequest): Observable<ApiResponse<UserInfo>> {
    return of({
      rtnCode: '000000',
      rtnMsg: '登入成功',
      data: this.defaultUser
    });
  }

  /**
   * 登出 (移除登出功能)
   */
  logout(): void {
    // 不做任何事，因為沒有登入系統了
    console.log('Login system disabled. Logout is a no-op.');
  }

  /**
   * 檢查是否已登入 (總是 True)
   */
  isAuthenticated(): boolean {
    return true;
  }

  /**
   * 取得當前使用者
   */
  getCurrentUser(): UserInfo | null {
    return this.currentUserSubject.value;
  }
}
