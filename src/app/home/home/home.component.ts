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
import { ConnectorsViewService } from 'src/app/services/connectors-view.service';
import { switchMap } from 'rxjs';

interface Connection {
  from: Node;
  to: Node;
}

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
export class HomeComponent implements AfterViewInit {
  newAgentName: string = '';
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private isDragging = false;
  isDrawingMode = true;
  isConnectionDeleteMode = false;
  isNodeDeleteMode = false;
  private startX = 0;
  private startY = 0;
  agentViews: AgentView[] = [];
  connections: Connection[] = [];
  selectedNode: Node | null = null;

  @ViewChild(CubeComponent) cubeComponent!: CubeComponent;

  constructor(
    private agentViewService: AgentViewService,
    private connecrtorViewService: ConnectorsViewService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.canvas = document.getElementById(
      'drawingCanvasHome'
    ) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    // this.initializeCanvas();
    this.loadAgentsViews();
    this.cdr.detectChanges();
  }

  saveConnectors() {
    this.cubeComponent.startAnimation();
    // this.agentViewService.saveAgents(this.agentViews).subscribe(() => {
    //   this.cubeComponent.stopAnimation();
    // });
    this.connecrtorViewService
      .saveConnectors(this.connections)
      .subscribe(() => {
        this.cubeComponent.stopAnimation();
      });
  }

  loadAgentsViews(): void {
    let connections: any[] = [];
    this.cubeComponent.startAnimation();
    this.connecrtorViewService
      .getConnectorView()
      .pipe(
        switchMap((connectors: any[]) => {
          connections = connectors;
          console.log(connectors);
          return this.agentViewService.getAgentView();
        })
      )
      .subscribe({
        next: (agentViews) => {
          this.agentViews = agentViews;
          this.render();
          console.log(JSON.stringify(agentViews));
          console.log(JSON.stringify(connections));
          connections.forEach((connector) => {
            console.log('here');
            this.createConnection(connector.from.id, connector.to.id);
          });
        },
        error: (err) => console.error(err),
        complete: () => {
          this.cubeComponent.stopAnimation();
        },
      });
  }

  private initializeCanvas() {
    this.canvas = document.getElementById(
      'drawingCanvasHome'
    ) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('mouseout', this.onMouseOut.bind(this));
    this.canvas.addEventListener('click', this.onCanvasClick.bind(this));
  }

  private onMouseDown(event: MouseEvent): void {
    const { offsetX, offsetY } = event;
    const node = this.agentViews.find((n) =>
      this.isInsideNode(n, offsetX, offsetY)
    );
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
    if (this.isDragging && this.selectedNode) {
      const { offsetX, offsetY } = event;
      this.updateNodeLocation(this.selectedNode.id, offsetX, offsetY);
      this.isDragging = false;
      this.selectedNode = null;
    } else if (this.isDrawing) {
      const { offsetX, offsetY } = event;
      const node = this.agentViews.find((n) =>
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

  private onCanvasClick(event: MouseEvent): void {
    const { offsetX, offsetY } = event;
    const clickedConnection = this.connections.find((connection) =>
      this.isClickOnLine(
        connection.from.x,
        connection.from.y,
        connection.to.x,
        connection.to.y,
        offsetX,
        offsetY
      )
    );
    console.log('clickedConnection', clickedConnection);
    const clickedNode = this.agentViews.find((node) =>
      this.isInsideNode(node, offsetX, offsetY)
    );

    // if (clickedNode && this.isNodeDeleteMode) {
    //   this.deleteNode(clickedNode.id);
    //   this.isNodeDeleteMode = false;
    // }

    // if (clickedConnection && this.isConnectionDeleteMode) {
    //   this.deleteConnection(clickedConnection.from.id, clickedConnection.to.id);
    //   this.isConnectionDeleteMode = false;
    // }
  }

  private isClickOnLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    clickX: number,
    clickY: number
  ): boolean {
    const tolerance = 5; // Tolerance in pixels
    const distance =
      Math.abs((y2 - y1) * clickX - (x2 - x1) * clickY + x2 * y1 - y2 * x1) /
      Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
    return distance <= tolerance;
  }

  private onMouseOut(): void {
    this.isDrawing = false;
    this.isDragging = false;
    this.selectedNode = null;
  }

  private updateNodeLocation(nodeId: string, newX: number, newY: number) {
    const node = this.agentViews.find((n) => n.id === nodeId);
    if (node) {
      node.x = newX;
      node.y = newY;
      this.render();
    }
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

  private createConnection(fromId: string, toId: string) {
    const fromNode = this.agentViews.find((n) => n.id === fromId);
    const toNode = this.agentViews.find((n) => n.id === toId);
    console.log(fromNode, toNode);
    if (fromNode && toNode) {
      this.connections.push({ from: fromNode, to: toNode });
      console.log(JSON.stringify(this.connections));
      this.render();
    } else {
      console.error('One or both nodes not found');
    }
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
}
