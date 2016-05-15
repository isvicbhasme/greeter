import {Injectable} from 'angular2/core';
import {Events} from 'ionic-angular';
import {LeaveStruct} from '../leave-struct/leave-struct';
import {FirebaseService} from '../firebase-service/firebase-service';
import * as Constants from '../../util/constants/leave-filter-constants';

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
  
  public registerForLeaveListing(filter: {by: string, info: Array<string>}): void {
    switch (filter.by) {
      case Constants.FILTER_TYPES.dateFilter:
        if(filter.info.length == 2) {
          this.firebaseService.getRefToBaseUrl().child("leaves").orderByKey().startAt(filter.info[0]).endAt(filter.info[1]).on("child_added", (event) => {
            if(event != null) {
              Object.keys(event.val()).forEach((uid) => {
                let leave = new LeaveStruct();
                let tempObject   = event.val()[uid];
                leave.date       = Number(event.key()); // Get the timestamp
                leave.approved   = tempObject.approved;
                leave.rejected   = tempObject.rejected;
                leave.revoked    = tempObject.revoked;
                leave.reason     = tempObject.reason;
                leave.uid        = uid;
                console.log("Publishing admin:leave:added for date:"+JSON.stringify(leave));
                this.events.publish("admin:leave:added", leave);
              });
            }
          });
          
          this.firebaseService.getRefToBaseUrl().child("leaves").orderByKey().startAt(filter.info[0]).endAt(filter.info[1]).on("child_changed", (event) => {
            if(event != null) {
              Object.keys(event.val()).forEach((uid) => {
                let leave = new LeaveStruct();
                let tempObject = event.val()[uid];
                leave.date       = Number(event.key()), // Get the timestamp
                leave.approved   = tempObject.approved,
                leave.rejected   = tempObject.rejected,
                leave.revoked    = tempObject.revoked,
                leave.reason     = tempObject.reason,
                leave.uid        = uid;
                console.log("Publishing admin:leave:changed for date:"+JSON.stringify(leave));
                this.events.publish("admin:leave:changed", leave);
              });
            }
          });
        }
      break;
        
      case Constants.FILTER_TYPES.approvedFilter:
        filter.info.forEach((uid:string) => {
          if(uid != null && uid.length > 0) {
            this.firebaseService.getRefToBaseUrl().child("leaves").orderByChild(uid+"/approved").equalTo(true).on("child_added", (event) => {
              if(event != null) {
                Object.keys(event.val()).forEach((uid) => {
                  let tempObject   = event.val()[uid];
                  if(tempObject.approved === true) { // Might not be true for all childred
                    let leave = new LeaveStruct();
                    leave.date       = Number(event.key()); // Get the timestamp
                    leave.approved   = tempObject.approved;
                    leave.rejected   = tempObject.rejected;
                    leave.revoked    = tempObject.revoked;
                    leave.reason     = tempObject.reason;
                    leave.uid        = uid;
                    console.log("Publishing admin:leave:added for approved true:"+JSON.stringify(leave));
                    this.events.publish("admin:leave:added", leave);
                  }
                });
              }
            });
          }
        });
        if(filter.info.length > 0) {
          this.firebaseService.getRefToBaseUrl().child("leaves").on("child_changed", (event) => {
            if(event != null) {
              console.log("Received event:"+event.val());
              Object.keys(event.val()).forEach((uid) => {
                let tempObject   = event.val()[uid];
                  let leave = new LeaveStruct();
                  leave.date       = Number(event.key()), // Get the timestamp
                  leave.approved   = tempObject.approved,
                  leave.rejected   = tempObject.rejected,
                  leave.revoked    = tempObject.revoked,
                  leave.reason     = tempObject.reason,
                  leave.uid        = uid;
                  if(leave.approved === true) {
                    console.log("Publishing admin:leave:added for approved true:"+JSON.stringify(leave));
                    this.events.publish("admin:leave:added", leave);
                  } else {
                    console.log("ublishing admin:leave:removed for approved false:"+JSON.stringify(leave));
                    this.events.publish("admin:leave:removed", leave);
                  }
              });
            }
          });
        }
      break;
      
      case Constants.FILTER_TYPES.rejectedFilter:
        filter.info.forEach((uid:string) => {
          if(uid != null && uid.length > 0) {
            this.firebaseService.getRefToBaseUrl().child("leaves").orderByChild(uid+"/rejected").equalTo(true).on("child_added", (event) => {
              if(event != null) {
                Object.keys(event.val()).forEach((uid) => {
                  let tempObject   = event.val()[uid];
                  if(tempObject.rejected === true) { // Might not be true for all childred
                    let leave = new LeaveStruct();
                    leave.date       = Number(event.key()); // Get the timestamp
                    leave.approved   = tempObject.approved;
                    leave.rejected   = tempObject.rejected;
                    leave.revoked    = tempObject.revoked;
                    leave.reason     = tempObject.reason;
                    leave.uid        = uid;
                    console.log("Publishing admin:leave:added for rejected true:"+JSON.stringify(leave));
                    this.events.publish("admin:leave:added", leave);
                  }
                });
              }
            });
          }
        });
        if(filter.info.length > 0) {
          this.firebaseService.getRefToBaseUrl().child("leaves").on("child_changed", (event) => {
            if(event != null) {
              Object.keys(event.val()).forEach((uid) => {
                let tempObject   = event.val()[uid];
                  let leave = new LeaveStruct();
                  leave.date       = Number(event.key()), // Get the timestamp
                  leave.approved   = tempObject.approved,
                  leave.rejected   = tempObject.rejected,
                  leave.revoked    = tempObject.revoked,
                  leave.reason     = tempObject.reason,
                  leave.uid        = uid;
                  if(leave.rejected === true) {
                    console.log("Publishing admin:leave:changed for rejected true:"+JSON.stringify(leave));
                    this.events.publish("admin:leave:changed", leave);
                  } else {
                    console.log("Publishing admin:leave:removed for rejected false:"+JSON.stringify(leave));
                    this.events.publish("admin:leave:removed", leave);
                  }
              });
            }
          });
        }
      break;
      
      case Constants.FILTER_TYPES.revokedFilter:
        filter.info.forEach((uid:string) => {
          if(uid != null && uid.length > 0) {
            this.firebaseService.getRefToBaseUrl().child("leaves").orderByChild(uid+"/revoked").equalTo(true).on("child_added", (event) => {
              if(event != null) {
                Object.keys(event.val()).forEach((uid) => {
                  let tempObject   = event.val()[uid];
                  if(tempObject.revoked === true) { // Might not be true for all childred
                    let leave = new LeaveStruct();
                    leave.date       = Number(event.key()); // Get the timestamp
                    leave.approved   = tempObject.approved;
                    leave.rejected   = tempObject.rejected;
                    leave.revoked    = tempObject.revoked;
                    leave.reason     = tempObject.reason;
                    leave.uid        = uid;
                    console.log("Publishing admin:leave:added for revoked true:"+JSON.stringify(leave));
                    this.events.publish("admin:leave:added", leave);
                  }
                });
              }
            });
          }
        });
        
        if(filter.info.length > 0) {
          this.firebaseService.getRefToBaseUrl().child("leaves").on("child_changed", (event) => {
            if(event != null) {
              Object.keys(event.val()).forEach((uid) => {
                let tempObject   = event.val()[uid];
                  let leave = new LeaveStruct();
                  leave.date       = Number(event.key()), // Get the timestamp
                  leave.approved   = tempObject.approved,
                  leave.rejected   = tempObject.rejected,
                  leave.revoked    = tempObject.revoked,
                  leave.reason     = tempObject.reason,
                  leave.uid        = uid;
                  if(leave.revoked === true) {
                    console.log("Publishing admin:leave:changed for revoked true:"+JSON.stringify(leave));
                    this.events.publish("admin:leave:changed", leave);
                  } else {
                    console.log("Publishing admin:leave:changed for revoked false:"+JSON.stringify(leave));
                    this.events.publish("admin:leave:removed", leave);
                  }
              });
            }
          });
        }
      break;
      
      case Constants.FILTER_TYPES.nameFilter:
        filter.info.forEach((uid:string) => {
          if(uid != null && uid.length > 0) {
            this.firebaseService.getRefToBaseUrl().child("leaves").orderByChild(uid).on("child_added", (event) => {
              if(event != null) {
                Object.keys(event.val()).forEach((uid) => {
                  if(filter.info.indexOf(uid) > -1) {
                    let tempObject   = event.val()[uid];
                    let leave = new LeaveStruct();
                    leave.date       = Number(event.key());
                    leave.approved   = tempObject.approved;
                    leave.rejected   = tempObject.rejected;
                    leave.revoked    = tempObject.revoked;
                    leave.reason     = tempObject.reason;
                    leave.uid        = uid;
                    console.log("Publishing admin:leave:added for name:"+JSON.stringify(leave));
                    this.events.publish("admin:leave:added", leave);
                  }
                });
              }
            });
          }
        });
        if(filter.info.length > 0) {
          this.firebaseService.getRefToBaseUrl().child("leaves").on("child_changed", (event) => {
            if(event != null) {
              Object.keys(event.val()).forEach((uid) => {
                if(filter.info.indexOf(uid) > -1) {
                  let tempObject   = event.val()[uid];
                  let leave = new LeaveStruct();
                  leave.date       = Number(event.key()), // Get the timestamp
                  leave.approved   = tempObject.approved,
                  leave.rejected   = tempObject.rejected,
                  leave.revoked    = tempObject.revoked,
                  leave.reason     = tempObject.reason,
                  leave.uid        = uid;
                  console.log("Publishing admin:leave:changed for name:"+JSON.stringify(leave));
                  this.events.publish("admin:leave:changed", leave);
                }
              });
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

