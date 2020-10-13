import { createSelector } from '@ngrx/store';
import copy from 'fast-copy';
import { Project } from '../models/project.model';
import { AppState } from './app.state';
import { ProjectState } from './project.state';

export const putInOrder = <T extends {order: number}>(orderables: T[]) => orderables.sort((a, b) => a.order - b.order);
export const projectStatesToProjects = (projects: ProjectState[]) => projects.map(p => Project.fromState(p));

export const selectOrderedProjects = createSelector(
  (state: { projects: AppState }) => {
    if (!state || !state.projects) return;
    return [...state.projects?.selfProjects, ...state.projects?.otherProjects]
  },
  (projectStates: ProjectState[]) => {
    if (!projectStates) return;
    return projectStatesToProjects(putInOrder(projectStates));
  }
);

export const selectCurrentProject = createSelector(
  (state: {projects: AppState}) => {
    return state.projects
  },
  (state: AppState) => {
    let p = [...state.selfProjects, ...state.otherProjects].find(p => p.projectId == state.currentProject);
    return Project.fromState(p);
  }
);

export const selectWeightsForCurrentProject = createSelector(
  (state: {projects: AppState}) => {
    return state.projects
  },
  (state: AppState) => {
    let p = [...state.selfProjects, ...state.otherProjects].find(p => p.projectId == state.currentProject);
    if (!p) return;
    return p.weights;
  }
);

export const selectIsEvenSplit = createSelector(
  (state: {projects: AppState}) => {
    return state.projects
  },
  (state: AppState) => {
    let p = [...state.selfProjects, ...state.otherProjects].find(p => p.projectId == state.currentProject);
    let project = Project.fromState(p);
    return project.isEvenSplit();
  }
);

export const selectExpenses = createSelector(
  (state: {projects: AppState}) => {
    return state.projects
  },
  (state: AppState) => {
    let p = [...state.selfProjects, ...state.otherProjects].find(p => p.projectId == state.currentProject);
    let project = Project.fromState(p);
    return putInOrder(copy(project.expenses));
  }
);
