import {Injectable} from 'angular2/core';
import {Events} from 'ionic-angular';
import {LeaveStruct} from '../leave-struct/leave-struct';
import {FirebaseService} from '../firebase-service/firebase-service';

/*
  Generated class for the FirebaseServiceAdmin provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class FirebaseServiceAdmin {

  constructor(private events: Events, private firebaseService: FirebaseService) {}

  public registerForNamelistEvents(): void {
    this.firebaseService.getRefToBaseUrl().child("namelist").off();
    this.firebaseService.getRefToBaseUrl().child("namelist").orderByChild("name").on("child_added", (data) => {
      let user: {uid: string, name: string, username: string};
      console.log("Uid:"+data.ref().key());
      user = {
        uid: data.ref().key(),
        name: data.val().name,
        username: data.val().username
      }
      console.log("Sending:"+JSON.stringify(user));
      this.events.publish("admin:name:added", user);
    });
    
    this.firebaseService.getRefToBaseUrl().child("namelist").on("child_changed", (data) => {
      let user: {uid: string, name: string, username: string};
      console.log("Uid:"+data.ref().key());
      user = {
        uid: data.ref().key(),
        name: data.val().name,
        username: data.val().username
      }
      console.log("Sending:"+JSON.stringify(user));
      this.events.publish("admin:name:changed", user);
    });
  }
  
  public registerAdminForLeaveListing(filter: {by: string, info: Array<string>}): void {
    this.firebaseService.getRefToBaseUrl().child("leaves").off();
    switch (filter.by) {
      case "dateFilter":
        if(filter.info.length == 2) {
          this.firebaseService.getRefToBaseUrl().child("leaves").orderByKey().startAt(filter.info[0]).endAt(filter.info[1]).on("child_added", (event) => {
            if(event != null) {
              Object.keys(event.val()).forEach((node) => {
                let leave = new LeaveStruct();
                let tempObject   = event.val()[node];
                leave.date       = Number(event.key()), // Get the timestamp
                leave.approved   = tempObject.approved
                leave.rejected   = tempObject.rejected,
                leave.revoked    = tempObject.revoked,
                leave.reason     = tempObject.reason,
                leave.uid        = node;
                console.log("Publishing:"+JSON.stringify(leave));
                this.events.publish("admin:leave:added", leave);
              });
            }
          });
          
          this.firebaseService.getRefToBaseUrl().child("leaves").orderByKey().startAt(filter.info[0]).endAt(filter.info[1]).on("child_changed", (event) => {
            if(event != null) {
              let leave = new LeaveStruct();
              let tempObject = event.val()[Object.keys(event.val())[0]];
              leave.date       = Number(event.key()), // Get the timestamp
              leave.approved   = tempObject.approved
              leave.rejected   = tempObject.rejected,
              leave.revoked    = tempObject.revoked,
              leave.reason     = tempObject.reason,
              leave.uid        = Object.keys(event.val())[0];
              console.log("Publishing:"+JSON.stringify(leave));
              this.events.publish("admin:leave:changed", leave);
            }
          });
        }
        break;
    
      default:
        break;
    }
  }
  
  public unregisterLeaveEvents(): void {
    this.firebaseService.getRefToBaseUrl().child("leaves").off();
  }
}

