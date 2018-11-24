import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatTableDataSource, MatDialog, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ExpdetailsComponent } from './expdetails/expdetails.component';
import { HttpClient } from '@angular/common/http';
import { LineplotComponent } from './lineplot/lineplot.component';

export interface Model {
  model_tag: string;
  nexp: number;
}

export interface Experiment {
  id: number;
  date: string;
  config: Object;
  artifacts: Object;
  comment: string;
  model_tag: string;
}

const MODEL: Model[] = [
  { model_tag: 'CNN', nexp: 5 },
  { model_tag: 'LSTM', nexp: 3 },
  { model_tag: 'GRU', nexp: 2 },
  { model_tag: 'GRU2', nexp: 10 },
  { model_tag: 'GCN', nexp: 3 },
  { model_tag: 'VAE', nexp: 1 },
];

const EXPERIMENTS: Experiment[] = [
  {
    id: 1, model_tag: 'CNN', date: 'Today', config: { yo: 'value_1', ya: 'value_2' },
    artifacts: { art1: 'artifact1.png', art2: 'artifact2.png' }, comment: 'Deutschland über alles.'
  },
  { id: 2, model_tag: 'CNN', date: 'Yesterday', config: {}, artifacts: {}, comment: 'Deutschland über alles.' },
  { id: 3, model_tag: 'CNN', date: 'Wednesday', config: {}, artifacts: {}, comment: 'Deutschland über alles.' },
  { id: 4, model_tag: 'CNN', date: 'Thursday', config: {}, artifacts: {}, comment: 'Deutschland über alles.' },
  { id: 4, model_tag: 'CNN', date: 'Thursday', config: {}, artifacts: {}, comment: 'Deutschland über alles.' },
  { id: 5, model_tag: 'CNN', date: 'Friday', config: {}, artifacts: {}, comment: 'Deutschland über alles.' },
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Swellboard';

  @ViewChild('linePlot') linePlot: LineplotComponent;
  linePlotData = [];

  mobileQuery: MediaQueryList;

  private _mobileQueryListener: () => void;

  @ViewChild('expPaginator') experimentPaginator: MatPaginator;
  @ViewChild('modelPaginator') modelPaginator: MatPaginator;

  modelDisplayedColumns: string[] = ['select', 'Tag', 'nexp'];
  experimentDisplayedColumns: string[] = ['select', 'details', 'id', 'tag', 'date'];

  modelDataSource = new MatTableDataSource<Model>(MODEL);
  experimentDataSource = new MatTableDataSource<Experiment>(EXPERIMENTS);

  modelSelection = new SelectionModel<Model>(true, []);
  experimentSelection = new SelectionModel<Experiment>(true, []);

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

  applyFilterModel(filterValue: string) {
    this.modelDataSource.filter = filterValue.trim().toLowerCase();
  }
  applyFilterExperiment(filterValue: string) {
    this.experimentDataSource.filter = filterValue.trim().toLowerCase();
  }

  openExperimentDetails(evt: any) {
    console.log(evt);
    this.dialog.open(ExpdetailsComponent, {
      data: EXPERIMENTS.filter((e) => e.id === evt)[0]
    });
  }

  getExperiments() {
    console.log(this.modelSelection.selected);
  }

  plotExperiments() {
    console.log(this.experimentSelection.selected);
  }
  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
    private dialog: MatDialog, private httpClient: HttpClient) {
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

    // this.linePlot.setXLabel('Time');
    // this.linePlot.setYLabel('Smoked Pots');
    // this.linePlot.setNgxData(this.linePlotData);
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit(): void {
    this.experimentDataSource.paginator = this.experimentPaginator;
    this.modelDataSource.paginator = this.modelPaginator;
  }
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

}
