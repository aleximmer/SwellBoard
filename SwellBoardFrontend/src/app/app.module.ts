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
  MatListModule, MatDividerModule, MatTableModule, MatCheckboxModule, MatInputModule
} from '@angular/material';

@NgModule({
  declarations: [
    AppComponent,
    LineplotComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatCardModule,
    MatInputModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatOptionModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTableModule,
    MatCheckboxModule,
    MatListModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
