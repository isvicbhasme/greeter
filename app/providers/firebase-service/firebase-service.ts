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
    
  public registerForCurrentUserLeaveEvents() {
    this.getRefToBaseUrl().child("users/"+this.uid+"/leaves").off();
    this.getRefToBaseUrl().child("users/"+this.uid+"/leaves").on("child_added", (data) => this.handleNewLeaveTimestamp(data));
  }
  
  private handleNewLeaveTimestamp(timestampNode) {
    this.getRefToBaseUrl().child("leaves/"+timestampNode.key()+"/"+this.uid).once("value", (data) => this.publishNewLeaveEvent(data));
  }
  
  private publishNewLeaveEvent(data) {
    // data.ref() will return this format - https://greeter.firebaseio.com/leaves/1460678400000/4bbc970a-0eae-481e-b5ad-2cfeac8b188b
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

