import { Component, OnInit } from '@angular/core';

import { Utilization } from '../../models/utilization';

import { UtilizationService } from '../../services/utilization.service';

@Component({
  selector: 'home-component',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  private historicalTotalMemUsed: number[] = [];
  private historicalTotalMemLimit: number[] = [];
  private historicalTotalCpuUsed: number[] = [];
  private historicalTotalCpuLimit: number[] = [];

  constructor(
    private utilizationService: UtilizationService
  ) { }

  /**
   * determine page layout onInit
   */
  ngOnInit(): void {
    this.utilizationService.getUtilizations().then(response => {
      this.generateMemoryAndCpuArrays(response);
      this.updateCharts();
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

    for(let utilization of utilizations) {
      // Lower the date resolution to the minute level to consider messages
      // as simultaneous
      let newDate: string = utilization.date.substring(0,utilization.date.length-5);

      if(currentDate != newDate) {
        this.memLineChartLabels.push(newDate);
        this.cpuLineChartLabels.push(newDate);

        currentDate = newDate;

        this.historicalTotalMemUsed.push(memUsedTotal);
        this.historicalTotalMemLimit.push(memLimitTotal);
        this.historicalTotalCpuUsed.push(cpuUsedTotal);
        this.historicalTotalCpuLimit.push(cpuLimitTotal);

        memUsedTotal = 0;
        memLimitTotal = 0;
        cpuUsedTotal = 0;
        cpuLimitTotal = 0;
      } else {
        let memUsed: number =
          this.utilizationService.absoluteMemoryInGb(utilization.memUsed);
        let memLimit: number =
          this.utilizationService.absoluteMemoryInGb(utilization.memLimit);

        memUsedTotal += memUsed;
        memLimitTotal += memLimit;
        cpuUsedTotal += +utilization.cpuUsed;
        cpuLimitTotal += +utilization.cpuLimit;
      }
    }
  }

  private updateCharts(): void {
    this.memLineChartData = this.utilizationService.generateMemChartData(
      this.historicalTotalMemUsed, this.historicalTotalMemLimit
    );
    this.cpuLineChartData = this.utilizationService.generateCpuChartData(
      this.historicalTotalCpuUsed, this.historicalTotalCpuLimit
    );
    this.memLineChartLabels = [];
    this.cpuLineChartLabels = [];
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
