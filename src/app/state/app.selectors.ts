import { createSelector } from '@ngrx/store';
import { Project } from '../models/project.model';
import { AppState } from './app.state';
import { ProjectState } from './project.state';

export const orderProjects = (projects: ProjectState[]) => projects.sort((a, b) => a.order - b.order);
export const projectStatesToProjects = (projects: ProjectState[]) => projects.map(p => Project.fromState(p));

export const selectOrderedProjects = createSelector(
  (state: {app: AppState}) => {
    return [...state.app.selfProjects, ...state.app.otherProjects]
  },
  (projectStates: ProjectState[]) => {
    return projectStatesToProjects(orderProjects(projectStates));
  }
);

export const selectCurrentProject = createSelector(
  (state: {app: AppState}) => {
    return state.app.currentProject
  },
  (projectState: ProjectState) => {
    return Project.fromState(projectState);
  }
);
