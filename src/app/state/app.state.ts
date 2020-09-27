import { Project } from '../models/project.model';

export type AppState = {
  selfProjects: Project[];
  otherProjects: Project[];
  currentProject: Project;
}
