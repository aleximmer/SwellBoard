import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LineplotComponent } from './lineplot/lineplot.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {
  MatToolbarModule, MatCardModule,
  MatSidenavModule, MatFormFieldModule,
  MatOptionModule, MatSelectModule,
  MatButtonModule, MatIconModule,
  MatListModule, MatDividerModule, MatTableModule,
  MatCheckboxModule, MatInputModule, MatDialogModule,
  MatTreeModule, MatExpansionModule, MatPaginatorModule, MatProgressBarModule
} from '@angular/material';
import { ExpdetailsComponent, MapToArray } from './expdetails/expdetails.component';
import { HttpClientModule } from '@angular/common/http';
import { ScrollDispatchModule } from '@angular/cdk/scrolling';

import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
  declarations: [
    AppComponent,
    LineplotComponent,
    ExpdetailsComponent,
    MapToArray
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatDialogModule,
    MatProgressBarModule,
    NgxChartsModule,
    MatPaginatorModule,
    MatCardModule,
    MatInputModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatOptionModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    ScrollDispatchModule,
    HttpClientModule,
    MatIconModule,
    MatDividerModule,
    MatTableModule,
    MatCheckboxModule,
    MatListModule,
    MatTreeModule,
  ],
  providers: [],
  entryComponents: [ExpdetailsComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
