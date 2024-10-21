import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CubeComponent } from '../../components/cube/cube.component';
import {
  AgentView,
  AgentViewService,
} from 'src/app/services/agent-view.service';

export interface Node {
  id: string;
  x: number;
  y: number;
  text: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  newAgentName: string = '';
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  agentViews: AgentView[] = [];

  @ViewChild(CubeComponent) cubeComponent!: CubeComponent;

  constructor(
    private agentViewService: AgentViewService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.canvas = document.getElementById(
      'drawingCanvasHome'
    ) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.loadAgentsViews();
    this.cdr.detectChanges();
  }

  loadAgentsViews(): void {
    this.cubeComponent.startAnimation();
    this.agentViewService.getAgentView().subscribe({
      next: (agentViews) => {
        this.agentViews = agentViews;
        this.render();
      },
      error: (err) => console.error(err),
      complete: () => {
        this.cubeComponent.stopAnimation();
      },
    });
  }

  private render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.agentViews.forEach((node) => {
      this.drawNode(node);
    });
  }

  private drawNode(node: Node) {
    const padding = 20;
    const textWidth = this.ctx.measureText(node.text).width;
    const width = textWidth + padding;
    const height = 40;
    const radius = 10;

    this.ctx.beginPath();
    this.ctx.moveTo(node.x - width / 2 + radius, node.y - height / 2);
    this.ctx.lineTo(node.x + width / 2 - radius, node.y - height / 2);
    this.ctx.quadraticCurveTo(
      node.x + width / 2,
      node.y - height / 2,
      node.x + width / 2,
      node.y - height / 2 + radius
    );
    this.ctx.lineTo(node.x + width / 2, node.y + height / 2 - radius);
    this.ctx.quadraticCurveTo(
      node.x + width / 2,
      node.y + height / 2,
      node.x + width / 2 - radius,
      node.y + height / 2
    );
    this.ctx.lineTo(node.x - width / 2 + radius, node.y + height / 2);
    this.ctx.quadraticCurveTo(
      node.x - width / 2,
      node.y + height / 2,
      node.x - width / 2,
      node.y + height / 2 - radius
    );
    this.ctx.lineTo(node.x - width / 2, node.y - height / 2 + radius);
    this.ctx.quadraticCurveTo(
      node.x - width / 2,
      node.y - height / 2,
      node.x - width / 2 + radius,
      node.y - height / 2
    );
    this.ctx.closePath();
    this.ctx.fillStyle = 'white';
    this.ctx.fill();
    this.ctx.stroke();

    // Center the text
    this.ctx.fillStyle = 'black';
    this.ctx.fillText(node.text, node.x - textWidth / 2, node.y + 5);
  }
}
