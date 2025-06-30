// Register the autocomplete component
var autocomplete = () => {
    Alpine.data('autocomplete', (params = {}) => ({
        // Component state
        currentIndex: -1,
        isVisible: false,
        onEnter: params.onEnter,

        // Initialize component
        init() {
            // Handle click outside
            this.$nextTick(() => {
                document.addEventListener('click', (e) => {
                    if (!this.$el.contains(e.target) && this.isVisible) {
                        this.hideList();
                    }
                });

                // Handle HTMX swaps
                document.body.addEventListener('htmx:afterSwap', (e) => {
                    // Check if the swap is related to this autocomplete
                    if (this.$el.contains(e.detail.target)) {
                        this.resetSelection();

                        // If results were populated, show the list
                        const resultsList = this.$refs.resultsList;
                        if (resultsList && resultsList.children.length > 0) {
                            this.showList();
                        }
                    }
                });
            });
        },

        click(id) {
            const resultsList = this.$refs.resultsList;
            const listItems = resultsList ? Array.from(resultsList.children) : [];

            this.selectItem(listItems[id])
            this.$refs.searchInput.focus()
        },

        // Handle keyboard input
        onKeyDown(e) {
            console.log("on key down function")

            const resultsList = this.$refs.resultsList;
            const listItems = resultsList ? Array.from(resultsList.children) : [];

            // If no items, do nothing
            if (listItems.length === 0) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateList(1, listItems);
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateList(-1, listItems);
                    break;

                case 'Enter':
                    console.log(this.enterDefault)
                    if (this.currentIndex >= 0 && this.currentIndex < listItems.length) {
                        this.selectItem(listItems[this.currentIndex]);
                    }
                    break;

                case 'Escape':
                    e.preventDefault();
                    this.hideList();
                    break;
            }
        },

        // Handle input event
        onInput() {
            this.resetSelection();
            this.showList();
        },

        // Navigate through list items
        navigateList(direction, items) {
            // Clear current selection
            items.forEach(item => item.classList.remove('bg-gray-100'));

            // Update index with bounds checking
            this.currentIndex += direction;
            if (this.currentIndex < 0) this.currentIndex = items.length - 1;
            if (this.currentIndex >= items.length) this.currentIndex = 0;

            // Apply selection styling
            const selectedItem = items[this.currentIndex];
            selectedItem.classList.add('bg-gray-100');

            // Ensure selected item is visible
            selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        },

        // Select an item
        selectItem(item) {

            console.log("selection item")
            this.$refs.searchInput.value = item.textContent.trim();

            // Update any bound model
            if (this.$refs.searchInput._x_model) {
                this.$refs.searchInput._x_model.set(item.textContent.trim());
            }
            if (this.onEnter) {
                this.onEnter();
                this.isVisible = false;
                return;
            } 
            item.click();
            this.hideList();
        },

        // Show results list
        showList() {
            this.isVisible = true;
            if (this.$refs.resultsList) {
                this.$refs.resultsList.style.display = '';
            }
        },

        // Hide results list
        hideList() {
            this.isVisible = false;
            if (this.$refs.resultsList) {
                this.$refs.resultsList.style.display = 'none';
            }
            this.resetSelection();
        },

        // Reset selection state
        resetSelection() {
            this.currentIndex = -1;

            // Clear highlighting from all items
            if (this.$refs.resultsList) {
                const items = Array.from(this.$refs.resultsList.children);
                items.forEach(item => item.classList.remove('bg-gray-100'));
            }
        }
    }));
}

document.addEventListener('alpine:init', autocomplete);
htmx.onLoad(autocomplete);
