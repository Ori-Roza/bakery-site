import type { AppState, Category } from '../types/models';
import { CategoryResolver } from '../business/CategoryResolver';

export class CategoryUI {
  /**
   * Set active category and render
   */
  static setActiveCategory(
    categoryId: string | null,
    state: AppState,
    renderCallbacks: { renderCategoryCarousel: () => void; renderProducts: () => void }
  ): void {
    state.activeCategoryId = categoryId;
    renderCallbacks.renderCategoryCarousel();
    renderCallbacks.renderProducts();
    
    const productsHeadingEl = document.getElementById("products-heading");
    const productsScrollEl = document.getElementById("products-scroll");
    const productsSection = productsHeadingEl || productsScrollEl;
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /**
   * Render category carousel
   */
  static renderCategoryCarousel(
    state: AppState,
    categoryTrackEl: HTMLElement | null,
    onCategoryClick: (categoryId: string | null) => void
  ): void {
    if (!categoryTrackEl) return;

    categoryTrackEl.innerHTML = "";

    // All categories card
    const allCard = document.createElement("button");
    allCard.type = "button";
    allCard.className = "carousel-card category-card";
    if (!state.activeCategoryId) {
      allCard.classList.add("active");
    }
    allCard.dataset.categoryId = "";
    allCard.innerHTML = `
      <div class="relative">
        <img src="${CategoryResolver.getCategoryThumbnail(state.categories, null)}" alt="כל הקטגוריות" />
      </div>
      <div class="carousel-content">
        <h5 class="font-semibold text-lg">כל הקטגוריות</h5>
        <p class="text-sm text-stone-500">הצגת כל המוצרים</p>
      </div>
    `;
    allCard.addEventListener("click", () => onCategoryClick(null));
    categoryTrackEl.appendChild(allCard);

    // Sort categories
    const sortedCategories = [...state.categories].sort((a, b) =>
      a.category_name.localeCompare(b.category_name, "he")
    );

    // Render category cards
    sortedCategories.forEach((category) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "carousel-card category-card";
      if (String(state.activeCategoryId) === String(category.category_id)) {
        card.classList.add("active");
      }
      card.dataset.categoryId = String(category.category_id);
      card.innerHTML = `
        <div class="relative">
          <img src="${CategoryResolver.getCategoryThumbnail(state.categories, category.category_id)}" alt="${category.category_name}" />
        </div>
        <div class="carousel-content">
          <h5 class="font-semibold text-lg">${category.category_name}</h5>
          <p class="text-sm text-stone-500">מוצרים בקטגוריה זו</p>
        </div>
      `;
      card.addEventListener("click", () => onCategoryClick(String(category.category_id)));
      categoryTrackEl.appendChild(card);
    });
  }

  /**
   * Render category dropdown
   */
  static renderCategoryDropdown(
    dropdownEl: HTMLElement | null,
    config: {
      searchInput: HTMLInputElement | null;
      listEl: HTMLElement | null;
      getSelectedId: () => string | null;
      setSelectedId: (id: string) => void;
      triggerEl: HTMLElement | null;
    },
    categories: Category[],
    onOpenCategoryModal: () => void
  ): void {
    if (!dropdownEl || !config.listEl) return;
    
    const { searchInput, listEl, getSelectedId, setSelectedId, triggerEl } = config;
    const query = searchInput?.value?.trim().toLowerCase() || "";

    const filtered = categories.filter((category) =>
      category.category_name.toLowerCase().includes(query)
    );

    listEl.innerHTML = "";
    filtered.forEach((category) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "dropdown-item";
      if (getSelectedId() === category.category_id) {
        item.classList.add("active");
      }
      item.textContent = category.category_name;
      item.addEventListener("click", () => {
        setSelectedId(String(category.category_id));
        CategoryUI.setCategoryTriggerLabel(
          triggerEl,
          category.category_name,
          String(category.category_id)
        );
        dropdownEl.classList.remove("open");
      });
      listEl.appendChild(item);
    });

    const createLink = document.createElement("button");
    createLink.type = "button";
    createLink.className = "dropdown-link";
    createLink.textContent = "אתה רוצה ליצור קטגוריה חדשה?";
    createLink.addEventListener("click", () => {
      dropdownEl.classList.remove("open");
      onOpenCategoryModal();
    });
    listEl.appendChild(createLink);
  }

  /**
   * Set category trigger label
   */
  static setCategoryTriggerLabel(
    triggerEl: HTMLElement | null,
    label: string,
    selectedId: string | null = null
  ): void {
    if (!triggerEl) return;
    triggerEl.textContent = label || "בחר קטגוריה";
    if (selectedId !== null && selectedId !== undefined) {
      triggerEl.dataset.selectedId = String(selectedId);
      console.log("[setCategoryTriggerLabel] Persisted selectedId:", selectedId, "trigger:", triggerEl);
    } else {
      console.log("[setCategoryTriggerLabel] No selectedId provided");
    }
  }

  /**
   * Ensure category dropdown options are rendered
   */
  static ensureCategoryOptions(
    state: AppState,
    modalElements: {
      modalCategoryDropdown: HTMLElement | null;
      modalCategorySearch: HTMLInputElement | null;
      modalCategoryList: HTMLElement | null;
      modalCategoryTrigger: HTMLElement | null;
      createCategoryDropdown: HTMLElement | null;
      createCategorySearch: HTMLInputElement | null;
      createCategoryList: HTMLElement | null;
      createCategoryTrigger: HTMLElement | null;
    },
    onOpenCategoryModal: () => void
  ): void {
    CategoryUI.renderCategoryDropdown(
      modalElements.modalCategoryDropdown,
      {
        searchInput: modalElements.modalCategorySearch,
        listEl: modalElements.modalCategoryList,
        getSelectedId: () => state.editingCategoryId,
        setSelectedId: (id) => {
          state.editingCategoryId = id;
        },
        triggerEl: modalElements.modalCategoryTrigger,
      },
      state.categories,
      onOpenCategoryModal
    );

    CategoryUI.renderCategoryDropdown(
      modalElements.createCategoryDropdown,
      {
        searchInput: modalElements.createCategorySearch,
        listEl: modalElements.createCategoryList,
        getSelectedId: () => state.creatingCategoryId,
        setSelectedId: (id) => {
          state.creatingCategoryId = id;
        },
        triggerEl: modalElements.createCategoryTrigger,
      },
      state.categories,
      onOpenCategoryModal
    );
  }
}
