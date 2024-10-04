import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { CubeComponent } from '../cube/cube.component';
import { AgentService } from '../../services/agent.service';
import { Agent } from 'src/app/model/agent';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit {
  newAgentName: string = '';
  agentCards: Agent[] = [];

  @ViewChild(CubeComponent) cubeComponent!: CubeComponent;

  constructor(private agentService: AgentService) {}

  ngAfterViewInit() {
    this.loadAgents();
  }

  loadAgents() {
    this.cubeComponent.startAnimation();
    this.agentService.getAgents().subscribe(
      (agents) => {
        this.agentCards = agents;
        this.cubeComponent.stopAnimation();
      },
      (error) => {
        console.error('Error loading agents:', error);
        this.cubeComponent.stopAnimation();
      }
    );
  }

  createAgent() {
    if (this.newAgentName.trim()) {
      const newAgent: Agent = {
        id: Date.now().toString(),
        name: this.newAgentName.trim(),
      };
      // Trigger cube animation for 1 second
      this.cubeComponent.startAnimation();
      this.agentService.addAgent(newAgent).subscribe(
        (agent) => {
          this.agentCards.push(agent);
          this.newAgentName = '';
          this.cubeComponent.stopAnimation();
        },
        (error) => {
          console.error('Error creating agent:', error);
          this.cubeComponent.stopAnimation();
        }
      );
    }
  }
}
