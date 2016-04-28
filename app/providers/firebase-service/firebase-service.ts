import {Injectable} from 'angular2/core';


@Injectable()
export class FirebaseService {
  private baseurl: Firebase = null;

  constructor() {}
  
  getRefToBaseUrl() : Firebase {
    if(this.baseurl == null) {
      this.baseurl = new Firebase("https://greeter.firebaseio.com/");
    }
    return this.baseurl;
  }
}

