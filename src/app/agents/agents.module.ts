import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentsComponent } from './agents/agents.component';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentModule } from '../components/components.module';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [AgentsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: AgentsComponent }]),
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTabsModule,
    MatToolbarModule,
    MatCardModule,
    MatIconModule,
    ComponentModule,
  ],
})
export class AgentsModule {}
