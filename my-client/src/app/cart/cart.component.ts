import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ProductsService } from '../SERVICES/products.service';
import { AuthService } from '../SERVICES/auth.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
  
})

export class CartComponent implements OnInit {
  cartItems: any;
  errMessage: string = '';
  products: any;
  categories: any[] | undefined;
  display:boolean = true;
  quantityItem: number = 0;
  totalPrice: number = 0;
  prePrice: number = 0;
  total:string = '0';
  preprice:string = '0';
  selectedItems: any[] = [];
  currentUser: any;
  isLogin: boolean = false;
  isDeleted: boolean = false;
  private _orderService: any;
  order: any;

  constructor(
    private activateRoute: ActivatedRoute,
    private _service: ProductsService,
    private router: Router,
    private _authService: AuthService
  ) {
    this._service.getProducts().subscribe({
      next: (data:any) => {
        // Lấy danh sách các Products
        this.products = data;
      },
      error: (err: string) => {
        this.errMessage = err;
      },
    });

    this._service.getCart().subscribe({
      next: (data: any) => {
        this.cartItems = data;
        this.quantityItem = this.cartItems.length;
        if(this.cartItems.length > 0){
          this.display = false;
        }
      }
    });
    this.currentUser = this._authService.getCurrentUser();
  }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  viewProductsDetail(f: any) {
    this.router.navigate(['app-product-detail', f._id]).then(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    });
  }
  calculateTotalPrice(item: any) {
    const price: number = parseFloat(item.Price.replace(".", ""));
    if (this.selectedItems.includes(item)) {
      // sản phẩm đã được chọn, bỏ chọn nó
      this.selectedItems = this.selectedItems.filter(selectedItem => selectedItem !== item);
      this.totalPrice -= price * item.quantity;
    } else {
      // sản phẩm chưa được chọn, chọn nó
      this.selectedItems.push(item);
      this.totalPrice += price * item.quantity;
    }
    // cập nhật giá trị hiển thị trên giao diện
    this.prePrice = this.totalPrice;
    this.total = this.totalPrice.toLocaleString("vi-VN", { minimumFractionDigits: 0 });
    this.preprice = this.prePrice.toLocaleString("vi-VN", { minimumFractionDigits: 0 });
  }
  
  increase(product: any) {
    console.log("increase called");
    product.quantity++;
    this._service.updateQuantityCart(product).subscribe(
      (response: any) => {
        console.log(response);
        // Cập nhật số lượng sản phẩm thành công
      }
    );
  }

  decrease(product: any) {
    console.log("decrease called");
    if (product.quantity > 1) {
      product.quantity--;
      this._service.updateQuantityCart(product).subscribe(
        (response: any) => {
          console.log(response);
          // Cập nhật số lượng sản phẩm thành công
        }
      );
    }
  }

  updateQuantity(cos: any) {
    console.log(cos);
    this._service.updateQuantityCart(cos).subscribe(
      (response: any) => {
        console.log(response);
        // Cập nhật số lượng sản phẩm thành công
      }
    );
  }

  addToCart(cos: any): void {
    cos.quantity = 1;
    this._service.addToCart(cos).subscribe(
      (response: any) => {
        console.log(response);
        alert("Product added to cart successfully");
        window.location.reload();
        // Thêm sản phẩm vào giỏ hàng thành công
      },
      (error: any) => {
        console.log(error);
        // Xảy ra lỗi khi thêm sản phẩm vào giỏ hàng
      }
    );
  }

  removeFromCart(cosId: any) {
    if(window.confirm("Are you sure you want to remove this from the cart?")){
      this._service.removeFromCart(cosId).subscribe(
        (response: any) => {
          console.log(response);
          alert("Product removed from cart successfully");
          window.location.reload();
          // Xóa sản phẩm khỏi giỏ hàng thành công
        },
        (error: any) => {
          console.log(error);
          // Xảy ra lỗi khi xóa sản phẩm khỏi giỏ hàng
        }
      );
    }
  }

  makePayment(){
    if(this.currentUser != null){
      // Kiểm tra xem có mục nào được chọn không
      if(this.selectedItems.length === 0){
        alert('Please select a product to proceed with checkout.');
        return;
      }
      const navigationExtras: NavigationExtras = {
        queryParams: {
          selectedItems: JSON.stringify(this.selectedItems)
        }
      };
      this.router.navigate(['app-payment'], navigationExtras);
    } else {
      this.isLogin = true;
    }
  }
  createOrder(isDeleted: boolean) {
    // Thực hiện logic tạo đơn hàng (gọi API hoặc sử dụng service)
    this._orderService.createOrder(this.order).subscribe({
      next: () => {
        // Nếu tạo đơn hàng thành công và isDeleted là true, hãy xóa giỏ hàng
        if (isDeleted) {
          this._service.deleteCart();
        }
        this.isDeleted = false; // Reset trạng thái xóa
        // Thực hiện các hành động khác sau khi tạo đơn hàng thành công
      },
      error: (error: any) => {
        // Xử lý lỗi tạo đơn hàng
      }
    });
  }

  //popup
  @Input() title: string='';
  @Input() message: string='';
  @Output() confirmed = new EventEmitter<boolean>();

  onLogin() {
    this.confirmed.emit(true);
    this.router.navigate(['app-login']);
  }

  onBack() {
    this.confirmed.emit(false);
    this.isLogin = false;
  }
  returnHome() {
    this.router.navigate(['/app-home']);
  }
}