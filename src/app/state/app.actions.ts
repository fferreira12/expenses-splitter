import { createAction, props } from '@ngrx/store';
import { Expense } from '../models/expense.model';
import { Payment } from '../models/payment.model';
import { User } from '../models/user.model';
import { ProjectState } from './project.state';

export const noOp = createAction('[App] No Operation');
export const apiCalled = createAction('[App] Api was called');
export const dataReceived = createAction('[App] Api returned data');

export const appStartup = createAction('[App] Startup');
export const setUser = createAction('[App] Set User', props<{userId: string, userEmail: string}>());

export const createProject = createAction('[Project] Create', props<{projectName: string}>());
export const loadProjects = createAction('[Project] Load projects', props<{projects: ProjectState[]}>());
export const startLoadArchivedProjects = createAction('[Project] Load archived projects');

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
export const loadProjectOrder = createAction('[Project] Set Order', props<{ order: { [key: string]: number } }>());
export const makeProjectPublic = createAction('[Project] Make Public', props<{ projectId: string }>());
export const makeProjectPrivate = createAction('[Project] Make Private', props<{ projectId: string }>());

export const addUser = createAction('[User] Add', props<{ userName: string }>());
export const removeUser = createAction('[User] Remove', props<{ userId: string }>());
export const renameUser = createAction('[User] Rename', props<{ userId: string, newName: string }>());
export const orderUsers = createAction('[User] Order', props<{ users: User[] }>());
export const setWeight = createAction('[User] Set Weight', props<{user: User, weight: number}>());
export const unsetWeights = createAction('[User] Unset Weights');

export const addExpense = createAction('[Expense] Add', props<{expense: Expense}>());
export const startFileUploadToExpense = createAction('[Expense] Start File Upload', props<{expense: Expense, file: File}>());
export const fileUploadProgressToExpense = createAction('[Expense] File Upload Progress', props<{expense: Expense, percent: number}>());
export const fileUploadToExpenseSuccess = createAction('[Expense] File Upload Success', props<{expense: Expense, downloadUrl: string, filePath: string}>());
export const editExpense = createAction('[Expense] Edit', props<{oldExpense: Expense, newExpense: Expense}>());
export const removeExpense = createAction('[Expense] Remove', props<{expense: Expense}>());
export const startRemoveFileFromExpense = createAction('[Expense] Remove File Start', props<{expense: Expense}>());
export const removeFileFromExpenseSuccess = createAction('[Expense] Remove File Success', props<{expense: Expense}>());
export const orderExpenses = createAction('[Expense] Order', props<{expenses: Expense[]}>());

export const addPayment = createAction('[Payment] Add', props<{payment: Payment}>());
export const removePayment = createAction('[Payment] Remove', props<{payment: Payment}>());
export const orderPayments = createAction('[Payments] Order', props<{payments: Payment[]}>());

export const editPayment = createAction('[Payment] Edit', props<{oldPayment: Payment, newPayment: Payment}>());
export const startFileUploadToPayment = createAction('[Payment] Start File Upload', props<{payment: Payment, file: File}>());
export const fileUploadProgressToPayment = createAction('[Payment] File Upload Progress', props<{payment: Payment, percent: number}>());
export const fileUploadToPaymentSuccess = createAction('[Payment] File Upload Success', props<{payment: Payment, downloadUrl: string, filePath: string}>());
export const startRemoveFileFromPayment = createAction('[Payment] Remove File Start', props<{payment: Payment}>());
export const removeFileFromPaymentSuccess = createAction('[Payment] Remove File Success', props<{payment: Payment}>());
