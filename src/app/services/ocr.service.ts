import { Injectable } from "@angular/core";
import * as Teseract from "tesseract.js";
import { createWorker } from 'tesseract.js';
import { from, Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { SplitterService } from './splitter.service';

@Injectable({
  providedIn: "root"
})
export class OcrService {
  public result$: Observable<Teseract.RecognizeResult>;
  private worker: Promise<Teseract.Worker>;
  private workerReady = false;

  constructor(private splitterService: SplitterService) {
    this.worker = createWorker('por');
    this.prepareWorker();
  }

  async prepareWorker() {
    await this.worker;
    this.workerReady = true;
  }

  recognizeText(image: Teseract.ImageLike) {
    this.splitterService.startLoading();
    if(!this.workerReady) {
      this.splitterService.finishLoading();
      return;
    }
    let promise = this.worker.then(w => w.recognize(image));
    this.result$ = from(promise);
    return this.result$.pipe(map(result => {
      this.splitterService.finishLoading();
      return result;
    }));
  }
}
