import {
  Component, ChangeDetectorRef, ViewChild,
  ComponentFactoryResolver, ApplicationRef,
  Injector, ViewContainerRef
} from '@angular/core';
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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Swellboard';

  runs = [];

  echarts = require('echarts');

  @ViewChild('swellcontainer', { read: ViewContainerRef }) _vcr;

  linePlots = {};
  isVisible = false;
  parallelPlot;

  mobileQuery: MediaQueryList;

  private _mobileQueryListener: () => void;

  @ViewChild('expPaginator') experimentPaginator: MatPaginator;
  @ViewChild('modelPaginator') modelPaginator: MatPaginator;
  @ViewChild('metricPaginator') metricPaginator: MatPaginator;
  @ViewChild('paramsPaginator') paramsPaginator: MatPaginator;

  modelDisplayedColumns: string[] = ['select', 'Tag', 'nexp'];
  experimentDisplayedColumns: string[] = ['select', 'details', 'id', 'tag'];
  metricDisplayedColumns: string[] = ['select', 'metric'];
  paramsDisplayedColumns: string[] = ['select', 'param'];

  modelDataSource;
  experimentDataSource; // = new MatTableDataSource<Experiment>(EXPERIMENTS);
  metricDataSource; // = new MatTableDataSource<Experiment>(EXPERIMENTS);
  paramsDataSource; // = new MatTableDataSource<Experiment>(EXPERIMENTS);

  modelSelection = new SelectionModel<Model>(true, []);
  experimentSelection = new SelectionModel<Experiment>(true, []);
  metricSelection = new SelectionModel(true, []);
  paramsSelection = new SelectionModel(true, []);

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
  isAllParamsSelected() {
    const numSelected = this.paramsSelection.selected.length;
    const numRows = this.paramsDataSource.data.length;
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
  masterToggleParams() {
    this.isAllParamsSelected() ?
      this.paramsSelection.clear() :
      this.paramsDataSource.data.forEach(row => this.paramsSelection.select(row));
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
  applyFilterParams(filterValue: string) {
    this.paramsDataSource.filter = filterValue.trim().toLowerCase();
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
    }));

    this.paramsDataSource = new MatTableDataSource();
    this.paramsDataSource.paginator = this.paramsPaginator;
    this.experimentSelection.selected.forEach((run) => this.apiService.getParameterNames(run._id).subscribe((response) => {
      this.paramsDataSource.data = [...Object.keys(response['config'])];
    }));
  }

  getMetrics() {
    this.metricDataSource.data.forEach((metric) => {
      if ((this.linePlots[(<any>metric)]) && (this.linePlots[(<any>metric)].getRef())) {
        this.linePlots[(<any>metric)].getRef().destroy();
        this.linePlots[(<any>metric)].setRef(null);
      }
    });
    this.metricSelection.selected.forEach((metric) => {
      const componentRef = this.addComp();
      this.linePlots[(<any>metric)] = componentRef.instance;
      this.linePlots[(<any>metric)].setRef(componentRef);
      this.linePlots[(<any>metric)].setNgxData([]);
      this.linePlots[(<any>metric)].setXLabel('Step');
      this.linePlots[(<any>metric)].setYLabel(metric);
      this.linePlots[(<any>metric)].setTitle(metric);
      this.experimentSelection.selected.forEach((run) => {
        this.apiService.getMetricScalars(run._id, metric).subscribe((response) => {
          this.linePlots[(<any>metric)].getNgxData().push(response);
          this.linePlots[(<any>metric)].setNgxData(this.linePlots[(<any>metric)].getNgxData());
        });
      });
    });
  }

  plotComparison() {
    if (this.parallelPlot !== undefined) {
      this.parallelPlot.dispose();
    }

    this.isVisible = true;
    const option = {
      parallelAxis: [],
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
      series: []
    };

    const params = this.paramsSelection.selected;
    const metrics = this.metricSelection.selected;
    const experiments = this.experimentSelection.selected.map((e) => e._id);

    params.forEach((p) => {
      console.log(p);
      console.log(params);
      option.parallelAxis.push({ dim: params.indexOf(p), name: p });
      option.parallelAxis = [...option.parallelAxis];
      option.series.push(0);
      option.series = [...option.series];
    });

    metrics.forEach((p) => {
      option.parallelAxis.push({ dim: metrics.indexOf(p) + params.length, name: p });
      option.parallelAxis = [...option.parallelAxis];
      option.series.push(0);
      option.series = [...option.series];
    });

    console.log(option.parallelAxis);

    this.parallelPlot.setOption(option);

    this.experimentSelection.selected.forEach((e) => {

      const run = {
        name: e._id,
        type: 'parallel',           // The type of this series is 'parallel'
        data: []
      };

      console.log(run);

      const data_dict = {};
      data_dict[e._id] = {};

      this.paramsSelection.selected.forEach((p) => {
        this.apiService.getParameterScalars(e._id, p).subscribe((response) => {
          data_dict[e._id][p] = response['data'][0];
          const keys = Object.keys(data_dict[e._id]);
          keys.sort();
          const sorted = [];
          for (let i = 0; i < keys.length; i++) {
            sorted[sorted.length] = data_dict[e._id][keys[i]];
          }
          run['data'][params.indexOf(p)] = sorted;
          run['data'][params.indexOf(p)] = [...run['data'][params.indexOf(p)]];

          if ((run['data'].length === (params.length + metrics.length))) {
            console.log('run');
            console.log(run);
            option.series[experiments.indexOf(e._id)] = run;
            option.series = [...(<any>option.series[params.length + metrics.length]).flat()];
            this.parallelPlot.setOption(option);
          }
        });
      });
      this.metricSelection.selected.forEach((m) => {
        this.apiService.getResultScalars(e._id, m).subscribe((response) => {
          data_dict[e._id][m] = response['value'];
          const keys = Object.keys(data_dict[e._id]);
          keys.sort();
          const sorted = [];
          for (let i = 0; i < keys.length; i++) {
            sorted[sorted.length] = data_dict[e._id][keys[i]];
          }
          run['data'][metrics.indexOf(m) + params.length] = sorted;
          run['data'][metrics.indexOf(m) + params.length] = [...run['data'][metrics.indexOf(m)]];

          if ((run['data'].length === (params.length + metrics.length))) {
            console.log('run');
            console.log(run);
            option.series[experiments.indexOf(e._id)] = run;
            option.series = [...(<any>option.series).flat()];
            this.parallelPlot.setOption(option);
          }
        });
      });
    });
  }
  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
    private dialog: MatDialog, private apiService: ApiServiceService,
    private factoryResolver: ComponentFactoryResolver, public viewContainerRef: ViewContainerRef) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.apiService.getArtifacts(2).subscribe((response) => {
      const artifact_keys = Object.keys(response);
    });
  }

  public addComp() {
    // swell-main-container
    const componentFactory = this.factoryResolver.resolveComponentFactory(LineplotComponent);
    const componentRef = this._vcr.createComponent(componentFactory);
    return componentRef;
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit(): void {
    this.parallelPlot = this.echarts.init(document.getElementById('metrics_line'), 'dark');

    // initialize echarts instance with prepared DOM
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

  sortByKey(array, key) {
    return array.sort(function (a, b) {
      const x = a[key]; const y = b[key];
      return ((x < y) ? 1 : ((x > y) ? -1 : 0));
    });
  }
}
