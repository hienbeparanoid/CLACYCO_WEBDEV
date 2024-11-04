import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Cosmetics } from '../../Interfaces/Cosmetic';
import { CosmeticService } from '../../SERVICES/cosmetic.service';
import { CategoryService } from '../../SERVICES/category.service';

@Component({
  selector: 'app-customize-product-list',
  templateUrl: './customize-product-list.component.html',
  styleUrls: ['./customize-product-list.component.css']
})
export class CustomizeProductListComponent implements OnInit {
  selectedCategory: string = '';
  allowedCategories = ['Ceramic/ Pot', 'Ceramic/ Bowls', 'Ceramic/ Teapot']; // Specify initial categories
  categories!: { Name: string }[];
  filteredCategories!: { Name: string }[];
  cosmetics: any;
  cosmetic = new Cosmetics();
  errMessage: string = '';

  constructor(
    public _service: CosmeticService,
    public _fs: CategoryService,
    private router: Router,
    private activateRoute: ActivatedRoute
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
    this.categories = [
      { Name: 'Ceramic/ Pot' },
      { Name: 'Ceramic/ Bowls' },
      { Name: 'Ceramic/ Teapot' },
      { Name: 'Ceramic/ Plate' },
      { Name: 'Ceramic/ Planter' }
    ];
    this.filteredCategories = this.categories.filter(category => this.isCategoryAllowed(category));
  }

  isCategoryAllowed(category: { Name: string }): boolean {
    return this.allowedCategories.includes(category.Name);
  }

  selectCategory(categoryName: string): void {
    this.selectedCategory = categoryName;
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
        this.filteredCategories = this.categories.filter(category => this.isCategoryAllowed(category));
      },
      error: (err) => {
        this.errMessage = err;
      },
    });
  }

  filterCosmetics(): any[] {
    if (this.selectedCategory === '') {
      // If no specific category is selected, show only products from allowed categories
      return this.cosmetics.filter((cosmetic: any) =>
        this.allowedCategories.includes(cosmetic.Category)
      );
    } else {
      // Show products from the selected category
      return this.cosmetics.filter((cosmetic: any) =>
        cosmetic.Category === this.selectedCategory
      );
    }
  }

  viewCosmeticDetail(f: any) {
    this.router.navigate(['app-product-detail', f._id]).then(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    });
  }

  goToProductDetail() {
    this.router.navigate(['/customizing']);
  }
}
