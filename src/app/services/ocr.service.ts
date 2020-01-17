import { Injectable } from "@angular/core";
import * as Teseract from "tesseract.js";
import { createWorker } from 'tesseract.js';
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class OcrService {
  public result$: Observable<Teseract.RecognizeResult>;
  private worker: Teseract.Worker;
  private workerReady = false;

  constructor() {
    this.worker = createWorker({
      logger: m => console.log(m)
    });
    this.prepareWorker();
  }

  async prepareWorker() {
    await this.worker.load();
    await this.worker.loadLanguage('por');
    await this.worker.initialize('por');
    this.workerReady = true;
  }

  recognizeText(image: Teseract.ImageLike) {
    if(!this.workerReady) {
      return;
    }
    let promise = this.worker.recognize(image);
    this.result$ = from(promise);
    return this.result$.pipe(map(result => result.data.text));
  }
}
