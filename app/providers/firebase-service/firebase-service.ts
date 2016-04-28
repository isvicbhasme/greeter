import {Injectable} from 'angular2/core';
import {Events} from 'ionic-angular';


@Injectable()
export class FirebaseService {
  private baseurl: Firebase = null;
  private uid: string = "";

  constructor(private events: Events) {
    this.registerForAuthEvents();
  }
  
  getRefToBaseUrl() : Firebase {
    if(this.baseurl == null) {
      this.baseurl = new Firebase("https://greeter.firebaseio.com/");
    }
    return this.baseurl;
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

