/**
 * FRESCO Potential UI Module
 *
 * Provides UI generation and interaction for potential cards across all reaction types.
 * Works in conjunction with fresco-potential.js.
 *
 * Features:
 * - Dynamic potential card generation
 * - Add/remove potential functionality
 * - Coulomb potential form handling
 * - Automatic form population from parsed potentials
 * - Extraction of potential data from forms for generation
 * - Event handling for potential interactions
 */

window.FrescoPotentialUI = (function() {
    'use strict';

    // ============================================================================
    // STATE
    // ============================================================================

    let containerElement = null;
    let addButtonElement = null;
    let coulombFormElement = null;
    let potentialCardCounter = 0;
    let reactionType = 'elastic';

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

    /**
     * Initialize the potential UI system
     * @param {string} type - Reaction type
     * @param {string} containerId - ID of container for nuclear potential cards
     * @param {string} addButtonId - ID of add potential button
     * @param {string} coulombFormId - ID of Coulomb potential form (optional)
     */
    function init(type, containerId, addButtonId, coulombFormId) {
        reactionType = type;

        containerElement = document.getElementById(containerId);
        addButtonElement = document.getElementById(addButtonId);

        if (coulombFormId) {
            coulombFormElement = document.getElementById(coulombFormId);
        }

        if (!containerElement) {
            console.error(`Potential container element not found: ${containerId}`);
            return;
        }

        if (!addButtonElement) {
            console.error(`Add potential button not found: ${addButtonId}`);
            return;
        }

        // Initialize FrescoPotential
        window.FrescoPotential.init(type);

        // Set up event listeners
        setupEventListeners();

        // Load default potentials and render
        const defaults = window.FrescoPotential.loadDefaults();
        renderAllPotentials(defaults);

        console.log(`Potential UI initialized for ${type} reaction`);
    }

    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // Add potential button
        if (addButtonElement) {
            addButtonElement.addEventListener('click', handleAddPotential);
        }

        // Coulomb form changes (if applicable)
        if (coulombFormElement) {
            const inputs = coulombFormElement.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.addEventListener('change', handleCoulombChange);
            });
        }
    }

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================

    /**
     * Handle add potential button click
     */
    function handleAddPotential(e) {
        e.preventDefault();

        // Add potential to model
        const index = window.FrescoPotential.addPotential();

        // Get the newly added potential
        const potential = window.FrescoPotential.getPotential(index);

        // Render the new card
        const card = createPotentialCard(potential, index);
        containerElement.appendChild(card);

        // Renumber all cards
        renumberPotentialCards();
    }

    /**
     * Handle remove potential button click
     */
    function handleRemovePotential(e) {
        e.preventDefault();

        const card = e.target.closest('.potential-card');
        if (!card) return;

        const index = parseInt(card.dataset.potentialIndex);

        // Remove from model
        window.FrescoPotential.removePotential(index);

        // Remove from DOM
        card.remove();

        // Renumber remaining cards
        renumberPotentialCards();
    }

    /**
     * Handle Coulomb potential parameter changes
     */
    function handleCoulombChange(e) {
        if (!coulombFormElement) return;

        const updates = {
            at: parseFloat(document.getElementById('at')?.value) || 12.0,
            ap: parseFloat(document.getElementById('ap')?.value) || 4.0,
            rc: parseFloat(document.getElementById('rc')?.value) || 1.2,
            ac: parseFloat(document.getElementById('ac')?.value) || 0.0
        };

        window.FrescoPotential.updateCoulombPotential(updates);
    }

    /**
     * Handle potential type change (updates shape options)
     */
    function handleTypeChange(e) {
        const select = e.target;
        const card = select.closest('.potential-card');
        if (!card) return;

        const shapeSelect = card.querySelector('.potential-shape');
        if (!shapeSelect) return;

        const potType = parseInt(select.value);

        // Update shape options based on type
        shapeSelect.innerHTML = window.FrescoPotential.getShapeOptions(potType, 0);
    }

    /**
     * Handle potential parameter change (updates model)
     */
    function handlePotentialChange(e) {
        const card = e.target.closest('.potential-card');
        if (!card) return;

        const index = parseInt(card.dataset.potentialIndex);
        const potential = extractPotentialFromCard(card);

        window.FrescoPotential.updatePotential(index, potential);
    }

    // ============================================================================
    // RENDERING
    // ============================================================================

    /**
     * Render all potentials from the model
     * @param {Array} potentials - Array of potential objects
     */
    function renderAllPotentials(potentials) {
        // Clear container
        containerElement.innerHTML = '';
        potentialCardCounter = 0;

        // Render each nuclear potential (skip TYPE=0 Coulomb)
        potentials.forEach((pot, index) => {
            if (pot.type !== 0) {  // Skip Coulomb
                const card = createPotentialCard(pot, index);
                containerElement.appendChild(card);
            } else {
                // Update Coulomb form if present
                if (coulombFormElement) {
                    populateCoulombForm(pot);
                }
            }
        });

        // Renumber cards
        renumberPotentialCards();
    }

    /**
     * Create a potential card element
     * @param {Object} potential - Potential object
     * @param {number} index - Index in potentials array
     * @returns {HTMLElement} Potential card element
     */
    function createPotentialCard(potential, index) {
        const card = document.createElement('div');
        card.className = 'potential-card';
        card.dataset.potentialIndex = index;
        potentialCardCounter++;

        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4>Nuclear Potential <span class="potential-number">${potentialCardCounter}</span></h4>
                <a href="#" class="remove-potential"><i class="fas fa-times"></i></a>
            </div>
            <div class="row">
                <div class="col-md-4 mb-3">
                    <label class="form-label">
                        Potential Type
                        <span class="custom-tooltip">
                            <i class="fas fa-info-circle ms-1"></i>
                            <span class="tooltip-text">Type of nuclear potential. Negative TYPE adds potential numerically to previous potential.</span>
                        </span>
                    </label>
                    <select class="form-select potential-type">
                        ${window.FrescoPotential.getPotentialTypeOptions(potential.type)}
                    </select>
                </div>
                <div class="col-md-4 mb-3">
                    <label class="form-label">
                        Shape
                        <span class="custom-tooltip">
                            <i class="fas fa-info-circle ms-1"></i>
                            <span class="tooltip-text">Radial shape of the form factor. Options depend on TYPE.</span>
                        </span>
                    </label>
                    <select class="form-select potential-shape">
                        ${window.FrescoPotential.getShapeOptions(potential.type, potential.shape)}
                    </select>
                </div>
                <div class="col-md-4 mb-3">
                    <label class="form-label">
                        IT Parameter
                        <span class="custom-tooltip">
                            <i class="fas fa-info-circle ms-1"></i>
                            <span class="tooltip-text">1 or 3: include only iteratively; 2 or 3: do NOT subtract in KIND=3,4 single-particle couplings</span>
                        </span>
                    </label>
                    <select class="form-select it-field">
                        ${window.FrescoPotential.getITOptions_HTML(potential.it || 0)}
                    </select>
                </div>
            </div>
            <div class="row real-params">
                <div class="col-md-12 mb-2">
                    <h5>Real Part</h5>
                </div>
                <div class="col-md-4 mb-3">
                    <label class="form-label">
                        Depth/Strength (p1)
                        <span class="custom-tooltip">
                            <i class="fas fa-info-circle ms-1"></i>
                            <span class="tooltip-text">Depth or strength of the real part (MeV for central potentials, fm for deformations)</span>
                        </span>
                    </label>
                    <input type="number" class="form-control p1" value="${potential.p1 || 0}" step="0.1">
                </div>
                <div class="col-md-4 mb-3">
                    <label class="form-label">
                        Radius (p2)
                        <span class="custom-tooltip">
                            <i class="fas fa-info-circle ms-1"></i>
                            <span class="tooltip-text">Radius parameter in fm (multiplied by CC)</span>
                        </span>
                    </label>
                    <input type="number" class="form-control p2" value="${potential.p2 || 0}" step="0.01">
                </div>
                <div class="col-md-4 mb-3">
                    <label class="form-label">
                        Diffuseness (p3)
                        <span class="custom-tooltip">
                            <i class="fas fa-info-circle ms-1"></i>
                            <span class="tooltip-text">Diffuseness parameter in fm</span>
                        </span>
                    </label>
                    <input type="number" class="form-control p3" value="${potential.p3 || 0}" step="0.01">
                </div>
            </div>
            <div class="row imag-params">
                <div class="col-md-12 mb-2">
                    <h5>Imaginary Part</h5>
                </div>
                <div class="col-md-4 mb-3">
                    <label class="form-label">
                        Depth/Strength (p4)
                        <span class="custom-tooltip">
                            <i class="fas fa-info-circle ms-1"></i>
                            <span class="tooltip-text">Depth or strength of the imaginary part (MeV)</span>
                        </span>
                    </label>
                    <input type="number" class="form-control p4" value="${potential.p4 || 0}" step="0.1">
                </div>
                <div class="col-md-4 mb-3">
                    <label class="form-label">
                        Radius (p5)
                        <span class="custom-tooltip">
                            <i class="fas fa-info-circle ms-1"></i>
                            <span class="tooltip-text">Radius parameter for imaginary part in fm</span>
                        </span>
                    </label>
                    <input type="number" class="form-control p5" value="${potential.p5 || 0}" step="0.01">
                </div>
                <div class="col-md-4 mb-3">
                    <label class="form-label">
                        Diffuseness (p6)
                        <span class="custom-tooltip">
                            <i class="fas fa-info-circle ms-1"></i>
                            <span class="tooltip-text">Diffuseness parameter for imaginary part in fm</span>
                        </span>
                    </label>
                    <input type="number" class="form-control p6" value="${potential.p6 || 0}" step="0.01">
                </div>
            </div>
            <div class="row additional-params">
                <div class="col-md-12 mb-2">
                    <h5>Additional Parameters</h5>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">
                        P0 Parameter
                        <span class="custom-tooltip">
                            <i class="fas fa-info-circle ms-1"></i>
                            <span class="tooltip-text">Additional parameter P0 (used for L≥6 or Ji≥6 in L/J-dependent potentials)</span>
                        </span>
                    </label>
                    <input type="number" class="form-control p0" value="${potential.p0 || 0}" step="0.01">
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">
                        P7 Parameter
                        <span class="custom-tooltip">
                            <i class="fas fa-info-circle ms-1"></i>
                            <span class="tooltip-text">Further parameter P7 for specialized potential forms</span>
                        </span>
                    </label>
                    <input type="number" class="form-control p7" value="${potential.p7 || 0}" step="0.01">
                </div>
            </div>
        `;

        // Add event listeners
        const removeBtn = card.querySelector('.remove-potential');
        removeBtn.addEventListener('click', handleRemovePotential);

        const typeSelect = card.querySelector('.potential-type');
        typeSelect.addEventListener('change', handleTypeChange);
        typeSelect.addEventListener('change', handlePotentialChange);

        const allInputs = card.querySelectorAll('input, select');
        allInputs.forEach(input => {
            input.addEventListener('change', handlePotentialChange);
        });

        return card;
    }

    /**
     * Renumber potential cards after add/remove
     */
    function renumberPotentialCards() {
        const cards = containerElement.querySelectorAll('.potential-card');
        cards.forEach((card, index) => {
            const numberSpan = card.querySelector('.potential-number');
            if (numberSpan) {
                numberSpan.textContent = index + 1;
            }
            card.dataset.potentialIndex = index;
        });
        potentialCardCounter = cards.length;
    }

    /**
     * Populate Coulomb form from potential object
     * @param {Object} potential - Coulomb potential object
     */
    function populateCoulombForm(potential) {
        if (!coulombFormElement) return;

        const atInput = document.getElementById('at');
        const apInput = document.getElementById('ap');
        const rcInput = document.getElementById('rc');
        const acInput = document.getElementById('ac');

        if (atInput) atInput.value = potential.at || 12.0;
        if (apInput) apInput.value = potential.ap || 4.0;
        if (rcInput) rcInput.value = potential.rc || 1.2;
        if (acInput && potential.ac !== undefined) acInput.value = potential.ac;
    }

    // ============================================================================
    // DATA EXTRACTION
    // ============================================================================

    /**
     * Extract potential data from a card element
     * @param {HTMLElement} card - Potential card element
     * @returns {Object} Potential object
     */
    function extractPotentialFromCard(card) {
        const potential = {
            kp: 1,  // Default KP
            type: parseInt(card.querySelector('.potential-type')?.value) || 1,
            shape: parseInt(card.querySelector('.potential-shape')?.value) || 0,
            it: parseInt(card.querySelector('.it-field')?.value) || 0,
            p0: parseFloat(card.querySelector('.p0')?.value) || 0,
            p1: parseFloat(card.querySelector('.p1')?.value) || 0,
            p2: parseFloat(card.querySelector('.p2')?.value) || 0,
            p3: parseFloat(card.querySelector('.p3')?.value) || 0,
            p4: parseFloat(card.querySelector('.p4')?.value) || 0,
            p5: parseFloat(card.querySelector('.p5')?.value) || 0,
            p6: parseFloat(card.querySelector('.p6')?.value) || 0,
            p7: parseFloat(card.querySelector('.p7')?.value) || 0
        };

        return potential;
    }

    /**
     * Extract all potential data from the UI
     * @returns {Array} Array of potential objects
     */
    function extractAllPotentials() {
        const potentials = [];

        // Add Coulomb potential if form exists
        if (coulombFormElement) {
            const coulomb = {
                kp: 1,
                type: 0,
                at: parseFloat(document.getElementById('at')?.value) || 12.0,
                ap: parseFloat(document.getElementById('ap')?.value) || 4.0,
                rc: parseFloat(document.getElementById('rc')?.value) || 1.2,
                ac: parseFloat(document.getElementById('ac')?.value) || 0.0
            };
            potentials.push(coulomb);
        }

        // Add nuclear potentials
        const cards = containerElement.querySelectorAll('.potential-card');
        cards.forEach(card => {
            const potential = extractPotentialFromCard(card);
            potentials.push(potential);
        });

        return potentials;
    }

    /**
     * Sync UI state to model (useful before generation)
     */
    function syncToModel() {
        // Clear model
        window.FrescoPotential.clearPotentials();

        // Extract all potentials from UI
        const potentials = extractAllPotentials();

        // Add to model
        potentials.forEach(pot => {
            window.FrescoPotential.addPotential(pot);
        });
    }

    // ============================================================================
    // FILE UPLOAD INTEGRATION
    // ============================================================================

    /**
     * Load potentials from parsed input file
     * @param {string} fileContent - Content of uploaded FRESCO input file
     */
    function loadFromFile(fileContent) {
        // Parse potentials using core module
        const parsed = window.FrescoPotential.parsePotentials(fileContent);

        if (parsed.length === 0) {
            console.warn('No potentials found in uploaded file');
            return;
        }

        // Render all parsed potentials
        renderAllPotentials(parsed);

        console.log(`Loaded ${parsed.length} potentials from file`);
    }

    /**
     * Reset to default potentials for current reaction type
     */
    function resetToDefaults() {
        const defaults = window.FrescoPotential.loadDefaults();
        renderAllPotentials(defaults);
    }

    // ============================================================================
    // GENERATION HELPER
    // ============================================================================

    /**
     * Generate &POT section for output
     * @returns {string} Formatted &POT namelists
     */
    function generatePotentialSection() {
        // Sync UI to model first
        syncToModel();

        // Generate using core module
        return window.FrescoPotential.generatePotentialSection();
    }

    // ============================================================================
    // PUBLIC API
    // ============================================================================

    return {
        // Initialization
        init,

        // Rendering
        renderAllPotentials,
        renumberPotentialCards,

        // Data extraction
        extractAllPotentials,
        extractPotentialFromCard,
        syncToModel,

        // File integration
        loadFromFile,
        resetToDefaults,

        // Generation
        generatePotentialSection
    };
})();
