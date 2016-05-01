import {Injectable} from 'angular2/core';
import {Events} from 'ionic-angular';


@Injectable()
export class FirebaseService {
  private baseurl: Firebase = null;
  private uid: string = "";

  constructor(private events: Events) {
    this.registerForAuthEvents();
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
  }
  
  private handleNewLeaveTimestamp(timestampNode) {
    this.getRefToBaseUrl().child("leaves/"+timestampNode.key()+"/"+this.uid).once("value", (data) => this.publishNewLeaveEvent(data));
  }
  
  private publishNewLeaveEvent(data) {
    // data.ref() will return this format - https://greeter.firebaseio.com/leaves/1460678400000/4bbc970a-0eae-481e-b5ad-2cfeac8b188b
    if(data != null) {
      let refAsArray : Array<String> = data.ref().toString().split('/');
      refAsArray.pop(); // Remove uid
      let leave = {
        "isApproved" : data.val().approved,
        "isRejected" : data.val().rejected,
        "isRevoked"  : data.val().revoked,
        "reason"     : data.val().reason,
        "date"       : refAsArray.pop() // Get the timestamp
      }
      console.log("Publishing:"+JSON.stringify(leave));
      this.events.publish("user:leaveApplied", leave);
    }
  }
  
  private registerForAuthEvents(): void {
    let ref = this.getRefToBaseUrl();
    ref.onAuth((auth) => {
      if(auth) {
        this.uid = auth.uid;
        this.events.publish("user:loggedin");
        console.log("User logged in : "+JSON.stringify(auth));
      } else {
        this.uid = "";
        this.events.publish("user:loggedout");
        console.log("Logged out");
      }
    });
  }
}

