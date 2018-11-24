import { Component, ChangeDetectorRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

export interface Model {
  model_tag: string;
}

export interface Experiment {
  id: number;
  date: string;
  config: Object;
  artifacts: Object;
  comment: string;
}

const MODEL: Model[] = [
  { model_tag: 'CNN' },
  { model_tag: 'LSTM' },
  { model_tag: 'GRU' },
  { model_tag: 'GCN' },
  { model_tag: 'VAE' },
];

const EXPERIMENTS: Experiment[] = [
  { id: 1, date: 'Today', config: {}, artifacts: {}, comment: 'Deutschland über alles.' },
  { id: 2, date: 'Yesterday', config: {}, artifacts: {}, comment: 'Deutschland über alles.' },
  { id: 3, date: 'Wednesday', config: {}, artifacts: {}, comment: 'Deutschland über alles.' },
  { id: 4, date: 'Thursday', config: {}, artifacts: {}, comment: 'Deutschland über alles.' },
  { id: 5, date: 'Friday', config: {}, artifacts: {}, comment: 'Deutschland über alles.' },
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Swellboard';

  mobileQuery: MediaQueryList;

  private _mobileQueryListener: () => void;

  modelDisplayedColumns: string[] = ['select', 'Tag'];
  experimentDisplayedColumns: string[] = ['select', 'details', 'id', 'date'];

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
  }
  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

}
