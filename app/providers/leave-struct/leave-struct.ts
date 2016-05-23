import {Injectable} from 'angular2/core';


@Injectable()
export class LeaveStruct{
  
  public date: number;
  public reason: string;
  public revoked: boolean;
  public rejected: boolean;
  public approved: boolean;
  public uid: string;
  public displayName: string;
  
  constructor() {
    this.date = this.getTodaysDateAsMilliSec();
    this.reason = "";
    this.revoked = false;
    this.rejected = false;
    this.approved = false;
    this.uid = "";
    this.displayName = "";
  }
  
  public getTodaysDateAsMilliSec(): number {
    let date:Date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  }
}