import {Injectable} from 'angular2/core';

@Injectable() 
export class LeaveFilterResult {
  public groupBy: string;
  public filterBy: string;
  public filterInfo: Array<string>;
  
  constructor() {
    this.groupBy = "";
    this.filterBy = "";
    this.filterInfo = [];
  }
}