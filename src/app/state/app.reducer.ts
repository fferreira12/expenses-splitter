import { createReducer, on } from "@ngrx/store";
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
} from "./app.actions";
import { AppState } from './app.state';

export const initialState: AppState = {
  selfProjects: [],
  otherProjects: [],
  currentProject: new Project()
};

// const _counterReducer = createReducer(
//   initialState,
//   on(increment, (state) => state + 1),
//   on(decrement, (state) => state - 1),
//   on(reset, (state) => 0)
// );

export function counterReducer(state, action) {
  return _counterReducer(state, action);
}
