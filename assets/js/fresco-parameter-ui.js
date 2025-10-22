/**
 * FRESCO Parameter UI Manager
 * Shared UI functions for parameter management across all reaction types
 * Handles the display and interaction of General/Advanced parameter sections
 */

window.FrescoParameterUI = {
    parameterManager: null,

    /**
     * Initialize the parameter UI with custom default general parameters
     * @param {Array<string>} defaultGeneralParams - Array of parameter names to show in General section by default
     */
    init: function(defaultGeneralParams = null) {
        console.log('Initializing FRESCO Parameter UI');

        // Set custom default general parameters if provided
        if (defaultGeneralParams && Array.isArray(defaultGeneralParams)) {
            window.FrescoParameterManager.defaultGeneralParams = defaultGeneralParams;
            console.log('Custom default general parameters:', defaultGeneralParams);
        }

        // Initialize the parameter manager
        if (typeof window.FrescoParameterManager !== 'undefined') {
            this.parameterManager = window.FrescoParameterManager;
            this.parameterManager.init();
            this.updateParameterDisplay();
            console.log('Parameter manager initialized');
        } else {
            console.error('FrescoParameterManager not available');
        }

        // Initialize basic form fields
        if (window.FrescoNamelist && window.FrescoNamelist.initializeBasicFields) {
            window.FrescoNamelist.initializeBasicFields();
        }
    },

    /**
     * Update the parameter display UI
     */
    updateParameterDisplay: function() {
        if (!this.parameterManager) return;

        const allocation = this.parameterManager.getCurrentCategorization();

        // Update counts
        const generalCount = document.getElementById('generalCount');
        const advancedCount = document.getElementById('advancedCount');
        if (generalCount) generalCount.textContent = allocation.general.length;
        if (advancedCount) advancedCount.textContent = allocation.advanced.length;

        // Update parameter lists
        this.updateParameterList('generalParameters', allocation.general, 'advanced');
        this.updateParameterList('advancedParameters', allocation.advanced, 'general');
    },

    /**
     * Update a parameter list container
     * @param {string} containerId - ID of the container element
     * @param {Array} parameters - Array of parameter objects
     * @param {string} moveToSection - Section to move parameters to ('general' or 'advanced')
     */
    updateParameterList: function(containerId, parameters, moveToSection) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        parameters.forEach(param => {
            const item = document.createElement('div');
            item.className = `parameter-item d-flex justify-content-between align-items-center p-2 mb-2 rounded ${param.isFromFile ? 'border-start border-success border-3' : ''}`;
            item.style.backgroundColor = param.isFromFile ? '#f8fff8' : '#f8f9fa';

            const leftDiv = document.createElement('div');
            leftDiv.className = 'd-flex align-items-center';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'fw-bold';
            nameSpan.textContent = param.label || param.name;
            nameSpan.style.color = '#333';

            const valueSpan = document.createElement('span');
            valueSpan.className = 'ms-2 text-muted small';
            if (param.currentValue !== null && param.currentValue !== undefined) {
                valueSpan.textContent = `= ${param.currentValue}`;
            }

            leftDiv.appendChild(nameSpan);
            leftDiv.appendChild(valueSpan);

            const moveBtn = document.createElement('button');
            moveBtn.className = 'btn btn-sm btn-outline-primary';
            moveBtn.innerHTML = moveToSection === 'general' ? '<i class="fas fa-arrow-left"></i>' : '<i class="fas fa-arrow-right"></i>';
            moveBtn.title = `Move to ${moveToSection} section`;
            moveBtn.onclick = () => this.moveParameter(param.name, moveToSection === 'general');

            item.appendChild(leftDiv);
            item.appendChild(moveBtn);
            container.appendChild(item);
        });
    },

    /**
     * Move a parameter between General and Advanced sections
     * @param {string} paramName - Name of the parameter to move
     * @param {boolean} toGeneral - true to move to General, false to move to Advanced
     */
    moveParameter: function(paramName, toGeneral) {
        if (!this.parameterManager) return;

        try {
            this.parameterManager.moveParameter(paramName, toGeneral);
            this.updateParameterDisplay();

            const section = toGeneral ? 'General' : 'Advanced';
            console.log(`Parameter '${paramName}' moved to ${section} section`);

        } catch (error) {
            console.error('Parameter move error:', error);
        }
    },

    /**
     * Reset parameters to default allocation
     */
    resetParametersToDefaults: function() {
        if (!this.parameterManager) return;

        if (confirm('Reset all parameters to default allocation?')) {
            this.parameterManager.resetToDefaults();
            this.updateParameterDisplay();
            console.log('Parameters reset to default allocation');
        }
    },

    /**
     * Show current parameter state in console and alert
     */
    showParameterState: function() {
        if (!this.parameterManager) return;

        const allocation = this.parameterManager.getCurrentCategorization();
        console.log('Current Parameter State:', allocation);
        alert(`Current State:\n\nGeneral: ${allocation.general.length} parameters\nAdvanced: ${allocation.advanced.length} parameters\n\nSee console for detailed information.`);
    }
};

// Make functions globally available for onclick handlers in HTML
window.updateParameterDisplay = function() {
    window.FrescoParameterUI.updateParameterDisplay();
};

window.moveParameter = function(paramName, toGeneral) {
    window.FrescoParameterUI.moveParameter(paramName, toGeneral);
};

window.resetParametersToDefaults = function() {
    window.FrescoParameterUI.resetParametersToDefaults();
};

window.showParameterState = function() {
    window.FrescoParameterUI.showParameterState();
};

console.log('fresco-parameter-ui.js loaded successfully');
