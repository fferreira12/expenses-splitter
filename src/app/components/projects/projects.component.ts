import { Component, OnInit } from "@angular/core";
import { SplitterService } from "src/app/services/splitter.service";
import { Project } from "src/app/models/project.model";
import { FormControl } from "@angular/forms";

@Component({
  selector: "app-projects",
  templateUrl: "./projects.component.html",
  styleUrls: ["./projects.component.css"]
})
export class ProjectsComponent implements OnInit {
  projectName = new FormControl("");
  projectNewName = new FormControl("");
  addingUser: boolean = false;

  allProjects: Project[];
  currentProject: Project;

  showArchivedProjects: boolean = false;

  constructor(private splitterService: SplitterService) {}

  ngOnInit() {
    this.allProjects = this.splitterService.getAllProjects(true);
    this.currentProject = this.splitterService.getCurrentProject();

    this.splitterService.subscribeToAllProjects(allProjects => {
      this.allProjects = allProjects;
    });
    this.splitterService.subscribeToCurrentProject(currProject => {
      this.currentProject = currProject;
    });
  }

  onActivateProject(project: Project) {
    //console.log('project to activate: ' + project.projectName);
    this.splitterService.setCurrentProject(project);
  }

  onDeleteProject(project: Project) {
    //console.log('project to delete: ' + project.projectName);
    this.splitterService.deleteProject(project);
  }

  onAddProject() {
    this.splitterService.createNewProject(this.projectName.value);
  }

  onRenameProject(project: Project) {
    //console.log('project to rename: ' + project.projectName);
    this.splitterService.renameProject(project, this.projectNewName.value);
  }

  onToggleInviteUser() {
    this.addingUser = !this.addingUser;
  }

  onInviteUser(project: Project, email: string) {
    console.log("invited " + email + " to edit project " + project.projectName);
    this.splitterService.addEditor(project, email);

    this.addingUser = false;
  }

  onRemoveEditor(project: Project, email: string) {
    this.splitterService.removeEditor(project, email);
  }

  selfProject(project: Project) {
    return this.splitterService.isSelfProject(project);
  }

  isCurrentProject(project: Project) {
    if(!project) {
      return false;
    }
    let current = this.splitterService.getCurrentProject();
    return project.projectName == current.projectName;
  }

  onArchiveProject(project: Project) {
    //console.log('archiving project', project);
    this.splitterService.archiveProject(project);
  }

  onUnarchiveProject(project: Project) {
    this.splitterService.unArchiveProject(project);
  }
}
