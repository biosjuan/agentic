import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { CubeComponent } from '../cube/cube.component';
import { AgentService } from '../../services/agent.service';
import { Agent } from 'src/app/model/agent';

interface Node {
  id: string;
  x: number;
  y: number;
  text: string;
}

interface Connection {
  from: Node;
  to: Node;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit {
  newAgentName: string = '';
  agentCards: Agent[] = [];
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private isDragging = false;
  isDrawingMode = false;
  private startX = 0;
  private startY = 0;
  nodes: Node[] = [];
  connections: Connection[] = [];
  selectedNode: Node | null = null;

  @ViewChild(CubeComponent) cubeComponent!: CubeComponent;

  constructor(private agentService: AgentService) {}

  ngAfterViewInit() {
    this.canvas = document.getElementById('drawingCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('mouseout', this.onMouseOut.bind(this));
    this.loadAgents();

    // this.nodes.push({ id: '1', x: 100, y: 100, text: 'Node 1' });
    // this.nodes.push({ id: '2', x: 300, y: 300, text: 'Node 2' });
    // this.nodes.push({ id: '3', x: 400, y: 300, text: 'Node 3' });
    // this.render();
  }

  toggleDrawingMode() {
    this.isDrawingMode = !this.isDrawingMode;
  }

  private onMouseDown(event: MouseEvent): void {
    const { offsetX, offsetY } = event;
    const node = this.nodes.find((n) => this.isInsideNode(n, offsetX, offsetY));
    if (node) {
      if (this.isDrawingMode) {
        this.selectedNode = node;
        this.isDrawing = true;
        this.startX = offsetX;
        this.startY = offsetY;
      } else {
        this.selectedNode = node;
        this.isDragging = true;
      }
    }
  }

  private onMouseMove(event: MouseEvent): void {
    if (this.isDragging && this.selectedNode) {
      this.selectedNode.x = event.offsetX;
      this.selectedNode.y = event.offsetY;
      this.render();
    } else if (this.isDrawing) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.render();
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
      this.ctx.lineTo(event.offsetX, event.offsetY);
      this.ctx.stroke();
    }
  }

  private onMouseUp(event: MouseEvent): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.selectedNode = null;
    } else if (this.isDrawing) {
      const { offsetX, offsetY } = event;
      const node = this.nodes.find((n) =>
        this.isInsideNode(n, offsetX, offsetY)
      );
      if (node && this.selectedNode) {
        this.connections.push({ from: this.selectedNode, to: node });
      }
      this.isDrawing = false;
      this.selectedNode = null;
      this.render();
    }
  }

  private onMouseOut(): void {
    this.isDrawing = false;
    this.isDragging = false;
    this.selectedNode = null;
  }

  private isInsideNode(node: Node, x: number, y: number): boolean {
    const width = 60;
    const height = 40;
    return (
      x >= node.x - width / 2 &&
      x <= node.x + width / 2 &&
      y >= node.y - height / 2 &&
      y <= node.y + height / 2
    );
  }

  private render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.connections.forEach((connection) => {
      this.drawLine(connection.from, connection.to);
    });
    this.nodes.forEach((node) => {
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

  private drawLine(from: Node, to: Node) {
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(to.x, to.y);
    this.ctx.stroke();
    this.drawArrowhead(from.x, from.y, to.x, to.y);
  }

  private drawArrowhead(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ) {
    const headLength = 10; // Length of the arrowhead
    const angle = Math.atan2(toY - fromY, toX - fromX);

    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;

    this.ctx.beginPath();
    this.ctx.moveTo(midX, midY);
    this.ctx.lineTo(
      midX - headLength * Math.cos(angle - Math.PI / 6),
      midY - headLength * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.moveTo(midX, midY);
    this.ctx.lineTo(
      midX - headLength * Math.cos(angle + Math.PI / 6),
      midY - headLength * Math.sin(angle + Math.PI / 6)
    );
    this.ctx.stroke();
  }

  loadAgents() {
    this.cubeComponent.startAnimation();
    this.agentService.getAgents().subscribe(
      (agents) => {
        this.agentCards = agents;
        this.addNode();
        this.cubeComponent.stopAnimation();
      },
      (error) => {
        console.error('Error loading agents:', error);
        this.cubeComponent.stopAnimation();
      }
    );
  }

  addNode() {
    let xValue = 100;
    this.agentCards.forEach((agent) => {
      this.nodes.push({
        id: agent.id,
        x: xValue,
        y: 100,
        text: agent.name,
      });
      xValue += 100;
    });
    this.render();
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
          this.nodes.push({
            id: agent.id,
            x: 100 * this.agentCards.length,
            y: 100,
            text: agent.name,
          });
          this.render();
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
