import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-lineplot',
  templateUrl: './lineplot.component.html',
  styleUrls: ['./lineplot.component.css']
})
export class LineplotComponent implements OnInit {

  title;
  // ngxChart options
  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel;
  showYAxisLabel = true;
  yAxisLabel;

  // line, area
  autoScale = true;
  ref;
  ngxData = [];

  setTitle(title) {
    this.title = title;
  }

  setXLabel(xAxisLabel) {
    this.xAxisLabel = xAxisLabel;
  }
  setYLabel(yAxisLabel) {
    this.yAxisLabel = yAxisLabel;
  }

  setRef(ref) {
    this.ref = ref;
  }

  getRef() {
    return this.ref;
  }

  setNgxData(ngxData) {
    this.ngxData = [...ngxData];
  }

  getNgxData() {
    return this.ngxData;
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
