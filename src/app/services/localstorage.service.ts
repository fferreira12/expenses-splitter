import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalstorageService {

  constructor() { }

  save(key: string, value:any) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  get(key: string) {
    return JSON.parse(window.localStorage.getItem(key));
  }

}
