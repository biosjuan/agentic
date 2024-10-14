import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CubeComponent } from './cube/cube.component';

@NgModule({
  declarations: [CubeComponent],
  imports: [CommonModule],
  exports: [CubeComponent],
})
export class ComponentModule {}
