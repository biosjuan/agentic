import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { CubeComponent } from '../../components/cube/cube.component';
import {
  AgentView,
  AgentViewService,
} from 'src/app/services/agent-view.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit {
  agentViews: AgentView[] = [];

  @ViewChild(CubeComponent) cubeComponent!: CubeComponent;

  constructor(private agentViewService: AgentViewService) {}

  ngAfterViewInit(): void {
    if (this.cubeComponent) {
      this.cubeComponent.startAnimation();
    }
    this.agentViewService.getAgentView().subscribe({
      next: (agentViews) => {
        this.agentViews = agentViews;
      },
      error: (err) => console.error(err),
      complete: () => {
        if (this.cubeComponent) {
          this.cubeComponent.stopAnimation();
        }
      },
    });
  }
}
