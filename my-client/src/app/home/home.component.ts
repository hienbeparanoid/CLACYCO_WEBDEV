import { Component, OnInit, Renderer2, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CosmeticService } from '../SERVICES/cosmetic.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('scrollArrow') scrollArrow!: ElementRef;
  @ViewChild('typingEffect') typingEffect!: ElementRef; // Thêm ViewChild cho hiệu ứng typing của "Customization"
  @ViewChild('workshopTypingEffect') workshopTypingEffect!: ElementRef; // Thêm ViewChild cho hiệu ứng typing của "WORKSHOP"

  category: string = '';
  categories: any[] | undefined;
  cosmetics: any[] | undefined;
  quantity: number = 1;
  randomFeaturedCosmetics: any[] | undefined;
  cosmeticCategory: any;
  cosmetic: any;
  errMessage: string = '';
  displayProduct: boolean = true;

  constructor(
    public _service: CosmeticService,
    private router: Router,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    const numRandomCosmetics = 5;
    this._service.getCosmetics().subscribe({
      next: (data) => {
        this.cosmetics = data;
        this.randomFeaturedCosmetics = this.getRandomCosmetics(numRandomCosmetics, data);
      },
      error: (err) => {
        console.error(err);
      }
    });

    // Gắn sự kiện cuộn để ẩn mũi tên khi cuộn xuống
    this.renderer.listen(window, 'scroll', () => {
      const arrow = this.scrollArrow.nativeElement;
      if (window.scrollY > 100) { // Ẩn mũi tên khi cuộn xuống 100px
        this.renderer.addClass(arrow, 'hide-arrow');
      } else {
        this.renderer.removeClass(arrow, 'hide-arrow');
      }
    });
  }

  ngAfterViewInit(): void {
    // Bắt đầu hiệu ứng typing cho cả "Customization" và "WORKSHOP"
    this.startTypingEffect(this.typingEffect.nativeElement);
    this.startTypingEffect(this.workshopTypingEffect.nativeElement);
  }

  startTypingEffect(element: HTMLElement) {
    const text = element.textContent || '';
    let index = 0;

    const type = () => {
      if (index < text.length) {
        this.renderer.setProperty(element, 'textContent', text.substring(0, index + 1));
        index++;
        setTimeout(type, 100);
      }
    };

    // Gọi lại hàm typing mỗi 5 giây
    setInterval(() => {
      this.renderer.setProperty(element, 'textContent', '');
      index = 0;
      type();
    }, 3000);

    type(); // Bắt đầu typing ngay lập tức
  }

  viewCosmeticDetail(f: any) {
    this.router.navigate(['app-product-detail', f._id]).then(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    });
  }

  addToCart(cos: any): void {
    cos.quantity = 1;
    this._service.addToCart(cos).subscribe(
      (response: any) => {
        console.log(response);
        alert("Thêm sản phẩm vào giỏ hàng thành công");
        window.location.reload();
      },
      (error: any) => {
        console.log(error);
      }
    );
  }

  scrollToNextSection() {
    window.scrollBy({
      top: window.innerHeight,
      behavior: 'smooth'
    });
    // Ẩn mũi tên sau khi cuộn
    const arrow = this.scrollArrow.nativeElement;
    this.renderer.addClass(arrow, 'hide-arrow');
  }

  getRandomCosmetics(numRandomCosmetics: number, sourceCosmetics: any[] | undefined = this.cosmetics) {
    const totalCosmetics = sourceCosmetics?.length ?? 0;
    const randomIndices: number[] = [];
    while (randomIndices.length < numRandomCosmetics && totalCosmetics > 0) {
      const randomIndex = Math.floor(Math.random() * totalCosmetics);
      if (!randomIndices.includes(randomIndex)) {
        randomIndices.push(randomIndex);
      }
    }
    return randomIndices.map(index => sourceCosmetics?.[index]);
  }
}
