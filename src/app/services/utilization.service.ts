import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';

import { Utilization } from '../models/utilization';

@Injectable()
export class UtilizationService {

  constructor(private http: Http) { }

  getUtilizations(): Promise<Utilization[]> {
    return this.http.get('/api/utilizations')
               .toPromise()
               .then(response => response.json() as Utilization[])
               .catch(this.handleError);
  }

  getNamespaces(): Promise<string[]> {
    return this.http.get('/api/namespaces')
               .toPromise()
               .then(response => response.json().namespaces as string[])
               .catch(this.handleError);
  }

  /**
  * Handle any errors that may occur.
  */
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
