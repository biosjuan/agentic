import { Component, ViewChild } from '@angular/core';
import { CubeComponent } from '../cube/cube.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  newAgentName: string = '';
  agentCards: string[] = [];

  @ViewChild(CubeComponent) cubeComponent!: CubeComponent;

  createAgent() {
    if (this.newAgentName.trim()) {
      // Trigger cube animation for 1 second
      this.cubeComponent.startAnimation();
      setTimeout(() => {
        this.cubeComponent.stopAnimation();
        this.agentCards.push(this.newAgentName.trim());
        this.newAgentName = '';
      }, 1000);
    }
  }
}
