import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { EMPTY } from "rxjs";
import { map, mergeMap, catchError } from "rxjs/operators";
import { AuthService } from "../services/auth.service";

import { Firebasev2Service } from "../services/firebasev2.service";
import { appStartup, loadProjects, setUser } from "./app.actions";

@Injectable()
export class AppEffects {
  loadProjects$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setUser),
      mergeMap((action) => {
        return this.db.getProjectsOfUser(false, action.userEmail).pipe(
          map((projects) => {
            console.log("effect called", projects);

            return loadProjects({ projects });
          })
        );
      })
    )
  );

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(appStartup),
      mergeMap(() =>
        this.authService.getUser$().pipe(
          map((user) => {
            //if (!user) return;
            return setUser({ userId: user?.uid, userEmail: user?.email });
          })
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private db: Firebasev2Service,
    private authService: AuthService
  ) {}
}
