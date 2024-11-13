import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';

import { AgentService } from '../../services/agent.service';
import { ConnectorsService } from '../../services/connectors.service';
import { switchMap } from 'rxjs';
import { CubeComponent } from '../../components/cube/cube.component';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { FileUploadService } from 'src/app/services/file-upload.service';

export interface Node {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  prompt: string;
  file?: string;
}

interface Connection {
  from: Node;
  to: Node;
}

@Component({
  selector: 'app-agents',
  templateUrl: './agents.component.html',
  styleUrls: ['./agents.component.scss'],
})
export class AgentsComponent implements AfterViewInit, OnInit {
  newAgentName: string = '';
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private isDragging = false;
  isDrawingMode = false;
  isConnectionDeleteMode = false;
  isNodeDeleteMode = false;
  private startX = 0;
  private startY = 0;
  agents: Node[] = [];
  connections: Connection[] = [];
  selectedNode: Node | null = null;
  lastClickedNode: Node | null = null;
  form: FormGroup;
  lastClickedNodeID: string = '';
  showAnswers = false;
  displayedText = '';
  fullText =
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";
  selectedFile: File | null = null;

  @ViewChild(CubeComponent) cubeComponent!: CubeComponent;

  constructor(
    private agentService: AgentService,
    private connectorService: ConnectorsService,
    private fileUploadService: FileUploadService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      chat: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.form.get('chat')?.valueChanges.subscribe((value) => {
      // Add the value to
      const agent = this.agents.find((a) => a.id === this.lastClickedNodeID);
      if (agent) {
        agent.prompt = value;
        this.newAgentName = agent.text;
      }
    });
  }

  ngAfterViewInit() {
    this.canvas = document.getElementById('drawingCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    this.initializeCanvas();
    this.loadAgents();
    this.cdr.detectChanges();
  }

  updateName() {
    if (this.newAgentName.trim()) {
      const agent = this.agents.find((a) => a.id === this.lastClickedNodeID);
      if (agent) {
        agent.text = this.newAgentName.trim();
        this.render();
      } else {
        console.error('Agent not found');
      }
    }
  }

  deleteAgent() {
    const agent = this.agents.find((a) => a.id === this.lastClickedNodeID);
    if (agent) {
      this.deleteNode(agent.id);
    } else {
      console.error('Agent not found');
    }
  }

  runPrompt() {
    this.showAnswers = !this.showAnswers;
    if (this.showAnswers) {
      this.revealText();
    } else {
      this.displayedText = '';
    }
  }

  revealText() {
    let index = 0;
    const interval = setInterval(() => {
      if (index < this.fullText.length) {
        this.displayedText += this.fullText[index];
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50); // Adjust the speed as needed
  }

  toggleDrawingMode() {
    this.isDrawingMode = !this.isDrawingMode;
  }

  toggleDeleteConnection() {
    this.isConnectionDeleteMode = !this.isConnectionDeleteMode;
  }

  toggleDeleteNode() {
    this.isNodeDeleteMode = !this.isNodeDeleteMode;
  }

  deleteConnection(fromId: string, toId: string) {
    const connectionIndex = this.connections.findIndex(
      (connection) => connection.from.id === fromId && connection.to.id === toId
    );

    if (connectionIndex !== -1) {
      this.connections.splice(connectionIndex, 1);
      this.render();
    } else {
      console.error('Connection not found');
    }
  }

  saveConnectors() {
    this.cubeComponent.startAnimation();
    this.agentService.saveAgents(this.agents).subscribe(() => {
      this.cubeComponent.stopAnimation();
    });
    this.connectorService.saveConnectors(this.connections).subscribe(() => {
      this.cubeComponent.stopAnimation();
    });
  }

  deleteNode(nodeId: string): void {
    // Remove the node from the agents array
    this.agents = this.agents.filter((agent) => agent.id !== nodeId);

    // Remove any connections associated with the node
    this.connections = this.connections.filter(
      (connection) =>
        connection.from.id !== nodeId && connection.to.id !== nodeId
    );

    // Re-render the canvas
    this.render();
  }

  createAgent() {
    if (this.newAgentName.trim()) {
      const randomX = Math.random() * this.canvas.width;
      const randomY = Math.random() * this.canvas.height;
      const newAgent: Node = {
        id: Date.now().toString(),
        x: randomX,
        y: randomY,
        text: this.newAgentName.trim(),
        color: 'white', // Default color
        prompt: '',
      };
      // Trigger cube animation for 1 second
      this.cubeComponent.startAnimation();
      this.agentService.addAgent(newAgent).subscribe(
        (agent) => {
          this.agents.push(agent);
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

  private render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.connections.forEach((connection) => {
      this.drawLine(connection.from, connection.to);
    });
    this.agents.forEach((node) => {
      this.drawNode(node);
    });
  }

  private loadAgents() {
    let connections: any[] = [];
    this.cubeComponent.startAnimation();
    this.connectorService
      .getConnectors()
      .pipe(
        switchMap((connectors: any[]) => {
          connections = connectors;
          return this.agentService.getAgents();
        })
      )
      .subscribe({
        next: (agents) => {
          this.agents = agents;
          const lastClickedNode = this.agents.find(
            (a) => a.color === 'lightblue'
          );
          this.lastClickedNodeID = lastClickedNode ? lastClickedNode.id : '';
          this.form.get('chat')?.setValue(lastClickedNode?.prompt);
          this.cubeComponent.stopAnimation();
          this.render();
          connections.forEach((connection) => {
            this.createConnection(connection.from.id, connection.to.id);
          });
        },
        error: (error) => {
          console.error('Error loading data:', error);
          this.cubeComponent.stopAnimation();
        },
      });
  }

  private createConnection(fromId: string, toId: string) {
    const fromNode = this.agents.find((n) => n.id === fromId);
    const toNode = this.agents.find((n) => n.id === toId);

    if (fromNode && toNode) {
      this.connections.push({ from: fromNode, to: toNode });
      this.render();
    } else {
      console.error('One or both nodes not found');
    }
  }

  private initializeCanvas() {
    this.canvas = document.getElementById('drawingCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('mouseout', this.onMouseOut.bind(this));
    this.canvas.addEventListener('click', this.onCanvasClick.bind(this));
  }

  private onMouseDown(event: MouseEvent): void {
    const { offsetX, offsetY } = event;
    const node = this.agents.find((n) =>
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
      const node = this.agents.find((n) =>
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

  private updateNodeLocation(nodeId: string, newX: number, newY: number) {
    const node = this.agents.find((n) => n.id === nodeId);
    if (node) {
      node.x = newX;
      node.y = newY;
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
    this.ctx.fillStyle = node.color || 'white';
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

    const clickedNode = this.agents.find((node) =>
      this.isInsideNode(node, offsetX, offsetY)
    );

    if (clickedNode) {
      if (this.lastClickedNodeID !== clickedNode.id) {
        this.lastClickedNodeID = clickedNode.id;
        this.showAnswers = false;
        this.displayedText = '';
        this.form.get('chat')?.setValue(clickedNode.prompt);
        this.agents.forEach((agent) => {
          if (agent.id === clickedNode.id) {
            agent.color = 'lightblue';
          } else {
            agent.color = 'white';
          }
        });
      }
      // Revert the color of the last clicked node to white
      if (this.lastClickedNode) {
        this.lastClickedNode.color = 'white';
      }
      clickedNode.color = 'lightblue';
      this.lastClickedNode = clickedNode;
      this.render();
    }

    if (clickedNode && this.isNodeDeleteMode) {
      this.deleteNode(clickedNode.id);
      this.isNodeDeleteMode = false;
    }

    if (clickedConnection && this.isConnectionDeleteMode) {
      this.deleteConnection(clickedConnection.from.id, clickedConnection.to.id);
      this.isConnectionDeleteMode = false;
    }
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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadFile() {
    if (this.selectedFile && this.lastClickedNodeID) {
      this.fileUploadService.upload(this.selectedFile).subscribe(
        (response) => {
          console.log('File uploaded successfully', response);
          const agent = this.agents.find(
            (a) => a.id === this.lastClickedNodeID
          );
          if (agent) {
            agent.file = response.filename; // Assuming the response contains the filename
          }
        },
        (error) => {
          console.error('Error uploading file:', error);
        }
      );
    } else {
      console.error('No file selected or no node selected');
    }
  }
}
