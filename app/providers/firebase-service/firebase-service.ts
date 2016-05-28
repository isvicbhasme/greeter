import {Injectable} from 'angular2/core';
import {Events} from 'ionic-angular';
import {LeaveStruct} from '../../providers/leave-struct/leave-struct'


@Injectable()
export class FirebaseService {
  private database: Firebase = null;
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
  
  public getDb() : Firebase {
    if(this.database == null) {
      this.database = firebase.database();
    }
    return this.database;
  }
  
  public logout() {
    if(firebase.auth().currentUser) {
      firebase.auth().signOut();
    }
  }
  
  public addNewLeave(leave: {reason: string, date: number}) {
    if(leave.reason != null && leave.reason.length > 0 && leave.date > 0) {
      let leaveDataRef = this.getDb().ref("leaves/"+leave.date+"/"+this.uid+"/");
      leaveDataRef.update({
        approved: false,
        rejected: false,
        revoked: false,
        reason: leave.reason
      }, (error) => {
        if(error)
          console.log("Error storing new leave: "+error)
    });
      leaveDataRef.parent.setPriority(leave.date);
      let leaves = {};
      leaves[leave.date] = false; // Indicates that leave is in pending state. Should be set to true when approved/rejected/revoked.
      this.getDb().ref("users/"+this.uid+"/leaves/").update(
        leaves, (error) => {
          if(error)
            console.log("Error storing new leave: "+error)
        });
    }
  }
    
  public registerForCurrentUserLeaveEvents() {
    this.getDb().ref("users/"+this.uid+"/leaves").off();
    this.getDb().ref("users/"+this.uid+"/leaves").on("child_added", (data) => this.handleNewLeaveTimestamp(data));
    this.getDb().ref("users/"+this.uid+"/leaves").on("child_removed", (data) => this.handleDeletedLeaveTimestamp(data));
  }
  
  public revokeLeave(timestamp: number) {
    this.updateLeaveAttribute<boolean>({timestamp: timestamp, key: "revoked", value: true});
    let userChangelist = {};
    userChangelist[timestamp] = true;
    this.getDb().ref("users/"+this.uid+"/leaves").update(userChangelist);
  }
  
  private updateLeaveAttribute<T>(changelist: {timestamp: number, key: string, value: T}) {
    let keyValuePair: Object = {};
    keyValuePair[changelist.key] = changelist.value;
    this.getDb().ref("leaves/"+changelist.timestamp+"/"+this.uid+"/").update(keyValuePair);
  }
  
  private handleNewLeaveTimestamp(timestampNode) {
    this.getDb().ref("leaves/"+timestampNode.key+"/"+this.uid).once("value", (data) => this.publishNewLeaveEvent(data));
    this.getDb().ref("leaves/"+timestampNode.key+"/"+this.uid).on("child_changed", (data) => this.publishLeaveChangeEvent(data));
  }
  
  private handleDeletedLeaveTimestamp(timestampNode) {
    if(timestampNode != null && timestampNode.ref.parent.parent.key == this.uid) {
      this.getDb().ref("leaves/"+timestampNode.key+"/"+this.uid).off();
      this.events.publish("user:leaveDeleted", timestampNode.key);
    }
  }
  
  private publishNewLeaveEvent(data) {
    // data.ref will return this format - https://greeter.firebaseio.com/leaves/1460678400000/4bbc970a-0eae-481e-b5ad-2cfeac8b188b
    if(data != null) {
      let leave = new LeaveStruct();
      leave.date       = Number(data.ref.parent.key), // Get the timestamp
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
      // data.ref has url similar to this format - https://greeter.firebaseio.com/leaves/1461868200000/4bbc970a-0eae-481e-b5ad-2cfeac8b188b/approved
      let uidFromRef: string = data.ref.parent.key;
      let timestamp: Number = data.ref.parent.parent.key;
      let changedData: Object = {};
      changedData["key"] = data.key;
      changedData["value"] = data.val();
      changedData["date"] = timestamp;
      if(this.uid == uidFromRef) {
        console.log("Publishing change:"+JSON.stringify(changedData));
        this.events.publish("user:leaveModified", changedData);
      }
    }
  }
  
  private registerForAuthEvents(): void {
    firebase.auth().onAuthStateChanged((auth) => {
      if(auth) {
        this.uid = auth.uid;
        this.admin = false;
        this.getDb().ref("roles/"+this.uid).once("value", (role) => {
          this.admin = (role.val() >= 10);
          this.events.publish("user:loggedin", {isAdmin: this.admin});
          console.log("User logged in : "+auth.email);
        });
      } else {
        this.uid = "";
        this.events.publish("user:loggedout");
        console.log("Logged out");
      }
    });
  }
}

