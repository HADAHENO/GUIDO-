import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  standalone: true,  // Mark as standalone
  imports: [MatDialogModule, MatButtonModule],  // Import required modules
  template: `
    <h2 mat-dialog-title>Exit App?</h2>
    <mat-dialog-content>
      <p>Are you sure you want to exit?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-button color="warn" [mat-dialog-close]="true">Exit</button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 { color: #3f51b5; }
    mat-dialog-actions { padding: 16px 24px; }
  `]
})
export class ExitConfirmComponent {
  constructor(public dialogRef: MatDialogRef<ExitConfirmComponent>) {}
}