import { state } from '@angular/animations';
import { createReducer, on, props } from "@ngrx/store";
import copy from "fast-copy";
import { Expense } from '../models/expense.model';
import { Project } from '../models/project.model';
import { User } from '../models/user.model';
import {
  createProject,
  getAllProjects,
  getCurrentProject,
  renameProject,
  deleteProject,
  archiveProject,
  setCurrentProject,
  unarchiveProject,
  loadProjects, setUser, addEditor, removeEditor, orderProjects, addUser, removeUser, renameUser, orderUsers, setWeight, unsetWeights, addExpense, editExpense, removeExpense, startRemoveFileFromExpense, removeFileFromExpenseSuccess, fileUploadToExpenseSuccess, orderExpenses
} from "./app.actions";
import { AppState } from './app.state';
import { initialState } from './initial.state';
import { ProjectState } from './project.state';

const _projectReducer = createReducer<AppState>(
  initialState,

  on(createProject, (state, props) => {
    let p = new Project();
    p.ownerId = state.userId;
    p.ownerEmail = state.userEmail;
    p.projectName = props.projectName;
    p.order = 0;
    p.archived = false;
    return {
      ...copy(state),
      selfProjects: [...state.selfProjects, p.getState()],
      currentProject: p.projectId,
    };
  }),

  on(getAllProjects, (state) => {
    return state;
  }),

  on(loadProjects, (state, props) => {
    return {
      ...copy(state),
      selfProjects: props.projects
    }
  }),

  on(setUser, (state, props) => {
    return {
      ...copy(state),
      userId: props.userId,
      userEmail: props.userEmail
    }
  }),

  on(setCurrentProject, (state, props) => {
    let st: AppState = copy(state);
    return {
      ...st,
      currentProject: props.projectId
    }
  }),

  on(renameProject, (state, props) => {
    let st: AppState = copy(state);
    let pToRename = [...st.selfProjects, ...st.otherProjects].find(p => p.projectId == props.projectId);
    pToRename.projectName = props.newName;
    return {
      ...st
    }
  }),

  on(archiveProject, (state, props) => {
    let st: AppState = copy(state);
    let p = [...st.selfProjects, ...st.otherProjects].find(p => p.projectId == props.projectId);
    p.archived = true;
    return {
      ...st
    }
  }),

  on(unarchiveProject, (state, props) => {
    let st: AppState = copy(state);
    let p = [...st.selfProjects, ...st.otherProjects].find(p => p.projectId == props.projectId);
    p.archived = false;
    return {
      ...st
    }
  }),

  on(deleteProject, (state, props) => {
    let st: AppState = copy(state);
    return {
      ...st,
      selfProjects: st.selfProjects.filter(p => p.projectId !== props.projectId)
    }
  }),

  on(addEditor, (state, props) => {
    let st: AppState = copy(state);
    let p = [...st.selfProjects, ...st.otherProjects].find(p => p.projectId == props.projectId);
    let s = new Set(p.editors);
    s.add(props.editorEmail);
    p.editors = Array.from(s);
    return {
      ...st
    }
  }),

  on(removeEditor, (state, props) => {
    let st: AppState = copy(state);
    let p = [...st.selfProjects, ...st.otherProjects].find(p => p.projectId == props.projectId);
    let s = new Set(p.editors);
    s.delete(props.editorEmail);
    p.editors = Array.from(s);
    return {
      ...st
    }
  }),

  on(orderProjects, (state, props) => {
    let st: AppState = copy(state);
    let orders: { [key: string]: number } = {};
    props.projects.forEach((project, index) => {
      orders[project.projectId] = index;
    });
    return {
      ...st,
      selfProjects: st.selfProjects.map(p => {
        return {
          ...p,
          order: orders[p.projectId]
        }
      }),
      otherProjects: st.otherProjects.map(p => {
        return {
          ...p,
          order: orders[p.projectId]
        }
      })
    }
  }),


  on(addUser, (state, props) => {
    let st = copy(state);
    let cps = getCurrentProjectFromState(st);

    cps.users = [...cps.users, new User(props.userName)];

    return st;
  }),

  on(removeUser, (state, props) => {
    let st = copy(state);
    let cps = getCurrentProjectFromState(st);

    let project = Project.fromState(cps);

    if (project.removeUserById(props.userId)) {
      project.removeExpensesAndPaymentsWithNoAssociatedUser();
    } else {
      return st;
    }

    return replaceProjectState(project, st);
  }),

  on(renameUser, (state, props) => {
    let st = copy(state);
    let cps = getCurrentProjectFromState(st);

    let project = Project.fromState(cps);

    project.renameUserById(props.userId, props.newName);

    return replaceProjectState(project, st);
  }),

  on(orderUsers, (state, props) => {
    if (!props.users || props.users.length == 0) return;

    let st = copy(state);

    let order: { [key: string]: number } = {};

    props.users.forEach((user, index) => {
      order[user.id] = index;
    });

    let cps = getCurrentProjectFromState(st);

    cps.users.forEach(user => {
      user.order = order[user.id];
    });

    return st;
  }),

  on(setWeight, (state, props) => {
    if (!props.user || !props.weight) return state;

    let st = copy(state);

    let cps = getCurrentProjectFromState(st);

    let project = Project.fromState(cps);

    project.setWeightForUser(props.user, props.weight);

    return replaceProjectState(project, st);
  }),

  on(unsetWeights, (state) => {
    let st = copy(state);

    let cps = getCurrentProjectFromState(st);

    let project = Project.fromState(cps);

    project.setEvenSplit();

    return replaceProjectState(project, st);
  }),

  on(addExpense, (state, props) => {
    let st = copy(state);

    let cps = getCurrentProjectFromState(st);

    let project = Project.fromState(cps);

    project.addExpense(props.expense);

    return replaceProjectState(project, st);
  }),

  on(editExpense, (state, props) => {
    let st = copy(state);

    let cps = getCurrentProjectFromState(st);

    let project = Project.fromState(cps);

    let oldE = Expense.createExpense(props.oldExpense);
    let newE = Expense.createExpense(props.newExpense);

    project.updateExpense(oldE, newE);

    return replaceProjectState(project, st);
  }),

  on(removeExpense, (state, props) => {
    let st = copy(state);

    let cps = getCurrentProjectFromState(st);

    let project = Project.fromState(cps);

    project.removeExpense(props.expense);

    return replaceProjectState(project, st);
  }),

  on(removeFileFromExpenseSuccess, (state, props) => {
    let st = copy(state);

    let cps = getCurrentProjectFromState(st);

    let project = Project.fromState(cps);

    let oldE = Expense.createExpense(props.expense);
    let newE = Expense.createExpense(props.expense);
    newE.filePath = "";
    newE.fileUrl = "";

    project.updateExpense(oldE, newE);

    return replaceProjectState(project, st);
  }),

  on(orderExpenses, (state, props) => {
    let st = copy(state);

    let cps = getCurrentProjectFromState(st);

    let ordered = props.expenses.map((expense, index) => {
      expense.order = index;
      return expense;
    })

    cps.expenses = ordered;

    return replaceProjectState(Project.fromState(cps), st);
  }),


);

function getCurrentProjectFromState(state: AppState) {
  return [...state.selfProjects, ...state.otherProjects].find(p => p.projectId == state.currentProject);
}

function replaceProjectState(newProject: Project, state: AppState): AppState {
  let projectState = newProject.getState();
  let st = copy(state);
  if (state.userId === projectState.ownerId) {
    let index = state.selfProjects.findIndex(p => p.projectId === projectState.projectId);
    st.selfProjects[index] = projectState;
  } else {
    let index = state.otherProjects.findIndex(p => p.projectId === projectState.projectId);
    st.otherProjects[index] = projectState;
  }
  return st;
}

export function projectReducer(state, action) {
  return _projectReducer(state, action);
}
