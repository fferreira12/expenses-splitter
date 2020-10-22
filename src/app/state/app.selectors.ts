import { createSelector } from '@ngrx/store';
import copy from 'fast-copy';
import { Project } from '../models/project.model';
import { User } from '../models/user.model';
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
    let archived = projectStates.filter(p => p.archived);
    let notArchived = projectStates.filter(p => !p.archived);
    return projectStatesToProjects([...putInOrder(notArchived), ...archived]);
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
    let project = selectCurrentProject({projects: state});
    return project.weights;
  }
);

export const selectIsEvenSplit = createSelector(
  (state: {projects: AppState}) => {
    return state.projects
  },
  (state: AppState) => {
    let project = selectCurrentProject({projects: state});
    return project.isEvenSplit();
  }
);

export const selectIsSelfProject = createSelector(
  (state: {projects: AppState}) => {
    return state.projects
  },
  (state: AppState, project: Project) => {
    return project.ownerEmail === state.userEmail;
  }
);

export const selectExpenses = createSelector(
  (state: {projects: AppState}) => {
    return state.projects
  },
  (state: AppState) => {
    let project = selectCurrentProject({projects: state});
    return putInOrder(copy(project.expenses));
  }
);

export const selectPayments = createSelector(
  (state: {projects: AppState}) => {
    return state.projects
  },
  (state: AppState) => {
    let project = selectCurrentProject({projects: state});
    return putInOrder(copy(project.payments));
  }
);

export const selectUnarchivedProjects = createSelector(
  (state: {projects: AppState}) => {
    return state.projects
  },
  (state: AppState) => {
    let projects = [...state.selfProjects, ...state.otherProjects].filter(p => !p.archived);
    return putInOrder(copy(projects));
  }
);

export const selectFairShares = createSelector(
  (state: {projects: AppState}) => {
    return state.projects
  },
  (state: AppState) => {
    let project = selectCurrentProject({projects: state});
    return copy(project.getFairShares());
  }
);

export const selectWeights = createSelector(
  (state: {projects: AppState}) => {
    return state.projects
  },
  (state: AppState) => {
    let project = selectCurrentProject({projects: state});
    return copy(project.weights);
  }
);

export const selectWeightsForUser = createSelector(
  (state: {projects: AppState}) => {
    return state.projects
  },
  (state: AppState, user: User) => {
    let project = selectCurrentProject({projects: state});
    return copy(project.getWeightForUser(user));
  }
);

export const selectUsers = createSelector(
  (state: {projects: AppState}) => {
    return state.projects
  },
  (state: AppState) => {
    let project = selectCurrentProject({projects: state});
    return copy(project.users);
  }
);

export const selectUser = createSelector(
  (state: {projects: AppState}) => {
    return state.projects
  },
  (state: AppState, userId: string) => {
    let project = selectCurrentProject({projects: state});
    return copy(project.getUser(userId));
  }
);

export const selectPaymentsMade = createSelector(
  (state: {projects: AppState}) => {
    return state.projects
  },
  (state: AppState, user: User) => {
    let project = selectCurrentProject({projects: state});
    return copy(project.getPaymentsMade(user));
  }
);

export const selectPaymentsReceived = createSelector(
  (state: {projects: AppState}) => {
    return state.projects
  },
  (state: AppState, user: User) => {
    let project = selectCurrentProject({projects: state});
    return copy(project.getPaymentsReceived(user));
  }
);
