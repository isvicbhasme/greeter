import {Injectable} from 'angular2/core';
import {Events} from 'ionic-angular';
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
}

