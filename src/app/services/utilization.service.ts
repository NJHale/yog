import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';

import { Utilization } from '../models/utilization';

@Injectable()
export class UtilizationService {

  constructor(private http: Http) { }

  getUtilizations(namespace?: string): Promise<Utilization[]> {
    if(!namespace)namespace="";
    return this.http.get(`/api/utilizations/${namespace}`)
               .toPromise()
               .then(response => response.json() as Utilization[])
               .catch(this.handleError);
  }

  getLatestUtilizations(namespace?: string): Promise<Utilization[]> {
    if(!namespace)namespace="";
    return this.http.get(`/api/utilizations/latest/${namespace}`)
               .toPromise()
               .then(response => response.json() as Utilization[])
               .catch(this.handleError);
  }

  getNamespaces(): Promise<string[]> {
    return this.http.get('/api/namespaces')
               .toPromise()
               .then(this.extractNamespaces)
               .catch(this.handleError);
  }

  getNodeCapacities(): Promise<string[]> {
    return this.http.get('/api/nodes')
               .toPromise()
               .then(response => response.json() as string[])
               .catch(this.handleError);
  }

  private extractNamespaces(res: Response) {
    let body = res.json();
    return body.namespaces || { };
  }

  /**
  * Handle any errors that may occur.
  */
  private handleError (error: Response | any) {
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Promise.reject(errMsg);
  }

}
