import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/debounceTime';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/from';

declare let io: any;

@Injectable()
export class StreamService {
  ping = new BehaviorSubject<boolean>(false);
  tweets = new BehaviorSubject([]);
  // tweets = new ReplaySubject(100);

  constructor(http: Http) {
    let socket = io('http://localhost:3000/');

    socket.on('ping', () => this.ping.next(true));

    this.ping
      .debounceTime(1000)
      .subscribe(x => this.ping.next(false));

    // this.tweets = Observable.create((observer) => {
    //   let tweets = [];
    //   socket.on('tweet', (tweet) => {
    //     tweets.unshift(tweet);

    //     if (tweets.length > 100)
    //       tweets.splice(100);

    //     observer.next(tweets);
    //   });
    // });

    // this.tweets = http.get('http://localhost:3000/tweets')
    //   .mergeMap(response => {
    //     return Observable.create((observer) => {
    //       let tweets = response.json() || [];
    //       observer.next(tweets)
    //       socket.on('tweet', (tweet) => {
    //         tweets.unshift(tweet);

    //         if (tweets.length > 100)
    //           tweets.splice(100);

    //         observer.next(tweets);
    //       });
    //     });
    //   });

    let get = http.get('http://localhost:3000/tweets').map(response => response.json());

    let emit = Observable.create(observer => {
      socket.on('tweet', (tweet) => {
        observer.next(tweet);
      });
    });

    get.subscribe(tweets => this.tweets.next(tweets));

    emit.subscribe(tweet => {
      let tweets = this.tweets.value;
      tweets.unshift(tweet);

      if (tweets.length > 100)
        tweets.splice(100);

      this.tweets.next(tweets);
    });
  }
}
