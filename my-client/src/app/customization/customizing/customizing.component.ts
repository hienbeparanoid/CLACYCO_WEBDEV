import { Component, OnInit, HostListener, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Cosmetics } from '../../Interfaces/Cosmetic';
import { CosmeticService } from '../../SERVICES/cosmetic.service';
import { CategoryService } from '../../SERVICES/category.service';

@Component({
  selector: 'app-customizing',
  templateUrl: './customizing.component.html',
  styleUrls: ['./customizing.component.css']
})
export class CustomizingComponent implements OnInit {
  selectedCategory: string = '';
  categories: any[] | undefined;
  cosmetics: any;
  cosmetic = new Cosmetics();
  errMessage: string = '';
  inputText: string = '';
  wordCount: number = 0;
  uploadNotification: string = '';
  specialDetails: string = '';
  isDropdownOpen: boolean = false; // Trạng thái của dropdown
  selectedItem: string = ''; // Mục đã chọn từ dropdown

  @ViewChild('scrollArrow') scrollArrow!: ElementRef; // Khai báo ViewChild
  constructor(
    public _service: CosmeticService,
    public _fs: CategoryService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private renderer: Renderer2 // Khai báo Renderer2
  ) {
    activateRoute.paramMap.subscribe((param) => {
      let category = param.get('category');
      if (category != null) {
        this.selectCategory(category);
      }
    });
    this.loadData();
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this._service.getCosmetics().subscribe({
      next: (data) => {
        this.cosmetics = data;
      },
      error: (err) => {
        this.errMessage = err;
      },
    });

    this._fs.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        this.errMessage = err;
      },
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  updateWordCount(inputValue: string): void {
    this.wordCount = inputValue.split(' ').length;
  }

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  handleFileUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log(`File uploaded: ${file.name}`);
      this.uploadNotification = `Uploaded: ${file.name}`;
    }
  }

  addToCart(): void {
    // Find the product by name in the cosmetics array
    const productToAdd = this.cosmetics.find((cosmetic: any) => cosmetic.Name === 'Handcrafted Ceramic Serving Bowls');

    if (productToAdd) {
        // Set the quantity for the product
        productToAdd.quantity = 1;

        this._service.addToCart(productToAdd).subscribe(
            (response: any) => {
                console.log(response);
                alert("Product added to cart successfully!");
                window.location.reload();
            },
            (error: any) => {
                console.log(error);
            }
        );
    } else {
        alert("Product not found!");
    }
}

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectItem(item: string): void {
    this.selectedItem = item; // Gán mục đã chọn vào selectedItem
    this.isDropdownOpen = false; // Đóng dropdown sau khi chọn
  }

  scrollToForm() {
    const section = document.getElementById('formContainer');
    if (section) {
      const sectionPosition = section.offsetTop;
      const offset = 20; // Điều chỉnh khoảng cách tùy ý

      window.scrollTo({
        top: sectionPosition - offset,
        behavior: 'smooth'
      });

      // Ẩn mũi tên sau khi cuộn
      const arrow = this.scrollArrow.nativeElement;
      this.renderer.addClass(arrow, 'hide-arrow');
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const arrow = this.scrollArrow.nativeElement;

    // Chỉ hiển thị mũi tên nếu ở đầu trang
    if (window.scrollY === 0) {
      this.renderer.removeClass(arrow, 'hide-arrow');
    } else {
      this.renderer.addClass(arrow, 'hide-arrow');
    }
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.droplist-position')) {
      this.isDropdownOpen = false;
    }
  }
}
