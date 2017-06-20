import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs';

import { Utilization } from '../models/utilization';
import { Node } from '../models/node'

@Injectable()
export class UtilizationService {

  constructor(private http: Http) { }

  getUtilizations(namespace?: string): Promise<Utilization[]> {
    if(!namespace)namespace="";

    let params: URLSearchParams = new URLSearchParams();
    params.set('start', `${Date.now() - 7 * 24 * 60 * 60 * 1000}`);
    params.set('end', `${Date.now()}`);
    let requestOptions = new RequestOptions();
    requestOptions.params = params;

    requestOptions.params
    return this.http.get(`/api/utilizations/${namespace}`, requestOptions)
               .toPromise()
               .then(response => response.json() as Utilization[])
               .catch(this.handleError);
  }

  getLatestUtilizations(namespace?: string): Promise<Utilization[]> {
    if(!namespace)namespace="";

    let params: URLSearchParams = new URLSearchParams();
    params.set('start', `${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}`);
    params.set('end', `${Date.now()}`);
    let requestOptions = new RequestOptions();
    requestOptions.params = params;

    return this.http.get(`/api/utilizations/latest/${namespace}`, requestOptions)
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
    let memUsedPercent = [];
    for(let mem of memUsed) {
      let newMem = mem/memTotal;
      newMem *= 100;
      memUsedPercent.push(newMem);
    }
    let _memPercentLineChartData:Array<any> = new Array();
    _memPercentLineChartData = [
      {
        data: memUsedPercent,
        label: 'Memory Used (%)'
      }
    ];
    return _memPercentLineChartData;
  }

  generateCpuPercentChartData(cpuUsed: number[], cpuTotal: number): Array<any> {
    if(cpuTotal == 0) return [{data: [], label: 'CPU Used (%)'}];
    let cpuUsedPercent = [];
    for(let cpu of cpuUsed) {
      let newCpu = cpu/cpuTotal;
      newCpu *= 100;
      cpuUsedPercent.push(newCpu);
    }
    let _cpuPercentLineChartData: Array<any> = new Array();
    _cpuPercentLineChartData = [
      {
        data: cpuUsedPercent,
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
