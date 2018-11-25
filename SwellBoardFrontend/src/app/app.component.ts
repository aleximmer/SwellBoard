import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatTableDataSource, MatDialog, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ExpdetailsComponent } from './expdetails/expdetails.component';
import { HttpClient } from '@angular/common/http';
import { LineplotComponent } from './lineplot/lineplot.component';
import { rgb } from 'd3';
import { ApiServiceService } from './api/api-service.service';

export interface Model {
  model_tag: string;
  nexp: number;
}

export interface Experiment {
  _id: number;
  date: string;
  config: Object;
  artifacts: Object;
  comment: string;
  model_tag: string;
}

const MODEL: Model[] = [
  { model_tag: 'CNN', nexp: 0 },
  { model_tag: 'LSTM', nexp: 0 },
  { model_tag: 'GRU', nexp: 0 },
  { model_tag: 'GRU2', nexp: 0 },
  { model_tag: 'GCN', nexp: 0 },
  { model_tag: 'VAE', nexp: 0 },
];

const EXPERIMENTS: Experiment[] = [
  {
    _id: 1, model_tag: 'CNN', date: 'Today', config: { yo: 'value_1', ya: 'value_2' },
    artifacts: { art1: 'artifact1.png', art2: 'artifact2.png' }, comment: 'Deutschland über alles.'
  },
  { _id: 2, model_tag: 'CNN', date: 'Yesterday', config: {}, artifacts: {}, comment: 'Deutschland über alles.' },
  { _id: 3, model_tag: 'CNN', date: 'Wednesday', config: {}, artifacts: {}, comment: 'Deutschland über alles.' },
  { _id: 4, model_tag: 'CNN', date: 'Thursday', config: {}, artifacts: {}, comment: 'Deutschland über alles.' },
  { _id: 4, model_tag: 'CNN', date: 'Thursday', config: {}, artifacts: {}, comment: 'Deutschland über alles.' },
  { _id: 5, model_tag: 'CNN', date: 'Friday', config: {}, artifacts: {}, comment: 'Deutschland über alles.' },
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Swellboard';

  runs = [];

  echarts = require('echarts');

  @ViewChild('linePlot') linePlot: LineplotComponent;
  linePlotData = [];

  parallelPlot;

  mobileQuery: MediaQueryList;

  private _mobileQueryListener: () => void;

  @ViewChild('expPaginator') experimentPaginator: MatPaginator;
  @ViewChild('modelPaginator') modelPaginator: MatPaginator;
  @ViewChild('metricPaginator') metricPaginator: MatPaginator;

  modelDisplayedColumns: string[] = ['select', 'Tag', 'nexp'];
  experimentDisplayedColumns: string[] = ['select', 'details', 'id', 'tag'];
  metricDisplayedColumns: string[] = ['select', 'metric'];

  modelDataSource;
  experimentDataSource; // = new MatTableDataSource<Experiment>(EXPERIMENTS);
  metricDataSource; // = new MatTableDataSource<Experiment>(EXPERIMENTS);

  modelSelection = new SelectionModel<Model>(true, []);
  experimentSelection = new SelectionModel<Experiment>(true, []);
  metricSelection = new SelectionModel<Experiment>(true, []);

  /** Whether the number of selected elements matches the total number of rows. */
  isAllModelSelected() {
    const numSelected = this.modelSelection.selected.length;
    const numRows = this.modelDataSource.data.length;
    return numSelected === numRows;
  }
  isAllExperimentSelected() {
    const numSelected = this.experimentSelection.selected.length;
    const numRows = this.experimentDataSource.data.length;
    return numSelected === numRows;
  }
  isAllMetricSelected() {
    const numSelected = this.metricSelection.selected.length;
    const numRows = this.metricDataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear modelSelection. */
  masterToggleModel() {
    this.isAllModelSelected() ?
      this.modelSelection.clear() :
      this.modelDataSource.data.forEach(row => this.modelSelection.select(row));
  }
  masterToggleExperiment() {
    this.isAllExperimentSelected() ?
      this.experimentSelection.clear() :
      this.experimentDataSource.data.forEach(row => this.experimentSelection.select(row));
  }
  masterToggleMetric() {
    this.isAllMetricSelected() ?
      this.metricSelection.clear() :
      this.metricDataSource.data.forEach(row => this.metricSelection.select(row));
  }

  applyFilterModel(filterValue: string) {
    this.modelDataSource.filter = filterValue.trim().toLowerCase();
  }
  applyFilterExperiment(filterValue: string) {
    this.experimentDataSource.filter = filterValue.trim().toLowerCase();
  }
  applyFilterMetric(filterValue: string) {
    this.metricDataSource.filter = filterValue.trim().toLowerCase();
  }

  openExperimentDetails(evt: any) {
    const exp = this.experimentDataSource.data.filter((e) => e._id === evt)[0];
    Object.keys(exp.config).forEach((c) => exp.config[c] === null ? exp.config[c] = 'N/D' : exp.config[c] = exp.config[c]);
    this.dialog.open(ExpdetailsComponent, {
      data: exp
    });
  }

  getExperiments() {
    this.experimentDataSource = new MatTableDataSource<Experiment>();
    this.experimentDataSource.paginator = this.experimentPaginator;
    this.modelSelection.selected.forEach((m) => {
      this.apiService.getRuns(m.model_tag).subscribe((response) => {
        this.runs = response['data'].forEach((run) => {
          this.experimentDataSource.data.push(run);
        });
        this.experimentDataSource.data = [...this.experimentDataSource.data];
      });
    });
  }

  plotExperiments() {
    this.metricDataSource = new MatTableDataSource();
    this.metricDataSource.paginator = this.metricPaginator;
    this.experimentSelection.selected.forEach((run) => this.apiService.getMetricNames(run._id).subscribe((response) => {
      this.metricDataSource.data = [...response['data']];
      console.log(this.metricDataSource.data);
    }));
  }

  getMetrics() {
    this.experimentSelection.selected.forEach((run) => {
      this.metricSelection.selected.forEach((metric) => {
        this.apiService.getMetricScalars(run._id, metric).subscribe((response) => {
          console.log(response);
          console.log(response['data']);
        });
      });
    });
    console.log(this.metricSelection.selected);
  }

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
    private dialog: MatDialog, private apiService: ApiServiceService) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    const name = 'CNN';
    this.linePlotData.push({
      // tslint:disable-next-line:max-line-length
      data: [{ name: 'Model 1: ' + name, series: [{ name: 1, value: 20, id: 1 }, { name: 2, value: 15, id: 1 }, { name: 3, value: 10, id: 1 }] },
      { name: 'Model 2: ' + name, series: [{ name: 1, value: 10, id: 2 }, { name: 2, value: 15, id: 2 }, { name: 3, value: 20, id: 2 }] },
      { name: 'Model 3: ' + name, series: [{ name: 1, value: 5, id: 3 }, { name: 2, value: 5, id: 3 }, { name: 3, value: 5, id: 3 }] }],
    });
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit(): void {
    this.linePlot.setXLabel('Time');
    this.linePlot.setYLabel('Smoked Pots');
    this.linePlot.setNgxData(this.linePlotData);

    // initialize echarts instance with prepared DOM
    this.parallelPlot = this.echarts.init(document.getElementById('metrics_line'), 'dark');
    // draw chart
    const option = {
      parallelAxis: [                     // Definitions of axes.
        { dim: 0, name: 'Accuracy' }, // Each axis has a 'dim' attribute, representing dimension index in data.
        { dim: 1, name: 'Recall' },
        { dim: 2, name: 'ROG' },
      ],
      parallel: {                         // Definition of a parallel coordinate system.
        left: '10%',                     // Location of parallel coordinate system.
        right: '13%',
        bottom: '10%',
        top: '15%',
        parallelAxisDefault: {          // A pattern for axis definition, which can avoid repeating in `parallelAxis`.
          type: 'value',
          nameLocation: 'end',
          nameGap: 20,
        }
      },
      legend: {
        bottom: 0,
        data: ['Model 1: CNN', 'Model 2: CNN', 'Model 3: LSTM'],
        itemGap: 20,
        textStyle: {
          color: '#fff',
          fontSize: 14
        }
      },
      series: [                           // Here the three series sharing the same parallel coordinate system.
        {
          name: 'Model 1: CNN',
          type: 'parallel',           // The type of this series is 'parallel'
          data: [
            [1, 55, 9],
            [2, 25, 11],
          ]
        },
        {
          name: 'Model 2: CNN',
          type: 'parallel',
          data: [
            [3, 56, 7],
            [4, 33, 7],
          ]
        },
        {
          name: 'Model 3: LSTM',
          type: 'parallel',
          data: [
            [4, 33, 7],
            [5, 42, 24],
          ]
        }
      ]
    };
    this.parallelPlot.setOption(option);

    this.apiService.getModels().subscribe((response) => {
      this.modelDataSource = new MatTableDataSource<Model>();
      this.modelDataSource.paginator = this.modelPaginator;
      response['data'].forEach((m) => {
        this.modelDataSource.data.push({ model_tag: m, nexp: 0 });
      });
      this.modelDataSource.data = [...this.modelDataSource.data];
    });
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  onResize() {
    this.parallelPlot.resize();
  }

}
