import { OnInit } from '@angular/core';

import { Component } from '@angular/core';

import { Utilization } from '../../models/utilization';

import { UtilizationService } from '../../services/utilization.service';

@Component({
  selector: 'home-component',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  private readonly SKIP_FREQ = 0;

  private historicalTotalMemUsed: number[] = new Array();
  private historicalTotalMemLimit: number[] = new Array();
  private historicalTotalCpuUsed: number[] = new Array();
  private historicalTotalCpuLimit: number[] = new Array();

  constructor(
    private utilizationService: UtilizationService
  ) { }

  /**
   * determine page layout onInit
   */
  ngOnInit(): void {
    this.utilizationService.getUtilizations().then(response => {
      this.generateMemoryAndCpuArrays(response);
      console.log(this.historicalTotalMemUsed);
      console.log(this.historicalTotalMemLimit);
      console.log(this.historicalTotalCpuUsed);
      console.log(this.historicalTotalCpuLimit);

      let _memLineChartData:Array<any> = new Array();
      _memLineChartData = [
        {
          data: this.historicalTotalMemUsed,
          label: 'Memory Used'
        },
        {
          data: this.historicalTotalMemLimit,
          label: 'Memory Limit'
        }
      ];

      let _cpuLineChartData:Array<any> = new Array();
      _cpuLineChartData = [
        {
          data: this.historicalTotalCpuUsed,
          label: 'CPU Used'
        },
        {
          data: this.historicalTotalCpuLimit,
          label: 'CPU Limit'
        }
      ];

      this.memLineChartData = _memLineChartData;
      this.cpuLineChartData = _cpuLineChartData;

    });

    this.utilizationService.getNodeCapacities().then(response => {
      console.log(response);
    });
  }

  private generateMemoryAndCpuArrays(utilizations: Utilization[]): void {

    let currentDate: string = "";
    let memUsedTotal: number = 0;
    let memLimitTotal: number = 0;
    let cpuUsedTotal: number = 0;
    let cpuLimitTotal: number = 0;

    let skip: number = 0;

    for(let utilization of utilizations) {
      let newDate: string = utilization.date.substring(0,utilization.date.length-5);
      if(currentDate != newDate) {
        if(skip == 0) {
          this.memLineChartLabels.push(newDate);
          this.cpuLineChartLabels.push(newDate);
          currentDate = newDate;
          this.historicalTotalMemUsed.push(memUsedTotal);
          memUsedTotal = 0;
          this.historicalTotalMemLimit.push(memLimitTotal);
          memLimitTotal = 0;
          this.historicalTotalCpuUsed.push(cpuUsedTotal);
          cpuUsedTotal = 0;
          this.historicalTotalCpuLimit.push(cpuLimitTotal);
          cpuLimitTotal = 0;
        }
      } else {
        memUsedTotal += parseInt(utilization.memUsed);
        memLimitTotal += parseInt(utilization.memLimit);
        cpuUsedTotal += parseInt(utilization.cpuUsed);
        cpuLimitTotal += parseInt(utilization.cpuLimit);
      }
      skip++;
      if(skip > this.SKIP_FREQ) skip = 0;
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
