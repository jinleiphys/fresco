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

            // Ensure form fields exist for all general parameters
            this.ensureGeneralParameterFields();

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
     * Ensure all general parameters have form fields in the General FRESCO Parameters section
     */
    ensureGeneralParameterFields: function() {
        if (!this.parameterManager) return;

        const allocation = this.parameterManager.getCurrentCategorization();

        allocation.general.forEach(param => {
            // Check if this parameter already has a form field
            const existing = document.getElementById(param.name);
            const generalSection = this.findGeneralParametersSection();

            // Get value from parsed parameters if available
            let valueToUse = param.currentValue;
            if (window.parsedFrescoParameters && window.parsedFrescoParameters[param.name]) {
                valueToUse = window.parsedFrescoParameters[param.name];
            }

            // If it doesn't exist in the General section, create it
            if (!existing || !generalSection.contains(existing)) {
                this.addParameterToGeneralSection(param.name, valueToUse);
            } else if (existing && valueToUse !== null && valueToUse !== undefined && existing.value !== valueToUse) {
                // If field exists but value needs to be updated
                existing.value = valueToUse;
                existing.dispatchEvent(new Event('change'));
                console.log(`Updated existing field ${param.name} with value from file: ${valueToUse}`);
            }
        });
    },

    /**
     * Update the parameter display UI
     */
    updateParameterDisplay: function() {
        if (!this.parameterManager) return;

        const allocation = this.parameterManager.getCurrentCategorization();

        // Filter out parameters that already have form fields in General FRESCO Parameters section
        const generalSection = this.findGeneralParametersSection();
        const existingFieldIds = new Set();

        if (generalSection) {
            const inputs = generalSection.querySelectorAll('input[id], select[id], textarea[id]');
            inputs.forEach(input => {
                if (input.id) existingFieldIds.add(input.id);
            });
        }

        // Count actual form fields in General FRESCO Parameters
        const actualGeneralCount = existingFieldIds.size;

        // For Parameter Management display, show parameters that can be moved
        // (those not already as form fields, or those that were dynamically added)
        const displayGeneral = allocation.general.filter(param => {
            // Show if it's not in the default params (these are already visible as form fields)
            return !this.parameterManager.defaultGeneralParams.includes(param.name) || param.isFromFile;
        });

        const displayAdvanced = allocation.advanced;

        // Update counts to reflect actual form fields
        const generalCount = document.getElementById('generalCount');
        const advancedCount = document.getElementById('advancedCount');
        if (generalCount) generalCount.textContent = actualGeneralCount;
        if (advancedCount) advancedCount.textContent = displayAdvanced.length;

        // Update parameter lists - only show moveable parameters
        this.updateParameterList('generalParameters', displayGeneral, 'advanced');
        this.updateParameterList('advancedParameters', displayAdvanced, 'general');
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
            // Get current value before moving
            const element = document.getElementById(paramName);
            const currentValue = element ? element.value : null;

            // Update the internal categorization
            this.parameterManager.moveParameter(paramName, toGeneral);

            if (toGeneral) {
                // Moving to General - create form field in General FRESCO Parameters section
                this.addParameterToGeneralSection(paramName, currentValue);
            } else {
                // Moving to Advanced - remove from General section if it's not a default param
                this.removeParameterFromGeneralSection(paramName);
            }

            // Update the Parameter Management display
            this.updateParameterDisplay();

            const section = toGeneral ? 'General' : 'Advanced';
            console.log(`Parameter '${paramName}' moved to ${section} section`);

        } catch (error) {
            console.error('Parameter move error:', error);
        }
    },

    /**
     * Add a parameter field to the General FRESCO Parameters section
     */
    addParameterToGeneralSection: function(paramName, currentValue) {
        // Check if it already exists
        const existing = document.getElementById(paramName);
        if (existing && this.isInGeneralSection(existing)) {
            console.log(`Parameter ${paramName} already exists in General section`);
            return;
        }

        // Get parameter config
        const paramConfig = window.FrescoNamelist ? window.FrescoNamelist.getParameter(paramName) : null;
        if (!paramConfig) {
            console.error(`Parameter config not found for ${paramName}`);
            return;
        }

        // Find the General FRESCO Parameters section
        const generalSection = this.findGeneralParametersSection();
        if (!generalSection) {
            console.error('General FRESCO Parameters section not found');
            return;
        }

        // Find the last row or create one
        let lastRow = generalSection.querySelector('.row:last-of-type');
        if (!lastRow) {
            lastRow = document.createElement('div');
            lastRow.className = 'row';
            generalSection.appendChild(lastRow);
        }

        // Check if we need a new row (current row has 3 columns)
        const currentCols = lastRow.querySelectorAll('.col-md-4, .col-md-6');
        if (currentCols.length >= 3) {
            lastRow = document.createElement('div');
            lastRow.className = 'row';
            generalSection.appendChild(lastRow);
        }

        // Create the form field
        const fieldDiv = this.createParameterField(paramName, paramConfig, currentValue);
        lastRow.appendChild(fieldDiv);

        console.log(`Added parameter ${paramName} to General FRESCO Parameters section`);
    },

    /**
     * Remove a parameter field from the General FRESCO Parameters section
     */
    removeParameterFromGeneralSection: function(paramName) {
        const element = document.getElementById(paramName);
        if (element && this.isInGeneralSection(element)) {
            const fieldDiv = element.closest('.col-md-4, .col-md-6, .mb-3');
            if (fieldDiv) {
                fieldDiv.remove();
                console.log(`Removed parameter ${paramName} from General FRESCO Parameters section`);
            }
        }
    },

    /**
     * Check if an element is in the General FRESCO Parameters section
     */
    isInGeneralSection: function(element) {
        const generalSection = this.findGeneralParametersSection();
        return generalSection && generalSection.contains(element);
    },

    /**
     * Find the General FRESCO Parameters section
     */
    findGeneralParametersSection: function() {
        const h3Elements = document.querySelectorAll('h3');
        for (const h3 of h3Elements) {
            if (h3.textContent && h3.textContent.includes('General FRESCO Parameters')) {
                return h3.parentElement;
            }
        }
        return null;
    },

    /**
     * Create a parameter field element
     */
    createParameterField: function(paramName, paramConfig, value = null) {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'col-md-4 mb-3';

        // Determine the value to use
        const fieldValue = value !== null ? value : (paramConfig.default || '');

        // Create the input element based on type
        let inputHTML = '';
        if (paramConfig.type === 'number') {
            const attrs = [
                `type="number"`,
                `class="form-control"`,
                `id="${paramName}"`,
                `name="${paramName}"`
            ];
            if (fieldValue !== '') attrs.push(`value="${fieldValue}"`);
            if (paramConfig.step) attrs.push(`step="${paramConfig.step}"`);
            if (paramConfig.min !== undefined) attrs.push(`min="${paramConfig.min}"`);
            if (paramConfig.max !== undefined) attrs.push(`max="${paramConfig.max}"`);
            inputHTML = `<input ${attrs.join(' ')}>`;
        } else if (paramConfig.type === 'select') {
            inputHTML = `<select class="form-select" id="${paramName}" name="${paramName}">`;
            if (paramConfig.options) {
                paramConfig.options.forEach(option => {
                    const selected = option.value === fieldValue ? 'selected' : '';
                    inputHTML += `<option value="${option.value}" ${selected}>${option.text || option.value}</option>`;
                });
            }
            inputHTML += '</select>';
        } else {
            // text input
            const attrs = [
                `type="text"`,
                `class="form-control"`,
                `id="${paramName}"`,
                `name="${paramName}"`
            ];
            if (fieldValue !== '') attrs.push(`value="${fieldValue}"`);
            if (paramConfig.placeholder) attrs.push(`placeholder="${paramConfig.placeholder}"`);
            inputHTML = `<input ${attrs.join(' ')}>`;
        }

        fieldDiv.innerHTML = `
            <label for="${paramName}" class="form-label">
                ${paramConfig.label}
                <span class="custom-tooltip">
                    <i class="fas fa-info-circle ms-1"></i>
                    <span class="tooltip-text">${paramConfig.tooltip}</span>
                </span>
            </label>
            ${inputHTML}
        `;

        return fieldDiv;
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
    },

    /**
     * Collect all FRESCO namelist parameters from the form
     * This works for all reaction types and collects from both General and dynamically added sections
     * @returns {Object} Object containing all parameter name-value pairs
     */
    getAllFrescoParameters: function() {
        const formData = {};

        if (!this.parameterManager) {
            console.warn('Parameter manager not initialized, collecting from DOM only');
        }

        // Get all parameters from General FRESCO Parameters section
        const generalSection = this.findGeneralParametersSection();
        if (generalSection) {
            const inputs = generalSection.querySelectorAll('input, select, textarea');
            inputs.forEach(element => {
                const id = element.id;
                const value = element.value;

                if (id && value !== '' && value !== null && value !== undefined) {
                    // Special handling for elab - preserve multi-value format
                    if (id === 'elab' && typeof value === 'string' && value.includes(' ')) {
                        formData[id] = value; // Keep as space-separated string
                    } else if (element.type === 'number') {
                        // Parse single numeric values
                        const parsed = parseFloat(value);
                        // Skip if parsed value is NaN or Infinity
                        if (!isNaN(parsed) && isFinite(parsed)) {
                            formData[id] = parsed;
                        }
                    } else if (element.type === 'checkbox') {
                        formData[id] = element.checked;
                    } else {
                        formData[id] = value;
                    }
                }
            });
        }

        // Get all parameters from Advanced sections (if any are open)
        const advancedSections = document.querySelectorAll('[id$="-section"], #namelist-forms .glass-card');
        advancedSections.forEach(section => {
            const inputs = section.querySelectorAll('input, select, textarea');
            inputs.forEach(element => {
                const id = element.id;
                const value = element.value;

                if (id && value !== '' && value !== null && value !== undefined && !formData.hasOwnProperty(id)) {
                    // Parse value based on type
                    if (element.type === 'number') {
                        const parsed = parseFloat(value);
                        // Skip if parsed value is NaN or Infinity
                        if (!isNaN(parsed) && isFinite(parsed)) {
                            formData[id] = parsed;
                        }
                    } else if (element.type === 'checkbox') {
                        formData[id] = element.checked;
                    } else if (element.type === 'select-one') {
                        const selectedValue = element.selectedOptions[0]?.value;
                        if (selectedValue === 'true') formData[id] = true;
                        else if (selectedValue === 'false') formData[id] = false;
                        else formData[id] = selectedValue;
                    } else {
                        formData[id] = value;
                    }
                }
            });
        });

        // If parameter manager is available, also get categorization info
        if (this.parameterManager) {
            const allocation = this.parameterManager.getCurrentCategorization();

            // Add any parameters from the categorization that have current values
            allocation.general.forEach(param => {
                if (param.currentValue !== null && param.currentValue !== undefined && !formData.hasOwnProperty(param.name)) {
                    let value = param.currentValue;
                    if (param.type === 'number' && typeof value === 'string') {
                        value = parseFloat(value);
                        // Skip if parsed value is NaN or Infinity
                        if (isNaN(value) || !isFinite(value)) return;
                    } else if (param.type === 'integer' && typeof value === 'string') {
                        value = parseInt(value);
                        // Skip if parsed value is NaN or Infinity
                        if (isNaN(value) || !isFinite(value)) return;
                    } else if (param.type === 'boolean') {
                        value = value === true || value === 'true' || value === 'T' || value === '1';
                    }
                    formData[param.name] = value;
                }
            });

            allocation.advanced.forEach(param => {
                if (param.currentValue !== null && param.currentValue !== undefined && !formData.hasOwnProperty(param.name)) {
                    // Only add advanced parameters if they differ from defaults
                    if (param.currentValue !== param.default) {
                        let value = param.currentValue;
                        if (param.type === 'number' && typeof value === 'string') {
                            value = parseFloat(value);
                            // Skip if parsed value is NaN or Infinity
                            if (isNaN(value) || !isFinite(value)) return;
                        } else if (param.type === 'integer' && typeof value === 'string') {
                            value = parseInt(value);
                            // Skip if parsed value is NaN or Infinity
                            if (isNaN(value) || !isFinite(value)) return;
                        } else if (param.type === 'boolean') {
                            value = value === true || value === 'true' || value === 'T' || value === '1';
                        }
                        formData[param.name] = value;
                    }
                }
            });
        }

        // Include parsed parameters from uploaded files (if any)
        if (window.parsedFrescoParameters) {
            Object.keys(window.parsedFrescoParameters).forEach(param => {
                if (!formData.hasOwnProperty(param)) {
                    let value = window.parsedFrescoParameters[param];

                    // Special handling for elab - always use parsed value if it contains multiple values
                    if (param === 'elab' && typeof value === 'string' && value.includes(' ')) {
                        formData[param] = value; // Keep multi-value format as-is
                    } else if (typeof value === 'string' && /^-?\d*\.?\d+([eE][+-]?\d+)?$/.test(value)) {
                        // Parse single numeric values
                        value = parseFloat(value);
                        // Only add if value is valid (not NaN or Infinity)
                        if (!isNaN(value) && isFinite(value)) {
                            formData[param] = value;
                        }
                    } else {
                        // Keep as-is for other cases (strings, multi-values, etc.)
                        formData[param] = value;
                    }
                }
            });
        }

        console.log('Collected FRESCO parameters:', formData);
        return formData;
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

/**
 * Global function to get all FRESCO parameters
 * This replaces the need for individual parameterManager references in each HTML file
 * @returns {Object} All FRESCO parameter name-value pairs
 */
window.getAllFrescoParameters = function() {
    return window.FrescoParameterUI.getAllFrescoParameters();
};

console.log('fresco-parameter-ui.js loaded successfully');
