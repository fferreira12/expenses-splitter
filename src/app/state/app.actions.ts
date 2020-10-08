import { createAction, props } from '@ngrx/store';
import { ProjectState } from './project.state';

export const noOp = createAction('[App] No Operation');

export const appStartup = createAction('[App] Startup');
export const setUser = createAction('[App] Set User', props<{userId: string, userEmail: string}>());

export const createProject = createAction('[Project] Create', props<{projectName: string}>());
export const loadProjects = createAction('[Project] Load', props<{projects: ProjectState[]}>());

export const getAllProjects = createAction('[Project] Get All');
export const getCurrentProject = createAction('[Project] Get Current');
export const setCurrentProject = createAction('[Project] Set Current', props<{ projectId: string }>());
export const renameProject = createAction('[Project] Rename', props<{ projectId: string, newName: string }>());
export const archiveProject = createAction('[Project] Archive', props<{ projectId: string }>());
export const unarchiveProject = createAction('[Project] Unarchive', props<{ projectId: string }>());
export const deleteProject = createAction('[Project] Delete', props<{ projectId: string }>());
export const addEditor = createAction('[Project] Add Editor', props<{ projectId: string, editorEmail: string }>());
export const removeEditor = createAction('[Project] Remove Editor', props<{ projectId: string, editorEmail: string }>());
export const orderProjects = createAction('[Project] Order', props<{ projects: ProjectState[] }>());

export const addUser = createAction('[User] Add', props<{ userName: string }>());

// 🔽 TO IMPLEMENT 🔽
export const removeUser = createAction('[User] Remove', props<{ userId: string }>());

export const renameUser = createAction('[User] Rename');
export const orderUsers = createAction('[User] Order');
export const getUsers = createAction('[User] Get All');
export const setWeights = createAction('[User] Set Weights');
export const unsetWeights = createAction('[User] Unset Weights');

export const addExpense = createAction('[Expense] Add');
export const editExpense = createAction('[Expense] Edit');
export const removeExpense = createAction('[Expense] Remove');
export const getExpenses = createAction('[Expense] Get');
export const orderExpenses = createAction('[Expense] Order');
export const addFileToExpense = createAction('[Expense] Add File');
export const removeFileFromExpense = createAction('[Expense] Remove File');

export const addPayment = createAction('[Payment] Add');
export const editPayment = createAction('[Payment] Edit');
export const removePayment = createAction('[Payment] Remove');
export const orderPayments = createAction('[Payments] Order');
export const addFileToPayment = createAction('[Payment] Add File');
export const removeFileFromPayment = createAction('[Payment] Remove File');

export const updateProject = createAction('[Project] Update');
export const resetProjects = createAction('[Project] Reset All');
