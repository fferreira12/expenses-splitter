import { ProjectState } from './project.state';

export type AppState = {
  isLoading: boolean;

  userId: string;
  userEmail: string;

  selfProjects: ProjectState[];
  otherProjects: ProjectState[];
  currentProject: ProjectState;
}
