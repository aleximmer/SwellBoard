import { Component, OnInit, Inject, Pipe, PipeTransform } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Experiment } from '../app.component';

@Component({
  selector: 'app-expdetails',
  templateUrl: './expdetails.component.html',
  styleUrls: ['./expdetails.component.css']
})
export class ExpdetailsComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: Experiment) { }

  ngOnInit() {
  }

}

// pipe used to read dictionaries from html
@Pipe({ name: 'mapToArray' })
export class MapToArray implements PipeTransform {
  transform(value, args: string[]): any {
    const arr = [];
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        arr.push({ key: key, value: value[key] });
      }
    }
    return arr;
  }
}
