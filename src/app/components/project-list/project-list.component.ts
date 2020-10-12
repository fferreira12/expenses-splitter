import { Component, OnInit } from '@angular/core';
import { SplitterService } from 'src/app/services/splitter.service';
import { Project } from 'src/app/models/project.model';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/state/app.state';
import { createProject, setCurrentProject } from 'src/app/state/app.actions';
import { map } from 'rxjs/operators';
import { selectCurrentProject, selectOrderedProjects } from 'src/app/state/app.selectors';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {

  allProjects: Project[] = [];
  allProjects$: Observable<Project[]>;
  currentProject: Project;
  currentProject$: Observable<Project>;
  name = new FormControl('');

  get unarchivedProjects(): Project[] {
    return this.allProjects?.filter(p => {
      return this.currentProject.projectId == p.projectId || !p.archived;
    });
  }

  constructor(
    private splitterService: SplitterService,
    private store: Store<{projects: AppState}>
  ) { }

  ngOnInit() {
    // this.allProjects$ = this.splitterService.getAllProjects$();
    // this.allProjects$.subscribe(allProjects => {
    //   this.allProjects = allProjects;
    // });
    // this.currentProject$ = this.splitterService.getCurrentProject$();
    // this.currentProject$.subscribe(currentproject => {
    //   this.currentProject = currentproject;
    // });
    this.allProjects$ = this.store.select(selectOrderedProjects);
    this.allProjects$.subscribe(projects => this.allProjects = projects);

    this.currentProject$ = this.store.select(selectCurrentProject);
    this.currentProject$.subscribe(project => {
      //console.log('got current project', project)
      this.currentProject = project
    });


  }

  onAddNewProject() {
    //this.splitterService.createNewProject(this.name.value);

    this.store.dispatch(createProject({projectName: this.name.value}));
  }

  onChangeProject(project: Project) {
    //this.splitterService.setCurrentProject(project);
    this.store.dispatch(setCurrentProject(project));
  }

}
