import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { map, Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class AppService {
  constructor(private httpService: HttpService) {}
  resendRequest(recipientName: string, request: Request): Observable<AxiosResponse<any>> {
    const recipientUrl: string = process.env[recipientName];
    if (recipientUrl) {
      delete request.headers.host;
      delete request.headers.connection;
      delete request.headers['if-none-match'];

      const config: any = {
        url: recipientUrl + request.originalUrl,
        headers: request.headers,
        method: request.method,
      };
      try {
        return this.httpService.request(config);
      } catch (error) {
        return error;
      }
    }
  }

  getResponse(recipientName: string, request: Request): Observable<AxiosResponse<any>> {
    return this.resendRequest(recipientName, request).pipe(
      map((response) => {
        for (const [key, value] of Object.entries(request.headers)) {
          request.res.setHeader(key, value);
        }
        return response.data;
      })
    );
  }
}
