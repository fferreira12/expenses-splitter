import { Injectable } from "@angular/core";
import * as Teseract from "tesseract.js";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class OcrService {
  public result$: Observable<Teseract.RecognizeResult>;

  constructor() {}


  recognizeText(image: Teseract.ImageLike) {
    let promise = Teseract.recognize(image, "por", {
      logger: m => console.log(m)
    });
    this.result$ = from(promise);
    return this.result$.pipe(map(result => result.data.text));
  }
}
