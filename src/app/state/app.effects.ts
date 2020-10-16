import { Injectable } from "@angular/core";
import { AngularFireUploadTask } from "@angular/fire/storage";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import copy from "fast-copy";
import { from, merge, of } from "rxjs";
import { map, mergeMap, tap, withLatestFrom } from "rxjs/operators";
import { Expense } from '../models/expense.model';
import { Project } from "../models/project.model";
import { AuthService } from "../services/auth.service";

import { Firebasev2Service } from "../services/firebasev2.service";
import {
  addEditor,
  addExpense,
  addUser,
  apiCalled,
  appStartup,
  archiveProject,
  createProject,
  deleteProject,
  editExpense,
  fileUploadProgressToExpense,
  fileUploadToExpenseSuccess,
  loadProjects,
  noOp,
  orderProjects,
  orderUsers,
  removeEditor,
  removeExpense,
  startRemoveFileFromExpense,
  removeUser,
  renameProject,
  renameUser,
  setCurrentProject,
  setUser,
  setWeight,
  startFileUploadToExpense,
  unarchiveProject,
  unsetWeights,
  removeFileFromExpenseSuccess,
  orderExpenses,
  addPayment,
  editPayment,
  removePayment,
  orderPayments,
  startFileUploadToPayment,
  fileUploadProgressToPayment,
  fileUploadToPaymentSuccess,
  startRemoveFileFromPayment,
  removeFileFromPaymentSuccess,
} from "./app.actions";
import { selectCurrentProject } from "./app.selectors";
import { AppState } from "./app.state";

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

  loadAllProjects$ = createEffect(() =>
  this.actions$.pipe(
    ofType(setUser),
    mergeMap((action) => {
      return this.db.getProjectsOfUser(true, action.userId).pipe(
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
              return setCurrentProject({
                projectId: lastProjectSnap.data().projectId,
              });
            } else {
              return noOp();
            }
          })
        );
      })
    );
  });

  // @Effect({ dispatch: false })
  saveLastProject$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setCurrentProject),
      map((action) => {
        this.db.saveLastProject(action.projectId);

        return apiCalled();
      })
    );
  });

  // @Effect({ dispatch: false })
  saveProject$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        renameProject,
        archiveProject,
        unarchiveProject,
        addEditor,
        removeEditor
      ),
      withLatestFrom(this.store),
      map(([action, appState]) => {
        let st: AppState = copy(appState).projects;
        let p = [...st.selfProjects, ...st.otherProjects].find(
          (p) => p.projectId == action.projectId
        );
        this.db.saveProject(p.ownerId, Project.fromState(p), false);
        return apiCalled();
      })
    );
  });

  saveProjectAfterCreation$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(createProject),
      withLatestFrom(this.store),
      map(([, appState]) => {
        let st: AppState = copy(appState).projects;
        let p = [...st.selfProjects, ...st.otherProjects].find(
          (p) => p.projectId == appState.projects.currentProject
        );
        this.db.saveProject(p.ownerId, Project.fromState(p), true);
        return apiCalled();
      })
    );
  });

  deleteProject$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(deleteProject),
      tap((action) => {
        this.db.deleteProject(action.projectId);
      })
    );
  });

  saveAllProjects$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(orderProjects),
      withLatestFrom(this.store),
      map(([, appState]) => {
        [
          ...appState.projects.selfProjects,
          ...appState.projects.otherProjects,
        ].forEach((p) => {
          this.db.saveProject(p.ownerId, Project.fromState(p), false);
        });
        return apiCalled();
      })
    );
  });

  saveCurrentProject$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        addUser,
        removeUser,
        renameUser,
        orderUsers,
        setWeight,
        unsetWeights,
        addExpense,
        editExpense,
        removeExpense,
        removeFileFromExpenseSuccess,
        orderExpenses,
        addPayment,
        editPayment,
        removePayment,
        orderPayments,
        removeFileFromPaymentSuccess
      ),
      withLatestFrom(this.store),
      map(([, appState]) => {
        let st: AppState = copy(appState).projects;
        if (!st) return noOp();
        let p = [...st.selfProjects, ...st.otherProjects].find(
          (p) => p.projectId == appState.projects.currentProject
        );
        this.db.saveProject(p.ownerId, Project.fromState(p));
        return apiCalled();
      })
    );
  });

  onStartFileUpload$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        startFileUploadToExpense,
        startFileUploadToPayment
      ),
      withLatestFrom(this.store),
      mergeMap(([action, appState]) => {
        console.log("starting upload");

        let collection: string;

        if (action.type == startFileUploadToExpense.type) {
          collection = "expenses";
        } else {
          collection = "payments"
        }

        let st: AppState = copy(appState).projects;
        if (!st) return of(noOp());
        let p: Project = selectCurrentProject({ projects: st });
        let uploadTask: AngularFireUploadTask = this.db.uploadFile(action.file, p, collection);

        let percentageChanges$ = uploadTask.percentageChanges().pipe(
          map((percentage) => {

            let act = action.type ==
              startFileUploadToExpense.type ?
              fileUploadProgressToExpense({ expense: action.expense, percent: percentage, }) :
              fileUploadProgressToPayment({ payment: action.payment, percent: percentage, });

            return act;
          })
        );

        let path: string;

        let completion$ = from(uploadTask).pipe(
          mergeMap((snapshot) => {
            console.log("snapshot: ", snapshot);
            path = snapshot.ref.fullPath;
            return from(snapshot.ref.getDownloadURL());
          }),
          map((downloadUrl) => {

            let act = action.type ==
              startFileUploadToExpense.type ?
              fileUploadToExpenseSuccess({ expense: action.expense, filePath: path, downloadUrl: downloadUrl, }) :
              fileUploadToPaymentSuccess({ payment: action.payment, filePath: path, downloadUrl: downloadUrl, });

            return act;
          })
        );

        return merge(percentageChanges$, completion$);
      })
    );
  });

  onFileUploadSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        fileUploadToExpenseSuccess,
        fileUploadToPaymentSuccess
      ),
      map((action) => {

        if (action.type === fileUploadToExpenseSuccess.type) {
          let newExpense = copy(action.expense);
          let oldExpense = Object.freeze(action.expense);
          newExpense.filePath = action.filePath;
          newExpense.fileUrl = action.downloadUrl;
          return editExpense({ oldExpense, newExpense });
        } else {
          let newPayment = copy(action.payment);
          let oldPayment = Object.freeze(action.payment);
          newPayment.filePath = action.filePath;
          newPayment.fileUrl = action.downloadUrl;
          return editPayment({ oldPayment, newPayment });
        }

      })
    );
  });

  onFileDeletion$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        startRemoveFileFromExpense,
        startRemoveFileFromPayment
      ),
      mergeMap((action) => {
        if (action.type === startRemoveFileFromExpense.type) {
          return this.db.deleteFile(action.expense.filePath).pipe(
            map(() => {
              return removeFileFromExpenseSuccess({ expense: action.expense });
            })
          );
        } else {
          return this.db.deleteFile(action.payment.filePath).pipe(
            map(() => {
              return removeFileFromPaymentSuccess({ payment: action.payment });
            })
          );
        }
      })
    );
  });

  constructor(
    private actions$: Actions,
    private db: Firebasev2Service,
    private authService: AuthService,
    private store: Store<{ projects: AppState }>
  ) {}
}
