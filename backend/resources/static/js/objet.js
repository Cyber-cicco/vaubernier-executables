/**
 * @typedef {Object} ObjetItem
 * @property {string} libelle - The name or description of the item
 * @property {number} quantite - The quantity of the item
 */
var listenToObjet = () => {
    Alpine.data('objetForm', ($dispatch, objets) => ({

        /** @type {ObjetItem[]} objets - Les objets du formulaire */
        objets: [] = objets ? objets.map((o) => {
            console.log(o)
            return {
                libelle : o.Libelle + " " + o.Modele,
                quantite : o.Quantite
            }
        }) : [],

        /** @type {NodeListOf<Element>} */
        objetContainers: null,

        init() {
            console.log(this.objets)
            Alpine.nextTick(() => {
                if (this.objets.length === 0) {
                    this.initObjetsList()
                }
            })
        },

        /**
         * Initializes the list of objects in the order
         * @returns {void}
         */
        initObjetsList() {
            if (this.objets.length == 0) {
                this.addObjet();
            }

            $dispatch('objet-update', this.objets)
            Alpine.nextTick(() => {
                htmx.process(document.querySelector('body'));
            })
        },


        /**
         * Adds a new empty object to the order
         * @returns {void}
         */
        addObjet() {
            this.objets.push({
                libelle: '',
                quantite: 1
            });
            Alpine.nextTick(() => {
                const obj = document.querySelector(`#objet-${this.objets.length - 1}`)
                obj && obj.focus()
                this.initObjetsList()
            })
        },

        /**
         * Removes an object at the specified index
         * @param {number} [index=0] - Index of the object to remove
         * @returns {void}
         */
        removeObjet(index) {
            if (!index) {
                index = 0;
            }
            this.formData.objets.splice(index, 1);
            $dispatch('objet-update', this.objets)
            Alpine.nextTick(() => {
                document.querySelector(`#objet-${this.objets.length - 1}`).focus()
                this.initObjetsList()
            })

        },

        /**
        * Focuses the next quantity input when pressing enter on the objet
        * input
        * @param {Event} event 
        * @returns {void}
        */
        focusNextQuantity(event) {
            event.preventDefault();
            const currentContainer = event.target.closest('[data-objet-container]');
            const quantityInput = currentContainer.querySelector('[data-quantity]');
            if (quantityInput) {
                quantityInput.focus();
            }
        },

        /**
        * Focuses the next objet input when pressing enter on the quantity
        * input. If no other objet input is present, focuses the button to
        * add another object
        * @param {Event} event 
        * @returns {void}
        */
        focusNextObjet(event) {
            event.preventDefault();
            const currentContainer = event.target.closest('[data-objet-container]');
            const nextContainer = currentContainer.nextElementSibling;

            if (nextContainer) {
                const nextObjetInput = nextContainer.querySelector('[data-objet]');
                if (nextObjetInput) {
                    nextObjetInput.focus();
                }
            } else {
                document.querySelector("[data-objet-button]").focus()
            }
        },

    }))
}

document.addEventListener('alpine:init', listenToObjet);
htmx.onLoad(listenToObjet);
