import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  status: boolean;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data: T | { message?: string; data?: T }) => {
        // If data is already in the standard format, return it as is
        if (
          data &&
          typeof data === 'object' &&
          'status' in data &&
          'message' in data &&
          'data' in data
        ) {
          return data as unknown as Response<T>;
        }

        // Handle cases where data might be an object with message and data
        let message = '';
        let responseData: T | { message?: string; data?: T } | null = data;

        if (data && typeof data === 'object' && !Array.isArray(data)) {
          const dataObj = data as Record<string, unknown>;
          if ('message' in dataObj && typeof dataObj.message === 'string') {
            message = dataObj.message;
            // If it has 'data' property, use it. Otherwise, set responseData to null
            // to avoid returning the object itself as the data.
            responseData = 'data' in dataObj ? (dataObj.data as T) : null;
          }
        }

        return {
          status: true,
          message: message,
          data: responseData as T,
        };
      }),
    );
  }
}
