import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-workshop',
  templateUrl: './workshop.component.html',
  styleUrls: ['./workshop.component.css']
})
export class WorkshopComponent implements AfterViewInit {
  @ViewChild('fullNameInput') fullNameInput!: ElementRef;
  @ViewChild('contactForm') contactForm!: ElementRef;

  // Countdown properties
  days: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  private countdownInterval: any;

  // Set the target date for the countdown
  targetDate: Date = new Date('2024-11-07T23:59:59'); // Example target date

  ngAfterViewInit(): void {
    // Start the countdown timer
    this.startCountdown();
    console.log("Full Name Input and Contact Form initialized:", this.fullNameInput, this.contactForm);
  }

  // Countdown function
  startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      const currentTime = new Date().getTime();
      const targetTime = this.targetDate.getTime();
      const timeDifference = targetTime - currentTime;

      if (timeDifference > 0) {
        // Calculate time remaining
        this.days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        this.hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        this.minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        this.seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
      } else {
        // Clear interval when countdown is finished
        clearInterval(this.countdownInterval);
        this.days = 0;
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        alert('Countdown Complete!');
      }

      // Update display values in HTML
      this.updateDisplay();
    }, 1000); // Update every 1 second
  }

  // Update countdown display
  updateDisplay(): void {
    // Ensure that each value is placed in the correct element
    const daysElement = document.getElementById('days');
    const minutesElement = document.getElementById('hours');
    const secondsElement = document.getElementById('minutes');
    const hoursElement = document.getElementById('seconds');


    if (daysElement) daysElement.innerText = this.days.toString().padStart(2, '0');
    if (hoursElement) hoursElement.innerText = this.hours.toString().padStart(2, '0');
    if (minutesElement) minutesElement.innerText = this.minutes.toString().padStart(2, '0');
    if (secondsElement) secondsElement.innerText = this.seconds.toString().padStart(2, '0');
  }

  // Form submission handling
  onSubmit(): void {
    alert('Registered successfully!');
  }

  // Focus on the full name input field
  focusFullName(): void {
    if (this.fullNameInput) {
      this.fullNameInput.nativeElement.focus();
      console.log("Focus vào ô Full Name thành công");
    } else {
      console.error("fullNameInput chưa được khởi tạo.");
    }
  }

  // Scroll to the contact form
  scrollToForm(): void {
    console.log("Button clicked");
    if (this.contactForm) {
      this.contactForm.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        this.focusFullName();
      }, 1000); // Adjust time if needed to match scroll speed
    } else {
      console.error("contactForm chưa được khởi tạo.");
    }
  }
}
