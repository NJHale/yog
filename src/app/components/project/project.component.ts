import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Utilization } from '../../models/utilization';

import { UtilizationService } from '../../services/utilization.service';

@Component({
  selector: 'project-component',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {

  private namespace: string = "";

  private historicalMemUsed: string[] = [];
  private historicalMemLimit: string[] = [];
  private historicalCpuUsed: string[] = [];
  private historicalCpuLimit: string[] = [];

  constructor(
    private utilizationService: UtilizationService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.params.subscribe(routes => {
      this.namespace = routes.namespace;
      this.utilizationService.getUtilizations(this.namespace).then(response => {
        console.log(response);
        this.generateMemoryAndCpuArrays(response);

        let _memLineChartData:Array<any> = new Array();
        _memLineChartData = [
          {
            data: this.historicalMemUsed,
            label: 'Memory Used'
          },
          {
            data: this.historicalMemLimit,
            label: 'Memory Limit'
          }
        ];

        let _cpuLineChartData:Array<any> = new Array();
        _cpuLineChartData = [
          {
            data: this.historicalCpuUsed,
            label: 'CPU Used'
          },
          {
            data: this.historicalCpuLimit,
            label: 'CPU Limit'
          }
        ];

        this.memLineChartData = _memLineChartData;
        this.cpuLineChartData = _cpuLineChartData;
      });
    });
  }

  private generateMemoryAndCpuArrays(utilizations: Utilization[]): void {
    for(let utilization of utilizations) {
      let newDate: string = utilization.date.substring(0,utilization.date.length-5);

      this.historicalMemUsed.push(utilization.memUsed);
      this.historicalMemLimit.push(utilization.memLimit.substring(0, utilization.memLimit.length-2));
      this.historicalCpuUsed.push(utilization.cpuUsed);
      this.historicalCpuLimit.push(utilization.cpuLimit);

      this.memLineChartLabels.push(newDate);
      this.cpuLineChartLabels.push(newDate);
    }
  }

  // memLineChart
  public memLineChartData:Array<any> = [
    {data: [], label: 'Memory Used'},
    {data: [], label: 'Memory Limit'}
  ];
  memLineChartLabels:Array<any> = [];

  // cpuLineChart
  public cpuLineChartData:Array<any> = [
    {data: [], label: 'CPU Used'},
    {data: [], label: 'CPU Limit'}
  ];
  cpuLineChartLabels:Array<any> = [];

  // lineChart
  public lineChartOptions:any = {
    responsive: true,
    bezierCurve: false,
    elements: {
      point: {
        radius: 0
      }
    }
  };
  public lineChartType:string = 'line';
  public lineChartLegend:boolean = true;
  public lineChartColors:Array<any> = [{ // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }, { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    }, { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }];
}
