import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {

  constructor(private httpClient: HttpClient) {
  }

  dummyGet() {
    return this.httpClient.get('https://jsonplaceholder.typicode.com/todos/1');
  }
}
