import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';
import 'rxjs/Rx';

import { ChartsModule } from 'ng2-charts/ng2-charts';
import 'hammerjs';

import { routing } from './app.routing';

import { AppComponent } from './components/app.component';
import { HomeComponent } from './components/home/home.component';
import { ProjectComponent } from './components/project/project.component';

import { UtilizationService } from './services/utilization.service'

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProjectComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    ChartsModule,
    routing
  ],
  providers: [UtilizationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
