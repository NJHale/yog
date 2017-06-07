import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';

import { Utilization } from '../models/utilization';
import { Node } from '../models/node'

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

  getNodeCapacities(): Promise<Node[]> {
    return this.http.get('/api/nodes')
               .toPromise()
               .then(response => response.json() as Node[])
               .catch(this.handleError);
  }

  absoluteMemoryInGb(memStr: string): number {
    let mem: number = memStr.length > 2 ?
      +memStr.substring(0, memStr.length-2) :
      +memStr;

    let memUnit: string = memStr.length > 2 ?
      memStr.substring(memStr.length-2, memStr.length) :
      'Gi';

    if(memUnit == 'Mi') mem /=1024;

    return mem;
  }

  generateMemChartData(memUsed: number[], memLimit: number[]): Array<any> {
    let _memLineChartData:Array<any> = new Array();
    _memLineChartData = [
      {
        data: memUsed,
        label: 'Memory Used (GB)'
      },
      {
        data: memLimit,
        label: 'Memory Limit (GB)'
      }
    ];
    return _memLineChartData;
  }

  generateCpuChartData(cpuUsed: number[], cpuLimit: number[]): Array<any> {
    let _cpuLineChartData:Array<any> = new Array();
    _cpuLineChartData = [
      {
        data: cpuUsed,
        label: 'CPU Used (GB)'
      },
      {
        data: cpuLimit,
        label: 'CPU Limit (GB)'
      }
    ];
    return _cpuLineChartData;
  }

  generateMemPercentChartData(memUsed: number[], memTotal: number): Array<any> {
    if(memTotal == 0) return [{data: [], label: 'Memory Used (%)'}];
    for(let mem of memUsed) {
      mem /= memTotal;
      mem *= 100;
    }
    let _memPercentLineChartData:Array<any> = new Array();
    _memPercentLineChartData = [
      {
        data: memUsed,
        label: 'Memory Used (%)'
      }
    ];
    return _memPercentLineChartData;
  }

  generateCpuPercentChartData(cpuUsed: number[], cpuTotal: number): Array<any> {
    if(cpuTotal == 0) return [{data: [], label: 'CPU Used (%)'}];
    for(let cpu of cpuUsed) {
      cpu /= cpuTotal;
      cpu *= 100;
    }
    let _cpuPercentLineChartData: Array<any> = new Array();
    _cpuPercentLineChartData = [
      {
        data: cpuUsed,
        label: 'CPU Used (%)'
      }
    ];
    return _cpuPercentLineChartData;
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
