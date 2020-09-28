import { state } from '@angular/animations';
import { createReducer, on, props } from "@ngrx/store";
import copy from "fast-copy";
import { Project } from '../models/project.model';
import {
  createProject,
  getAllProjects,
  getCurrentProject,
  renameProject,
  deleteProject,
  archiveProject,
  setCurrentProject,
  unarchiveProject,
  loadProjects, setUser
} from "./app.actions";
import { AppState } from './app.state';
import { ProjectState } from './project.state';

export const initialState: AppState = {
  isLoading: false,
  userId: null,
  userEmail: null,
  selfProjects: [
    new ProjectState()
  ],
  otherProjects: [],
  currentProject: null
};

const _projectReducer = createReducer<AppState>(
  initialState,
  on(createProject, (state, props) => {
    //let newState: AppState = copy(state);
    let p = new ProjectState();
    p.ownerId = state.userId;
    p.ownerEmail = state.userEmail;
    return {
      ...copy(state),
      selfProjects: [...state.selfProjects, p],
      currentProject: p
    }
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
  })
);

export function projectReducer(state, action) {
  return _projectReducer(state, action);
}
