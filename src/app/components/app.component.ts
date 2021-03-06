import { Component, ViewChild, HostListener, OnInit } from '@angular/core';
import { MdSidenav } from '@angular/material';

import { UtilizationService } from '../services/utilization.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public namespaces: string[];

  // Boolean to check if the screen is small enough to be considered "narrow"
  public isNarrow:boolean;

  // Threshold of narrowness. Tweak if necessary
  private narrowThreshold:number = 750;

  constructor(
    private utilizationService: UtilizationService
  ) { }

  ngOnInit(): void {
    this.utilizationService.getNamespaces().then(response => {
      this.namespaces = response;
    });
    this.updateSidenav();
  }

  /**
   * Get the md-sidenav from the html to perform actions on it
   * @param  {MdSidenav} 'sidenav' The sidenav html element from template
   */
  @ViewChild('sidenav') sidenav: MdSidenav;

  /**
   * Function that closes the html md-sidenav
   */
  closeSidenav():void {
    this.sidenav.close();
  }

  /**
   * Grab the window resize event, and determine if the screen is
   * narrow enough to warrent changing page layout
   */
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.updateSidenav();
  }

  /**
   * Check the screen width, and update the sidenav if necessary
   */
  updateSidenav(): void {
    this.isNarrow = (window.innerWidth < this.narrowThreshold);
    if(this.isNarrow){
      this.sidenav.close();
      this.sidenav.mode="over";
    }
    else {
      this.sidenav.open();
      this.sidenav.mode = "side";
    }
  }
}
