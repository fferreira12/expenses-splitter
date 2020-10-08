import { Injectable } from "@angular/core";
import { Actions, createEffect, Effect, ofType } from "@ngrx/effects";
import { Store } from '@ngrx/store';
import copy from 'fast-copy';
import { EMPTY, from } from "rxjs";
import { map, mergeMap, catchError, tap, withLatestFrom } from "rxjs/operators";
import { Project } from '../models/project.model';
import { AuthService } from "../services/auth.service";

import { Firebasev2Service } from "../services/firebasev2.service";
import { addEditor, addUser, appStartup, archiveProject, deleteProject, loadProjects, noOp, orderProjects, orderUsers, removeEditor, removeUser, renameProject, renameUser, setCurrentProject, setUser, unarchiveProject } from "./app.actions";
import { AppState } from './app.state';

@Injectable()
export class AppEffects {
  loadProjects$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setUser),
      mergeMap((action) => {
        return this.db.getProjectsOfUser(false, action.userId).pipe(
          map((projects) => {
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

  loadLastProject$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setUser),
      mergeMap((action) => {
        return this.db.getLastProject(action.userId).pipe(
          map((lastProjectSnap) => {
            let projectId: string = lastProjectSnap?.data()?.projectId;
            if (projectId) {
              return setCurrentProject({ projectId: lastProjectSnap.data().projectId });
            } else {
              return noOp();
            }

          })
        );
      })
    )
  });

  @Effect({ dispatch: false })
  saveLastProject$ = this.actions$.pipe(
    ofType(setCurrentProject),
    tap((action) => {
      console.log('inside effect');

      this.db.saveLastProject(action.projectId)
    })
  );

  @Effect({ dispatch: false })
  saveProject$ = this.actions$.pipe(
    ofType(renameProject, archiveProject, unarchiveProject, addEditor, removeEditor),
    withLatestFrom(this.store),
    tap(([action, appState]) => {
      let st: AppState = copy(appState).projects;
      let p = [...st.selfProjects, ...st.otherProjects].find(p => p.projectId == action.projectId);
      this.db.saveProject(p.ownerId, Project.fromState(p));
    })
  );

  @Effect({ dispatch: false })
  deleteProject$ = this.actions$.pipe(
    ofType(deleteProject),
    tap((action) => {
      this.db.deleteProject(action.projectId)
    })
  );

  @Effect({ dispatch: false })
  saveAllProjects$ = this.actions$.pipe(
    ofType(orderProjects),
    withLatestFrom(this.store),
    tap(([action, appState]) => {
      let st: AppState = copy(appState).projects;
      [...appState.projects.selfProjects, ...appState.projects.otherProjects].forEach(p => {
        this.db.saveProject(p.ownerId, Project.fromState(p));
      });
    })
  );

  @Effect({ dispatch: false })
  saveCurrentProject$ = this.actions$.pipe(
    ofType(addUser, removeUser, renameUser, orderUsers),
    withLatestFrom(this.store),
    tap(([action, appState]) => {
      let st: AppState = copy(appState).projects;
      let p = [...st.selfProjects, ...st.otherProjects].find(p => p.projectId == appState.projects.currentProject);
      //console.log('saving user to db', action.userName);
      // debugger;
      this.db.saveProject(p.ownerId, Project.fromState(p));
    })
  );


  constructor(
    private actions$: Actions,
    private db: Firebasev2Service,
    private authService: AuthService,
    private store: Store<{projects: AppState}>
  ) {}
}
