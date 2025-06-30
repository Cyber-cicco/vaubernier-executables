/**
 * @typedef {Object} ObjetItem
 * @property {string} libelle - The name or description of the item
 * @property {number} quantite - The quantity of the item
 */

/**
 * @typedef {Object} DatasForForm
 * @property {number} points - Points envoyés dans la commande
 * @property {number} montant - Montant total de la commande
 * @property {number} fraisPort - Montant des frais de port de la commande
 * @property {number} poids - Poids de la commande
 * @property {string} conditionnement - Informations sur le conditionnement du colis
 * @property {string} commentaires - Commentaires additionnels
 * @property {ObjetItem[]} objets - Objets envoyés dans la commande
 */

/**
 * @typedef {Object} CommandDetails
 * @property {number} pointsRequis - Points minimum requis pour la commande
 * @property {number} pointsDispo - Points disponibles pour le client
 * @property {number} poidsCommande - Poids de la commande
 * @property {number} fraisPort - Frais  de port
 * @property {string} montantCheque - Montant du cheque envoyé avec la commande
 * @property {string} montantDemande - Montant que le client doit payer
 * @property {string} differencePrix - Différence entre le prix de la commande et le chèque reçu. Chaine de caractère à afficher
 * @property {number} differencePrixRaw - Différence entre le prix de la commande et le chèque reçu. Nombre servant pour la comparaison
 * @property {number} differencePoints - Différence entre le nombre de points requis de la commande et les points disponibles
 */

/**
 * @typedef {Object} Display
 * @property {boolean} fraisPort - montre l'input des frais de port si vrai. Sinon montre juste les détails
 * @property {boolean} poids - montre l'input du montant ou ses détails
 */

/**
 * @typedef {Object} InputWithNext
 * @property {HTMLElement} input - The input element
 * @property {() => void} next - Ce qui arrive lorsque l'on presse enter sur le champ
 */

/**
 * Sets up the Alpine.js data for the order form
 * @returns {void}
 */
var listenToCommande = () => {
    Alpine.data('orderForm', (params = {}) => ({
        /** @type {DatasForForm} */
        formData: {
            points: 0,
            montant: 0,
            conditionnement: '',
            commentaires: '',
            objets: [],
            fraisPort: 0,
            poids: 0,
            clientId: params.clientId,
        },

        /** @type {CommandDetails} */
        cmdDetails: {
            pointsRequis: 0,
            pointsRecus: 0,
            pointsDispo: 0,
            poidsCommande: "0 g",
            fraisPort: "0.00 €",
            montantCheque: "0.00 €",
            montantDemande: "0.00 €",
            differencePrix: "0.00 €",
            differencePrixRaw: 0,
            differencePoints: 0,
        },

        /** @type {Display} */
        display: {
            fraisPort: false,
            poids: false,
        },

        /** @type {HTMLElement} */
        conditInput: null,

        /** @type {HTMLElement} */
        addObjetBtn: null,

        /** @type {HTMLElement} */
        validationBtn: null,

        /** @type {HTMLElement} */
        container: null,

        /** @type {InputWithNext[]} */
        inputs: [],

        /** @type {number} */
        indexOfBtn: 1,

        /**
         * Initialize data from existing values
         * @returns {void}
         */
        init() {
            document.addEventListener('objet-update', (e) => {
                console.log("update received")
                this.formData.objets = e.detail
                this.sendData();
            })
            const container = document.querySelector("#clientRight");
            // Get initial points value
            const pointsInput = container.querySelector('#points');
            if (pointsInput) this.formData.points = parseInt(pointsInput.value) || undefined;

            // Get initial montant value
            const montantInput = container.querySelector('#montant');
            if (montantInput) this.formData.montant = parseFloat(montantInput.value) || undefined;

            // Get initial conditionnement value
            this.conditInput = container.querySelector('#conditionnement');
            if (this.conditInput) this.formData.conditionnement = this.conditInput.value || undefined;
            this.addObjetBtn = container.querySelector("#addObjet");

            this.validationBtn = container.querySelector("#valider");
            this.container = container;
            this.fraisPort = this.$refs.fraisPortInput
            this.poids = this.$refs.poidsInput
            this.inputs = [
                {
                    input: pointsInput,
                    next: () => montantInput.focus(),
                },
                {
                    input: this.conditInput,
                    next: () => this.showFraisPort()
                },
                {
                    input: this.fraisPort,
                    next: () => {
                        this.setFraisPort();
                        this.showPoids();
                    }
                },
                {
                    input: this.poids,
                    next: () => {
                        this.setPoids()
                        this.validationBtn.focus()
                    }
                }
            ];
            this.indexOfBtn = 1;

            this.initKeyBindings(this.inputs);
        },

        /**
         * Sets up keyboard event listeners for form navigation
         * @param {InputWithNext[]} inputs - Array of input objects with references to next focus element
         * @returns {void}
         */
        initKeyBindings(inputs) {
            for (let v of inputs) {
                /**
                 * Handle keydown events to navigate between inputs
                 * @param {KeyboardEvent} e - The keyboard event
                 */
                const keyDownFunc = (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        v.next();
                    }
                };

                v.input.addEventListener("focus", () => {
                    document.addEventListener("keydown", keyDownFunc);
                });
                v.input.addEventListener("blur", () => {
                    document.removeEventListener("keydown", keyDownFunc);
                });
            }
        },

        showFraisPort() {
            this.display.fraisPort = true
            Alpine.nextTick(() => {
                this.$refs.fraisPortInput.focus()
            })
        },

        showPoids() {
            this.display.poids = true
            Alpine.nextTick(() => {
                this.$refs.poidsInput.focus()
            })
        },

        setFraisPort() {
            if (typeof this.formData.fraisPort === "string") {
                this.formData.fraisPort = parseFloat(this.formData.fraisPort)
            }
            this.cmdDetails.fraisPort = `${this.formData.fraisPort.toFixed(2)} €`
            this.display.fraisPort = false
        },

        setPoids() {
            console.log(this.formData.poids)
            if (typeof this.formData.poids === "string") {
                this.formData.poids = parseInt(this.formData.poids)
            }
            this.cmdDetails.poids = ` ${this.formData.poids} g`
            this.display.poids = false
        },


        /**
         * Sends the form data to the server to get order details
         * @returns {void}
         */
        sendData() {

            // C'est très moche mais pour une raison inconnue Alpine ne comprend
            // pas qu'un nombre à virgule peut être interprété comme autre chose
            // qu'une chaine de caractère
            this.formData.fraisPort = parseFloat(this.formData.fraisPort)
            fetch("/api/v1/commandes/details", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(this.formData),
            })
                .then((res) => res.json())
                .then((json) => {
                    console.log(json);
                    this.cmdDetails.pointsRequis = json.PointsNecessaires;
                    this.cmdDetails.pointsDispo = json.PointsDispo;
                    this.cmdDetails.poidsCommande = `${json.Poids} g`;
                    this.formData.poids = json.Poids;
                    this.cmdDetails.fraisPort = `${json.FraisPort.toFixed(2)} €`;
                    this.formData.fraisPort = json.FraisPort.toFixed(2);
                    this.cmdDetails.montantCheque = `${json.Cheque.toFixed(2)} €`;
                    this.cmdDetails.montantDemande = `${json.Montant.toFixed(2)} €`;
                    this.cmdDetails.differencePrix = `${json.DifferencePrix.toFixed(2)} €`;
                    this.cmdDetails.differencePrixRaw = json.DifferencePrix;
                    this.cmdDetails.differencePoints = json.DifferencePoints;
                    if (json.Conditionnement?.Libelle) {
                        this.formData.conditionnement = json.Conditionnement.Libelle
                    }
                })
                .catch((error) => {
                    console.error("Error fetching command details:", error);
                });
        },

        submit() {
            this.formData.fraisPort = parseFloat(this.formData.fraisPort)
            this.formData.conditionnement
            htmxx.post("/commandes", this.formData, {
                target: "#main",
                swap: "innerHTML",
                pushUrl: true,
            })
        },

        /**
         * Gets all form data for submission
         * @returns {DatasForForm} The complete form data
         */
        getFormData() {
            return this.formData;
        },
    }));
};

document.addEventListener('alpine:init', listenToCommande);
htmx.onLoad(listenToCommande);
