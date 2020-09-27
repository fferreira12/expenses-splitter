import { createAction } from '@ngrx/store';

export const getAllProjects = createAction('[Project] Get All');
export const getCurrentProject = createAction('[Project] Get Current');
export const setCurrentProject = createAction('[Project] Set Current');
export const createProject = createAction('[Project] Create');
export const renameProject = createAction('[Project] Rename');
export const archiveProject = createAction('[Project] Archive');
export const unarchiveProject = createAction('[Project] Unarchive');
export const deleteProject = createAction('[Project] Delete');
