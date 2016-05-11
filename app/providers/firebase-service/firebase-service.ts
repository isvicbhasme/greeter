import {Injectable} from 'angular2/core';
import {Events} from 'ionic-angular';
import {LeaveStruct} from '../../providers/leave-struct/leave-struct'


@Injectable()
export class FirebaseService {
  private baseurl: Firebase = null;
  private uid: string = "";
  private admin: boolean = false; 

  constructor(private events: Events) {
    this.registerForAuthEvents();
  }
  
  public isAdmin(): boolean {
    return this.admin;
  }
  
  public getMyUid(): string {
    return this.uid;
  }
  
  public getRefToBaseUrl() : Firebase {
    if(this.baseurl == null) {
      this.baseurl = new Firebase("https://greeter.firebaseio.com/");
    }
    return this.baseurl;
  }
  
  public addNewLeave(leave: {reason: string, date: number}) {
    if(leave.reason != null && leave.reason.length > 0 && leave.date > 0) {
      let leaveDataRef = this.getRefToBaseUrl().child("leaves/"+leave.date+"/"+this.uid+"/");
      leaveDataRef.update({
        approved: false,
        rejected: false,
        revoked: false,
        reason: leave.reason
      }, (error) => console.log("Error storing new leave: "+error));
      leaveDataRef.parent().setPriority(leave.date);
      let leaves = {};
      leaves[leave.date] = true;
      this.getRefToBaseUrl().child("users/"+this.uid+"/leaves/").update(
        leaves, (error) => console.log("Error storing new leave: "+error));
    }
  }
    
  public registerForCurrentUserLeaveEvents() {
    this.getRefToBaseUrl().child("users/"+this.uid+"/leaves").off();
    this.getRefToBaseUrl().child("users/"+this.uid+"/leaves").on("child_added", (data) => this.handleNewLeaveTimestamp(data));
    this.getRefToBaseUrl().child("users/"+this.uid+"/leaves").on("child_removed", (data) => this.handleDeletedLeaveTimestamp(data));
  }
  
  public revokeLeave(timestamp: number) {
    this.updateLeaveAttribute<boolean>({timestamp: timestamp, key: "revoked", value: true});
  }
  
  private updateLeaveAttribute<T>(changelist: {timestamp: number, key: string, value: T}) {
    let keyValuePair: Object = {};
    keyValuePair[changelist.key] = changelist.value;
    this.getRefToBaseUrl().child("leaves/"+changelist.timestamp+"/"+this.uid+"/").update(keyValuePair);
  }
  
  private handleNewLeaveTimestamp(timestampNode) {
    this.getRefToBaseUrl().child("leaves/"+timestampNode.key()+"/"+this.uid).once("value", (data) => this.publishNewLeaveEvent(data));
    this.getRefToBaseUrl().child("leaves/"+timestampNode.key()+"/"+this.uid).on("child_changed", (data) => this.publishLeaveChangeEvent(data));
  }
  
  private handleDeletedLeaveTimestamp(timestampNode) {
    if(timestampNode != null && timestampNode.ref().parent().parent().key() == this.uid) {
      this.getRefToBaseUrl().child("leaves/"+timestampNode.key()+"/"+this.uid).off();
      this.events.publish("user:leaveDeleted", timestampNode.key());
    }
  }
  
  private publishNewLeaveEvent(data) {
    // data.ref() will return this format - https://greeter.firebaseio.com/leaves/1460678400000/4bbc970a-0eae-481e-b5ad-2cfeac8b188b
    if(data != null) {
      let leave = new LeaveStruct();
      leave.date       = Number(data.ref().parent().key()), // Get the timestamp
      leave.approved   = data.val().approved,
      leave.rejected   = data.val().rejected,
      leave.revoked    = data.val().revoked,
      leave.reason     = data.val().reason
      console.log("Publishing:"+JSON.stringify(leave));
      this.events.publish("user:leaveApplied", leave);
    }
  }
  
  private publishLeaveChangeEvent(data) {
    if(data != null) {
      // data.ref() has url similar to this format - https://greeter.firebaseio.com/leaves/1461868200000/4bbc970a-0eae-481e-b5ad-2cfeac8b188b/approved
      let uidFromRef: string = data.ref().parent().key();
      let timestamp: Number = data.ref().parent().parent().key();
      let changedData: Object = {};
      changedData["key"] = data.key();
      changedData["value"] = data.val();
      changedData["date"] = timestamp;
      if(this.uid == uidFromRef) {
        console.log("Publishing change:"+JSON.stringify(changedData));
        this.events.publish("user:leaveModified", changedData);
      }
    }
  }
  
  private registerForAuthEvents(): void {
    let ref = this.getRefToBaseUrl();
    ref.onAuth((auth) => {
      if(auth) {
        this.uid = auth.uid;
        this.admin = false;
        this.getRefToBaseUrl().child("roles/"+this.uid).once("value", (role) => {
          this.admin = (role.val() >= 10);
          this.events.publish("user:loggedin", {isAdmin: this.admin});
          console.log("User logged in : "+JSON.stringify(auth));
        });
      } else {
        this.uid = "";
        this.events.publish("user:loggedout");
        console.log("Logged out");
      }
    });
  }
}

