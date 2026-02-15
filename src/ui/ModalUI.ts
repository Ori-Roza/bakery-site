import { formatCurrency } from '../utils/formatters';
import type { Product, Category, Order } from '../types/models';

export class ModalUI {
  /**
   * Open product edit modal
   */
  static openProductModal(
    product: Product,
    elements: {
      productModal: HTMLElement | null;
      modalTitle: HTMLInputElement | null;
      modalPrice: HTMLInputElement | null;
      modalDiscount: HTMLInputElement | null;
      modalImage: HTMLInputElement | null;
      modalStock: HTMLInputElement | null;
      modalStatus: HTMLElement | null;
    },
    state: { editingProductId: string | null; editingCategoryId: string | null },
    callbacks: {
      ensureCategoryOptions: () => void;
      setCategoryTriggerLabel: (triggerEl: HTMLElement | null, label: string, selectedId: string | null) => void;
      getCategoryLabel: (product: Product) => string;
      normalizeCategoryId: (value: any) => string | null;
      modalCategoryTrigger: HTMLElement | null;
      categories: Category[];
    }
  ): void {
    const { productModal, modalTitle, modalPrice, modalDiscount, modalImage, modalStock, modalStatus } = elements;
    
    console.log("[openModal] Opening for product:", product);
    state.editingProductId = String(product.id);
    
    if (modalTitle) modalTitle.value = product.title;
    if (modalPrice) modalPrice.value = String(product.price);
    if (modalDiscount) modalDiscount.value = String(product.discountPercentage || 0);

    const initialCategoryId = callbacks.normalizeCategoryId(product.categoryId);
    console.log("[openModal] After normalizeProductId, initialCategoryId:", initialCategoryId);
    
    if (initialCategoryId) {
      state.editingCategoryId = initialCategoryId;
      console.log("[openModal] Using normalizedId, set state.editingCategoryId:", initialCategoryId);
    } else if (product.categoryName || (product as any).category) {
      const match = callbacks.categories.find(
        (item) => item.category_name === (product.categoryName || (product as any).category)
      );
      state.editingCategoryId = match ? String(match.category_id) : null;
      console.log("[openModal] Looked up by name, state.editingCategoryId:", state.editingCategoryId);
    } else {
      state.editingCategoryId = null;
      console.log("[openModal] No category info, set state.editingCategoryId to null");
    }
    
    callbacks.ensureCategoryOptions();
    console.log("[openModal] Before setCategoryTriggerLabel, state.editingCategoryId:", state.editingCategoryId);
    callbacks.setCategoryTriggerLabel(
      callbacks.modalCategoryTrigger,
      callbacks.getCategoryLabel(product),
      state.editingCategoryId
    );
    
    if (modalImage) modalImage.value = "";
    if (modalStock) modalStock.checked = product.inStock;
    if (modalStatus) {
      modalStatus.textContent = "";
      modalStatus.className = "text-sm mt-2";
    }
    
    if (productModal) productModal.classList.remove("hidden");
  }

  /**
   * Close product edit modal
   */
  static closeProductModal(
    productModal: HTMLElement | null,
    state: { editingProductId: string | null }
  ): void {
    if (productModal) productModal.classList.add("hidden");
    state.editingProductId = null;
  }

  /**
   * Open create product modal
   */
  static openCreateProductModal(
    createModal: HTMLElement | null,
    state: { creatingCategoryId: string | null },
    categories: Category[],
    callbacks: {
      ensureCategoryOptions: () => void;
      setCategoryTriggerLabel: (triggerEl: HTMLElement | null, label: string, selectedId: string) => void;
      createCategoryTrigger: HTMLElement | null;
    }
  ): void {
    if (!state.creatingCategoryId && categories.length > 0 && categories[0]) {
      state.creatingCategoryId = String(categories[0].category_id);
      callbacks.setCategoryTriggerLabel(
        callbacks.createCategoryTrigger,
        categories[0].category_name,
        String(categories[0].category_id)
      );
    }
    callbacks.ensureCategoryOptions();
    if (createModal) createModal.classList.remove("hidden");
  }

  /**
   * Close create product modal
   */
  static closeCreateProductModal(createModal: HTMLElement | null): void {
    if (createModal) createModal.classList.add("hidden");
  }

  /**
   * Open category create modal
   */
  static openCategoryModal(
    categoryModal: HTMLElement | null,
    categoryStatus: HTMLElement | null
  ): void {
    if (categoryModal) categoryModal.classList.remove("hidden");
    if (categoryStatus) {
      categoryStatus.textContent = "";
      categoryStatus.className = "text-sm mt-2";
    }
  }

  /**
   * Close category create modal
   */
  static closeCategoryModal(categoryModal: HTMLElement | null): void {
    if (categoryModal) categoryModal.classList.add("hidden");
  }

  /**
   * Open category edit modal
   */
  static openCategoryEditModal(
    category: Category,
    elements: {
      categoryEditModal: HTMLElement | null;
      categoryEditNameInput: HTMLInputElement | null;
      categoryEditImageInput: HTMLInputElement | null;
      categoryEditPreview: HTMLElement | null;
      categoryEditStatus: HTMLElement | null;
    },
    state: { editingCategoryRowId: string | null }
  ): void {
    const { categoryEditModal, categoryEditNameInput, categoryEditImageInput, categoryEditPreview, categoryEditStatus } = elements;
    
    if (!categoryEditModal) return;
    
    state.editingCategoryRowId = String(category.category_id);
    if (categoryEditNameInput) categoryEditNameInput.value = category.category_name;
    if (categoryEditImageInput) categoryEditImageInput.value = "";
    
    if (categoryEditPreview) {
      const previewSrc = category.image_url || "assets/all_categories.png";
      categoryEditPreview.innerHTML = `
        <img src="${previewSrc}" alt="${category.category_name}" class="admin-category-image" />
      `;
    }
    
    if (categoryEditStatus) {
      categoryEditStatus.textContent = "";
      categoryEditStatus.className = "text-sm mt-2";
    }
    
    categoryEditModal.classList.remove("hidden");
  }

  /**
   * Close category edit modal
   */
  static closeCategoryEditModal(
    categoryEditModal: HTMLElement | null,
    categoryEditStatus: HTMLElement | null,
    state: { editingCategoryRowId: string | null }
  ): void {
    if (!categoryEditModal) return;
    categoryEditModal.classList.add("hidden");
    state.editingCategoryRowId = null;
    if (categoryEditStatus) {
      categoryEditStatus.textContent = "";
      categoryEditStatus.className = "text-sm mt-2";
    }
  }

  /**
   * Open order details modal
   */
  static openOrderDetailsModal(
    order: Order,
    elements: {
      orderDetailsModal: HTMLElement | null;
      orderDetailsContent: HTMLElement | null;
    }
  ): void {
    const { orderDetailsModal, orderDetailsContent } = elements;
    
    if (!orderDetailsContent) return;
    
    const items = (order.items || [])
      .map((item) => `${item.title} x ${item.qty}`)
      .join("<br />");
      
    orderDetailsContent.innerHTML = `
      <div><strong>מזהה הזמנה:</strong> ${order.order_number ?? ""}</div>
      <div><strong>שם:</strong> ${order.customer?.name || ""}</div>
      <div><strong>טלפון:</strong> ${order.customer?.phone || ""}</div>
      <div><strong>תאריך יצירה:</strong> ${new Date(order.created_at).toLocaleString(
        "he-IL",
        { hour12: false }
      )}</div>
      <div><strong>תאריך איסוף:</strong> ${order.pickup_date ? new Date(order.pickup_date).toLocaleDateString("he-IL") + " " + (order.pickup_time || "") : "-"}</div>
      <div><strong>סכום:</strong> ${formatCurrency(order.total ?? 0)}</div>
      <div><strong>שולם:</strong> ${order.paid ? "כן" : "לא"}</div>
      <div><strong>הערות מנהל:</strong> ${order.notes || "-"}</div>
      <div><strong>הערות לקוח:</strong> ${order.user_notes || "-"}</div>
      <div><strong>פריטים:</strong><br />${items || "-"}</div>
    `;
    
    if (orderDetailsModal) orderDetailsModal.classList.remove("hidden");
  }

  /**
   * Open order create modal
   */
  static openOrderModal(orderModal: HTMLElement | null): void {
    if (orderModal) orderModal.classList.remove("hidden");
  }

  /**
   * Close order create modal
   */
  static closeOrderModal(orderModal: HTMLElement | null): void {
    if (orderModal) orderModal.classList.add("hidden");
  }

  /**
   * Open delete confirmation modal
   */
  static openDeleteConfirm(
    type: 'product' | 'category',
    id: string | number | null,
    name: string,
    deleteConfirmModal: HTMLElement | null,
    state: { pendingDeleteType: string | null; pendingDeleteId: any }
  ): void {
    if (!deleteConfirmModal) return;
    
    state.pendingDeleteType = type;
    state.pendingDeleteId = id;
    
    const modalTitle = deleteConfirmModal.querySelector('.admin-title');
    const modalMessage = deleteConfirmModal.querySelector('p');
    
    if (type === 'category') {
      if (modalTitle) modalTitle.textContent = 'מחיקת קטגוריה';
      if (modalMessage) {
        modalMessage.textContent = name 
          ? `אתם בטוחים שתרצו למחוק את הקטגוריה "${name}"?`
          : 'למחוק את הקטגוריה?';
      }
    } else {
      if (modalTitle) modalTitle.textContent = 'מחיקת מוצר';
      if (modalMessage) modalMessage.textContent = 'האם אתה בטוח שאתה רוצה למחוק את המוצר?';
    }
    
    deleteConfirmModal.classList.remove("hidden");
  }

  /**
   * Close delete confirmation modal
   */
  static closeDeleteConfirm(
    deleteConfirmModal: HTMLElement | null,
    state: { pendingDeleteType: string | null; pendingDeleteId: any }
  ): void {
    if (deleteConfirmModal) deleteConfirmModal.classList.add("hidden");
    state.pendingDeleteType = null;
    state.pendingDeleteId = null;
  }

  /**
   * Open order channel modal
   */
  static openOrderChannelModal(
    orderChannelModal: HTMLElement | null,
    links: { whatsapp: string; email: string }
  ): void {
    if (!orderChannelModal) return;
    orderChannelModal.dataset.whatsappLink = links.whatsapp;
    orderChannelModal.dataset.emailLink = links.email;
    orderChannelModal.classList.remove("hidden");
  }

  /**
   * Close order channel modal
   */
  static closeOrderChannelModal(
    orderChannelModal: HTMLElement | null
  ): void {
    if (orderChannelModal) orderChannelModal.classList.add("hidden");
  }

  /**
   * Open notes popover
   */
  static openNotesPopover(
    inputEl: HTMLElement | null,
    notesPopover: HTMLElement,
    notesTextarea: HTMLTextAreaElement
  ): { activeNotesInput: HTMLElement | null } {
    if (!inputEl) return { activeNotesInput: null };
    
    const activeNotesInput = inputEl;
    notesTextarea.value = (inputEl as HTMLInputElement).value || "";
    
    const rect = inputEl.getBoundingClientRect();
    const popoverWidth = Math.min(360, window.innerWidth - 24);
    const popoverHeight = 220;
    let top = rect.bottom + 8;
    if (top + popoverHeight > window.innerHeight) {
      top = rect.top - popoverHeight - 8;
    }
    const left = Math.min(rect.left, window.innerWidth - popoverWidth - 12);
    notesPopover.style.top = `${Math.max(top, 12)}px`;
    notesPopover.style.left = `${Math.max(left, 12)}px`;
    notesPopover.classList.remove("hidden");
    requestAnimationFrame(() => notesTextarea.focus());
    
    return { activeNotesInput };
  }

  /**
   * Close notes popover
   */
  static closeNotesPopover(
    shouldSave: boolean,
    activeNotesInput: HTMLElement | null,
    notesPopover: HTMLElement,
    notesTextarea: HTMLTextAreaElement,
    onSave?: (orderId: string, value: string) => Promise<void>
  ): { activeNotesInput: null } {
    if (!activeNotesInput) {
      notesPopover.classList.add("hidden");
      return { activeNotesInput: null };
    }
    
    if (shouldSave && onSave) {
      const newValue = notesTextarea.value;
      (activeNotesInput as HTMLInputElement).value = newValue;
      const orderId = (activeNotesInput as HTMLInputElement).dataset.orderId;
      if (orderId) {
        onSave(orderId, newValue);
      }
    }
    
    notesPopover.classList.add("hidden");
    return { activeNotesInput: null };
  }
}
