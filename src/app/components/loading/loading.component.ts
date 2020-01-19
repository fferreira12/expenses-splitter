import { Component, OnInit, AfterViewInit } from "@angular/core";
import { SplitterService } from "src/app/services/splitter.service";
import { Observable } from 'rxjs';

@Component({
  selector: "app-loading",
  templateUrl: "./loading.component.html",
  styleUrls: ["./loading.component.css"]
})
export class LoadingComponent implements OnInit {
  loading: boolean = true;
  loading$: Observable<boolean>;

  constructor(private splitterService: SplitterService) {}

  ngOnInit() {
    this.loading$ = this.splitterService.getLoadingStatus$();
    this.loading$.subscribe(status => {
      //if the new status is false, delay a bit, to show the spinning for at least some time
      if (status == false) {
        setTimeout(() => {
          this.loading = status;
        }, 300);
      } else {
        this.loading = status;
      }
    });
  }
}
