import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-lineplot',
  templateUrl: './lineplot.component.html',
  styleUrls: ['./lineplot.component.css']
})
export class LineplotComponent implements OnInit {

  // ngxChart options
  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel;
  showYAxisLabel = true;
  yAxisLabel;
  xScaleMax = 3.1;
  xScaleMin = 0.0;
  yScaleMax = 21;
  yScaleMin = 0.0;

  // line, area
  autoScale = true;

  ngxData = [];

  setXLabel(xAxisLabel) {
    this.xAxisLabel = xAxisLabel;
  }
  setYLabel(yAxisLabel) {
    this.yAxisLabel = yAxisLabel;
  }

  setNgxData(ngxData) {
    this.ngxData = ngxData;
  }

  constructor() { }

  ngOnInit() {
  }

  onPointSelected(data) {
    // tslint:disable-next-line:max-line-length
    console.log(data);
  }

  onPointActivated(data) {
  }

}
