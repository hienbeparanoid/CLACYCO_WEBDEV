import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminOrderService } from 'src/app/services/admin-order.service';
import { Order } from 'src/app/interfaces/order';

@Component({
  selector: 'app-admin-order-detail',
  templateUrl: './admin-order-detail.component.html',
  styleUrls: ['./admin-order-detail.component.css']
})
export class AdminOrderDetailComponent {
  order = new Order();
  public setOrder(o: Order) {
    this.order = o;
  }
  orders: any;
  price: number = 0;
  total: number = 0;
  errMessage: string = "";

  constructor(private activateRoute: ActivatedRoute,
    private _fs: AdminOrderService,
    private router: Router,
  ) {
    activateRoute.paramMap.subscribe(
      (param) => {
        let id = param.get('id');
        if (id != null) {
          this.searchOrder(id);
        }
      }
    );
  }
  
  searchOrder(_id: string) {
    this._fs.getOrderDetail(_id).subscribe({
      next: (data) => {
        this.order = data;
      },
      error: (err) => { this.errMessage = err; }
    });
  }

  //tìm thành tiền cho từng sản phẩm
  findSum(item: any) {
    this.price = parseFloat(item.Price.replace(".", ""));
    this.total = this.price * item.quantity;
    return this.total.toLocaleString("vi-VN", { minimumFractionDigits: 0 });
  }

  completeOrder() {
    this.order.Status = "Delivered";
    this._fs.updateOrderStatus(this.order).subscribe({
      next: (data) => {
        location.reload();
      },
      error: (err) => {
        this.errMessage = err;
      }
    });
    alert('Order updated successfully')
    this.goBack()
  }

  deliveryOrder() {
    this.order.Status = "In transit";
    this._fs.updateOrderStatus(this.order).subscribe({
      next: (data) => {
        location.reload();
      },
      error: (err) => {
        this.errMessage = err;
      }
    });
    alert('Order updated successfully')
    this.goBack()
  }

  cancelOrder() {
    if (window.confirm('Would you like to cancel this order?')) {
      this.order.Status = "Cancel"
      this._fs.updateOrderStatus(this.order).subscribe({
        next: (data) => { location.reload() },
        error: (err) => { this.errMessage = err; }
      });
      this.goBack()
    }
  }
  goBack() {
    this.router.navigate(['admin-order']);
  }
}