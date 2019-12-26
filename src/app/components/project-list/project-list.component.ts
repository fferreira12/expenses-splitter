import { Component, OnInit } from '@angular/core';
import { SplitterService } from 'src/app/services/splitter.service';
import { Project } from 'src/app/models/project.model';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {

  allProjects: Project[] = []
  currentProject: Project;
  name = new FormControl('');

  get unarchivedProjects(): Project[] {
    return this.allProjects.filter(p => {
      return this.currentProject.projectId == p.projectId || !p.archived;
    });
  }

  constructor(private splitterService: SplitterService) { }

  ngOnInit() {
    this.allProjects = this.splitterService.getAllProjects();
    this.currentProject = this.splitterService.getCurrentProject();
    this.splitterService.subscribeToCurrentProject(currentproject => {
      this.currentProject = currentproject;
    });
    this.splitterService.subscribeToAllProjects(allProjects => {
      this.allProjects = allProjects;
    });
  }

  onAddNewProject() {
    this.splitterService.createNewProject(this.name.value);
  }

  onChangeProject(project: Project) {
    this.splitterService.setCurrentProject(project);
  }

}
