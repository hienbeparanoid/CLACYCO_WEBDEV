import { Component } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-aboutus',
  templateUrl: './aboutus.component.html',
  styleUrls: ['./aboutus.component.css'],
  standalone: true, // Add this line for standalone component
  imports: [NgIf, NgClass], // Import NgIf and NgClass
})
export class AboutUsComponent {
  activeTab: string = 'vision';

  constructor(
    private router: Router,
  ) {}

  toggleTab(tab: string) {
    this.activeTab = tab;
  }

  browseProduct() {
    this.router.navigate(['/app-category']);
  }
}
