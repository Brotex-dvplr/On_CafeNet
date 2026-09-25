/**
 * On-CafeNet Digital Studio - Vanilla JavaScript
 * Zero-framework, Cloudflare Pages ready
 */

// Global App State
const ONCAFE = {
  baleLink: 'https://ble.ir/on_cafenet',
  
  // Persian digit converter
  toFarsi(n) {
    if (n === null || n === undefined) return '';
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return n.toString().replace(/\d/g, (x) => farsiDigits[x]);
  },

  formatPrice(num) {
    if (!num) return '۰';
    return this.toFarsi(Number(num).toLocaleString('en-US'));
  },

  // Cart Management
  getCart() {
    try {
      const data = localStorage.getItem('oncafe_cart');
      return data ? JSON.parse(data) : [
        { id: '1', title: 'پکیج طراحی وبسایت شرکتی مدرن On-CafeNet', price: 12665000, raw: 14900000, qty: 1, category: 'طراحی وبسایت', code: 'ON-WEB-404' },
        { id: '2', title: 'پکیج ویدیوی تبلیغاتی هوش مصنوعی خلاقانه', price: 4320000, raw: 4800000, qty: 1, category: 'هوش مصنوعی AI', code: 'ON-VID-AI' },
        { id: '3', title: 'طراحی لوگو مونوگرام و هویت بصری استودیو', price: 3500000, raw: 3500000, qty: 1, category: 'برندینگ و گرافیک', code: 'ON-BRAND-99' }
      ];
    } catch (e) {
      return [];
    }
  },

  saveCart(items) {
    localStorage.setItem('oncafe_cart', JSON.stringify(items));
    this.updateCartBadge();
  },

  addToCart(item) {
    const cart = this.getCart();
    const existing = cart.find(i => i.id === item.id || i.title === item.title);
    if (existing) {
      existing.qty += (item.qty || 1);
    } else {
      cart.push({
        id: item.id || Date.now().toString(),
        title: item.title,
        price: Number(item.price) || 0,
        raw: Number(item.raw) || Number(item.price) || 0,
        qty: item.qty || 1,
        category: item.category || 'خدمت دیجیتال',
        code: item.code || 'OCN-SRV'
      });
    }
    this.saveCart(cart);
    this.showToast(`«${item.title}» به سبد سفارشات اضافه شد.`);
  },

  removeFromCart(id) {
    let cart = this.getCart();
    cart = cart.filter(item => item.id !== id);
    this.saveCart(cart);
  },

  updateCartBadge() {
    const cart = this.getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const badges = document.querySelectorAll('.cart-counter-badge');
    badges.forEach(badge => {
      badge.textContent = this.toFarsi(totalCount);
      if (totalCount === 0) {
        badge.classList.add('hidden');
      } else {
        badge.classList.remove('hidden');
      }
    });
  },

  // Wishlist Management
  getWishlist() {
    try {
      const data = localStorage.getItem('oncafe_wishlist');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  toggleWishlist(title, btnElement) {
    let list = this.getWishlist();
    const exists = list.includes(title);
    if (exists) {
      list = list.filter(t => t !== title);
      localStorage.setItem('oncafe_wishlist', JSON.stringify(list));
      if (btnElement) {
        btnElement.classList.remove('text-red-500', 'text-badge-discount');
        const icon = btnElement.querySelector('.material-symbols-outlined');
        if (icon) {
          icon.style.fontVariationSettings = "'FILL' 0";
          icon.textContent = 'favorite_border';
        }
      }
      this.showToast(`«${title}» از علاقه‌مندی‌ها برداشته شد.`, 'info');
    } else {
      list.push(title);
      localStorage.setItem('oncafe_wishlist', JSON.stringify(list));
      if (btnElement) {
        btnElement.classList.add('text-red-500');
        const icon = btnElement.querySelector('.material-symbols-outlined');
        if (icon) {
          icon.style.fontVariationSettings = "'FILL' 1";
          icon.textContent = 'favorite';
        }
      }
      this.showToast(`«${title}» به لیست علاقه‌مندی‌ها اضافه شد!`, 'heart');
    }
  },

  // Toast Notification
  showToast(message, type = 'success') {
    let container = document.getElementById('oncafe-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'oncafe-toast-container';
      container.className = 'fixed bottom-6 left-6 z-[99999] flex flex-col gap-2 pointer-events-none max-w-sm';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface-dark text-white shadow-2xl transition-all duration-300 transform translate-y-4 opacity-0 border border-white/10';
    
    let iconName = 'check_circle';
    let iconColor = 'text-cyan-400';
    if (type === 'heart') {
      iconName = 'favorite';
      iconColor = 'text-red-400';
    } else if (type === 'info') {
      iconName = 'info';
      iconColor = 'text-amber-400';
    }

    toast.innerHTML = `
      <span class="material-symbols-outlined ${iconColor} text-[22px]">${iconName}</span>
      <span class="font-body-sm text-body-sm flex-1 leading-snug">${message}</span>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-4');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // Bale Direct Ordering
  orderViaBale(customMessage) {
    let text = '';
    if (customMessage) {
      text = customMessage;
    } else {
      const cart = this.getCart();
      if (!cart || cart.length === 0) {
        text = 'سلام استودیو On-CafeNet، مایل به مشاوره و سفارش پروژه جدید هستم.';
      } else {
        text = 'سلام و احترام استودیو On-CafeNet 🚀\nسفارش جدید من از سایت:\n\n';
        let total = 0;
        cart.forEach((item, idx) => {
          text += `${idx + 1}. ${item.title} (${item.qty} عدد) - ${item.price.toLocaleString()} تومان\n`;
          total += (item.price * item.qty);
        });
        text += `\nجمع کل سفارش: ${total.toLocaleString()} تومان\nلطفاً برای پیش‌فاکتور و آغاز پروژه راهنمایی بفرمایید.`;
      }
    }
    
    // Attempt to copy order text to clipboard for convenience
    if (navigator.clipboard && text) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    
    this.showToast('در حال انتقال به پیام‌رسان بله...');
    window.open('https://ble.ir/on_cafenet', '_blank');
  },

  orderViaTelegram(customMessage) {
    this.orderViaBale(customMessage);
  }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  ONCAFE.updateCartBadge();

  // Search input live trigger
  const searchInputs = document.querySelectorAll('input[type="text"][placeholder*="جستجو"]');
  searchInputs.forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = input.value.trim();
        if (val) {
          window.location.href = `products.html?q=${encodeURIComponent(val)}`;
        }
      }
    });
  });
});
