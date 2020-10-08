import { createSelector } from '@ngrx/store';
import { Project } from '../models/project.model';
import { AppState } from './app.state';
import { ProjectState } from './project.state';

export const orderProjects = (projects: ProjectState[]) => projects.sort((a, b) => a.order - b.order);
export const projectStatesToProjects = (projects: ProjectState[]) => projects.map(p => Project.fromState(p));

export const selectOrderedProjects = createSelector(
  (state: { projects: AppState }) => {
    if (!state || !state.projects) return;
    return [...state.projects?.selfProjects, ...state.projects?.otherProjects]
  },
  (projectStates: ProjectState[]) => {
    if (!projectStates) return;
    return projectStatesToProjects(orderProjects(projectStates));
  }
);

export const selectCurrentProject = createSelector(
  (state: {projects: AppState}) => {
    return state.projects
  },
  (state: AppState) => {
    let p = [...state.selfProjects, ...state.otherProjects].find(p => p.projectId == state.currentProject);
    return p;
  }
);