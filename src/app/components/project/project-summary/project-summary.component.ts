import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import { Project } from "src/app/models/project.model";
import { Firebasev2Service } from "src/app/services/firebasev2.service";
import { selectProjectById } from "src/app/state/app.selectors";
import { AppState } from "src/app/state/app.state";

@Component({
  selector: "app-project-summary",
  templateUrl: "./project-summary.component.html",
  styleUrls: ["./project-summary.component.css"],
})
export class ProjectSummaryComponent implements OnInit {
  projectId: string;
  project$: Observable<Project>;
  project: Project;

  fairShares: { [uid: string]: number } = {};
  balances: { [uid: string]: number } = {};
  paidValues: { [uid: string]: number } = {};

  constructor(
    private route: ActivatedRoute,
    private store: Store<{ projects: AppState }>,
    private db: Firebasev2Service
  ) {}

  ngOnInit(): void {
    // this.project$ = this.route.params.pipe(
    //   mergeMap((params) => {
    //     this.projectId = params.projectId;
    //     return this.store.select(selectProjectById, params.projectId);
    //   }),
    //   tap((v) => console.log("value", v)),
    //   mergeMap((p) => {
    //     if (!p) {
    //       console.log("got no project from store, try to get from db");
    //       return this.db.getProjectById(this.projectId);
    //     } else {
    //       console.log("got db from store");

    //       return of(p);
    //     }
    //   }),
    // );

    this.project$ = this.route.params.pipe(
      mergeMap(params => {
        return this.db.getProjectById(params.projectId);
      }),
      map((v) => {
        console.log("value", v);
        return Project.fromState(v);
      }),
    )

    this.project$.subscribe((p) => {
      this.project = p;
      this.fairShares = p.getFairShares();
      this.balances = p.getBalances();
      this.paidValues = p.getPaidValues();
    });
  }





}
