/**
 * FRESCO Parameter Manager
 * Handles dynamic parameter categorization between General and Advanced sections
 */

window.FrescoParameterManager = {
    // Default General parameters (always shown in General section)
    defaultGeneralParams: [
        'hcm', 'rmatch', 'jtmax', 'absend', 'thmin', 'thmax', 'thinc', 
        'elab', 'iter', 'chans', 'smats', 'xstabl'
    ],
    
    // Current parameter categorization state
    currentCategorization: {
        general: [],
        advanced: []
    },
    
    // Parameters found in uploaded input file
    inputFileParameters: new Set(),
    
    /**
     * Initialize the parameter manager with default categorization
     */
    init: function() {
        console.log('Initializing FRESCO Parameter Manager');
        this.resetToDefaultCategorization();
    },
    
    /**
     * Reset to default categorization (no input file loaded)
     */
    resetToDefaultCategorization: function() {
        console.log('Resetting to default parameter categorization');
        this.inputFileParameters.clear();

        // Get all parameters from FrescoNamelist
        const allParams = window.FrescoNamelist ? window.FrescoNamelist.getAllParameters() : {};
        const allParamNames = Object.keys(allParams);

        // Set default General parameters (only those that exist in FrescoNamelist)
        this.currentCategorization.general = this.defaultGeneralParams.filter(
            param => allParamNames.includes(param)
        );

        // Set Advanced parameters (all others)
        this.currentCategorization.advanced = allParamNames.filter(
            param => !this.defaultGeneralParams.includes(param)
        );

        // Check for parameters in defaultGeneralParams that don't exist in FrescoNamelist
        const missingParams = this.defaultGeneralParams.filter(
            param => !allParamNames.includes(param)
        );
        if (missingParams.length > 0) {
            console.warn('Parameters in defaultGeneralParams not found in FrescoNamelist:', missingParams);
        }

        console.log('Default categorization:', this.currentCategorization);
        console.log(`General: ${this.currentCategorization.general.length}, Advanced: ${this.currentCategorization.advanced.length}, Total: ${allParamNames.length}`);
    },
    
    /**
     * Update parameter categorization based on input file parameters
     */
    updateCategorizationFromInputFile: function(inputFileParams) {
        console.log('Updating categorization from input file parameters:', inputFileParams);
        
        // Store input file parameters
        this.inputFileParameters = new Set(inputFileParams);
        
        // Get all parameters from FrescoNamelist
        const allParams = window.FrescoNamelist ? window.FrescoNamelist.getAllParameters() : {};
        const allParamNames = Object.keys(allParams);
        
        // Start with default General parameters
        const newGeneral = [...this.defaultGeneralParams];
        
        // Move parameters from Advanced to General if they appear in input file
        const parametersToMoveToGeneral = inputFileParams.filter(param => 
            !this.defaultGeneralParams.includes(param) && 
            allParamNames.includes(param)
        );
        
        // Add input file parameters to General section
        newGeneral.push(...parametersToMoveToGeneral);
        
        // Remove duplicates
        this.currentCategorization.general = [...new Set(newGeneral)];
        
        // Set Advanced parameters (all others not in General)
        this.currentCategorization.advanced = allParamNames.filter(
            param => !this.currentCategorization.general.includes(param)
        );
        
        console.log('Updated categorization:', this.currentCategorization);
        
        // Update UI to reflect new categorization
        this.updateUI();
    },
    
    /**
     * Get current parameter categorization with full parameter metadata
     */
    getCurrentCategorization: function() {
        const getParameterObjects = (paramNames) => {
            return paramNames.map(paramName => {
                const paramConfig = window.FrescoNamelist ?
                    window.FrescoNamelist.getParameter(paramName) : null;

                const element = document.getElementById(paramName);
                const currentValue = element ? element.value : null;

                return {
                    name: paramName,
                    label: paramConfig ? paramConfig.label : paramName,
                    tooltip: paramConfig ? paramConfig.tooltip : '',
                    type: paramConfig ? paramConfig.type : 'text',
                    default: paramConfig ? paramConfig.default : null,
                    currentValue: currentValue,
                    isFromFile: this.inputFileParameters.has(paramName)
                };
            });
        };

        return {
            general: getParameterObjects(this.currentCategorization.general),
            advanced: getParameterObjects(this.currentCategorization.advanced)
        };
    },
    
    /**
     * Check if a parameter is currently in the General section
     */
    isInGeneralSection: function(paramName) {
        return this.currentCategorization.general.includes(paramName);
    },
    
    /**
     * Check if a parameter is currently in the Advanced section
     */
    isInAdvancedSection: function(paramName) {
        return this.currentCategorization.advanced.includes(paramName);
    },
    
    /**
     * Update UI to reflect current parameter categorization
     */
    updateUI: function() {
        console.log('Updating UI to reflect parameter categorization');
        
        // Only update UI if we're in a browser environment
        if (typeof document !== 'undefined' && document.querySelector) {
            // Update General Parameters section
            this.updateGeneralParametersSection();
            
            // Update Advanced Parameters section
            this.updateAdvancedParametersSection();
            
            // Update any visual indicators
            this.updateVisualIndicators();
        } else {
            console.log('DOM not available, skipping UI updates');
        }
    },
    
    /**
     * Update the General Parameters section
     */
    updateGeneralParametersSection: function() {
        // Find the General FRESCO Parameters section
        let targetSection = null;
        
        // Search for h3 elements containing "General FRESCO Parameters"
        const h3Elements = document.querySelectorAll('h3');
        for (const h3 of h3Elements) {
            if (h3.textContent && h3.textContent.includes('General FRESCO Parameters')) {
                targetSection = h3.parentElement;
                break;
            }
        }
        
        if (!targetSection) {
            console.log('General FRESCO Parameters section not found');
            return;
        }
        
        // Find the last row in the General parameters section
        const rows = targetSection.querySelectorAll('.row');
        let lastRow = rows[rows.length - 1];
        
        if (!lastRow) {
            console.log('No rows found in General section');
            return;
        }
        
        // Get current General parameters
        const generalParams = this.currentCategorization.general;
        
        // Add any new parameters that should be in General section
        generalParams.forEach(paramName => {
            if (this.defaultGeneralParams.includes(paramName)) {
                // Skip default parameters (already in HTML)
                return;
            }
            
            // Check if parameter already exists in General section
            if (document.getElementById(paramName)) {
                return;
            }
            
            // Get parameter configuration
            const paramConfig = window.FrescoNamelist ? window.FrescoNamelist.getParameter(paramName) : null;
            if (!paramConfig) return;
            
            // Check if we need a new row (if current row has 3 columns already)
            const currentRowCols = lastRow.querySelectorAll('.col-md-4');
            if (currentRowCols.length >= 3) {
                // Create new row
                const newRow = document.createElement('div');
                newRow.className = 'row';
                targetSection.appendChild(newRow);
                lastRow = newRow;
            }
            
            // Get the value from pending values if available
            const existingValue = this.pendingParameterValues ? this.pendingParameterValues[paramName] : null;
            
            // Create new parameter field (these are moved from Advanced, so no defaults unless we have a value)
            const fieldDiv = this.createParameterField(paramName, paramConfig, existingValue, false);
            lastRow.appendChild(fieldDiv);
            
            console.log(`Added parameter ${paramName} to General section with value: ${existingValue || 'none'}`);
        });
    },
    
    /**
     * Update the Advanced Parameters section
     */
    updateAdvancedParametersSection: function() {
        // Clear and rebuild advanced parameter sections
        const namelistFormsContainer = document.getElementById('namelist-forms');
        if (!namelistFormsContainer) return;
        
        // Clear existing advanced parameter forms
        namelistFormsContainer.innerHTML = '';
        
        // Group advanced parameters by category (only those still in Advanced section)
        const paramsByCategory = this.groupParametersByCategory(this.currentCategorization.advanced);
        
        // Create category forms for categories that have parameters
        Object.keys(paramsByCategory).forEach(categoryName => {
            const parameters = paramsByCategory[categoryName];
            if (parameters.length > 0) {
                this.createAdvancedCategorySection(categoryName, parameters, namelistFormsContainer);
            }
        });
        
        // Also update the category toggle buttons to reflect changes
        this.updateCategoryToggleButtons();
        
        // Remove any existing parameter fields that have been moved to General
        this.removeMovedParametersFromAdvanced();
    },
    
    /**
     * Group parameters by their categories
     */
    groupParametersByCategory: function(paramNames) {
        const paramsByCategory = {};
        
        if (!window.FrescoNamelist) return paramsByCategory;
        
        // Initialize all categories
        Object.keys(window.FrescoNamelist.categories).forEach(categoryName => {
            paramsByCategory[categoryName] = [];
        });
        
        // Group parameters by category
        paramNames.forEach(paramName => {
            const category = this.findParameterCategory(paramName);
            if (category && paramsByCategory[category]) {
                paramsByCategory[category].push(paramName);
            }
        });
        
        return paramsByCategory;
    },
    
    /**
     * Find which category a parameter belongs to
     */
    findParameterCategory: function(paramName) {
        if (!window.FrescoNamelist) return null;
        
        for (const [categoryName, categoryConfig] of Object.entries(window.FrescoNamelist.categories)) {
            if (categoryConfig.parameters[paramName]) {
                return categoryName;
            }
        }
        return null;
    },
    
    /**
     * Remove parameters that have been moved to General section from Advanced sections
     */
    removeMovedParametersFromAdvanced: function() {
        // Get parameters that are now in General but were originally in Advanced
        const movedParams = this.currentCategorization.general.filter(param => 
            !this.defaultGeneralParams.includes(param)
        );
        
        movedParams.forEach(paramName => {
            // Look for any existing elements with this parameter name in Advanced sections
            const existingElements = document.querySelectorAll(`#${paramName}`);
            existingElements.forEach(element => {
                // Check if this element is in an Advanced section
                const isInAdvanced = element.closest('.advanced-fresco-card') || 
                                   element.closest('#namelist-forms');
                
                if (isInAdvanced) {
                    // Remove the parent field div
                    const fieldDiv = element.closest('.col-md-4');
                    if (fieldDiv) {
                        fieldDiv.remove();
                        console.log(`Removed duplicate parameter ${paramName} from Advanced section`);
                    }
                }
            });
        });
    },

    /**
     * Update category toggle buttons to show parameter counts
     */
    updateCategoryToggleButtons: function() {
        const paramsByCategory = this.groupParametersByCategory(this.currentCategorization.advanced);
        
        Object.keys(paramsByCategory).forEach(categoryName => {
            const parameters = paramsByCategory[categoryName];
            const toggleButton = document.querySelector(`button[onclick*="toggleNamelistSection('${categoryName}')"]`);
            
            if (toggleButton) {
                const paramCount = parameters.length;
                const buttonText = toggleButton.innerHTML;
                
                // Remove existing count if present
                const cleanText = buttonText.replace(/\(\d+\)/, '').trim();
                
                // Add new count
                if (paramCount > 0) {
                    toggleButton.innerHTML = `${cleanText} (${paramCount})`;
                } else {
                    toggleButton.innerHTML = cleanText;
                    toggleButton.style.opacity = '0.5'; // Dim empty categories
                }
            }
        });
    },

    /**
     * Create a parameter field element
     */
    createParameterField: function(paramName, paramConfig, existingValue = null, isAdvanced = false) {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'col-md-4 mb-3';
        
        // For Advanced parameters, don't use default values unless explicitly provided
        let value = '';
        if (existingValue !== null) {
            value = existingValue;
        } else if (!isAdvanced && paramConfig.default !== null && paramConfig.default !== undefined) {
            // Only use defaults for General parameters
            value = paramConfig.default;
        }
        
        let inputElement = '';
        
        if (paramConfig.type === 'select') {
            inputElement = `<select class="form-select" id="${paramName}" name="${paramName}">`;
            
            // Add empty option for Advanced parameters
            if (isAdvanced && value === '') {
                inputElement += `<option value="" selected>-- Select --</option>`;
            }
            
            for (const option of paramConfig.options) {
                const selected = option.value === value ? 'selected' : '';
                inputElement += `<option value="${option.value}" ${selected}>${option.text}</option>`;
            }
            inputElement += '</select>';
        } else if (paramConfig.type === 'number') {
            const attrs = [
                `type="number"`,
                `id="${paramName}"`,
                `name="${paramName}"`,
                `class="form-control"`
            ];
            
            // Only set value if it's not empty
            if (value !== null && value !== undefined && value !== '') {
                attrs.push(`value="${value}"`);
            }
            
            if (paramConfig.step) attrs.push(`step="${paramConfig.step}"`);
            if (paramConfig.min !== undefined) attrs.push(`min="${paramConfig.min}"`);
            if (paramConfig.max !== undefined) attrs.push(`max="${paramConfig.max}"`);
            if (paramConfig.required) attrs.push('required');
            
            inputElement = `<input ${attrs.join(' ')}>`;
        } else {
            // text input
            const attrs = [
                `type="text"`,
                `id="${paramName}"`,
                `name="${paramName}"`,
                `class="form-control"`
            ];
            
            // Only set value if it's not empty
            if (value !== null && value !== undefined && value !== '') {
                attrs.push(`value="${value}"`);
            }
            
            if (paramConfig.placeholder) attrs.push(`placeholder="${paramConfig.placeholder}"`);
            if (paramConfig.required) attrs.push('required');
            
            inputElement = `<input ${attrs.join(' ')}>`;
        }
        
        fieldDiv.innerHTML = `
            <label for="${paramName}" class="form-label">
                ${paramConfig.label}
                <span class="custom-tooltip">
                    <i class="fas fa-info-circle ms-1"></i>
                    <span class="tooltip-text">${paramConfig.tooltip}</span>
                </span>
                ${this.inputFileParameters.has(paramName) ? '<span class="badge bg-primary ms-1">From File</span>' : ''}
            </label>
            ${inputElement}
        `;
        
        return fieldDiv;
    },
    
    /**
     * Create an advanced category section
     */
    createAdvancedCategorySection: function(categoryName, paramNames, container) {
        if (!window.FrescoNamelist) return;
        
        const categoryConfig = window.FrescoNamelist.categories[categoryName];
        if (!categoryConfig) return;
        
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'glass-card mt-3';
        categoryDiv.style.display = 'none'; // Initially hidden
        categoryDiv.id = `${categoryName}-section`;
        
        categoryDiv.innerHTML = `
            <h4><i class="fas fa-cogs me-2"></i>${categoryConfig.title}</h4>
            <p class="text-white-50 mb-3">${categoryConfig.description}</p>
            <div class="row" id="${categoryName}-fields"></div>
        `;
        
        container.appendChild(categoryDiv);
        
        // Add parameter fields
        const fieldsContainer = categoryDiv.querySelector(`#${categoryName}-fields`);
        paramNames.forEach(paramName => {
            const paramConfig = categoryConfig.parameters[paramName];
            if (paramConfig) {
                // Advanced parameters should not have default values
                const fieldDiv = this.createParameterField(paramName, paramConfig, null, true);
                fieldsContainer.appendChild(fieldDiv);
            }
        });
    },
    
    /**
     * Update visual indicators for parameters
     */
    updateVisualIndicators: function() {
        // Add visual indicators for parameters that came from input file
        this.inputFileParameters.forEach(paramName => {
            const element = document.getElementById(paramName);
            if (element) {
                const label = element.parentElement.querySelector('label');
                if (label && !label.querySelector('.badge')) {
                    const badge = document.createElement('span');
                    badge.className = 'badge bg-primary ms-1';
                    badge.textContent = 'From File';
                    label.appendChild(badge);
                }
            }
        });
    },
    
    /**
     * Get all parameter values from form (both General and Advanced)
     */
    getAllParameterValues: function() {
        const values = {};
        
        // Get values from General section (including moved parameters)
        this.currentCategorization.general.forEach(paramName => {
            const element = document.getElementById(paramName);
            if (element && element.value !== '' && element.value !== null && element.value !== undefined) {
                values[paramName] = element.value;
                console.log(`Collected parameter ${paramName} = ${element.value} from General section`);
            }
        });
        
        // Get values from Advanced section
        this.currentCategorization.advanced.forEach(paramName => {
            const element = document.getElementById(paramName);
            if (element && element.value !== '' && element.value !== null && element.value !== undefined) {
                values[paramName] = element.value;
                console.log(`Collected parameter ${paramName} = ${element.value} from Advanced section`);
            }
        });
        
        // Also collect any other form fields that might not be in our categorization
        // Focus on General FRESCO Parameters section and exclude duplicates
        const generalSection = this.findGeneralFrescoSection();
        if (generalSection) {
            const generalInputs = generalSection.querySelectorAll('input[type="text"], input[type="number"], select, textarea');
            generalInputs.forEach(input => {
                if (input.id && input.value !== '' && input.value !== null && input.value !== undefined) {
                    if (!values[input.id]) {
                        values[input.id] = input.value;
                        console.log(`Collected additional parameter ${input.id} = ${input.value} from General section`);
                    }
                }
            });
        }
        
        console.log('All collected parameters:', values);
        return values;
    },
    
    /**
     * Find the General FRESCO Parameters section
     */
    findGeneralFrescoSection: function() {
        const h3Elements = document.querySelectorAll('h3');
        for (const h3 of h3Elements) {
            if (h3.textContent && h3.textContent.includes('General FRESCO Parameters')) {
                return h3.parentElement;
            }
        }
        return null;
    },

    /**
     * Populate parameter values from parsed input file
     */
    populateParameterValues: function(parameterValues) {
        console.log('Populating parameter values:', parameterValues);
        
        Object.keys(parameterValues).forEach(paramName => {
            const element = document.getElementById(paramName);
            if (element) {
                element.value = parameterValues[paramName];
                
                // Handle different input types
                if (element.type === 'checkbox') {
                    element.checked = parameterValues[paramName].toString().toLowerCase() === 'true' || 
                                    parameterValues[paramName] === '1' || 
                                    parameterValues[paramName].toString().toLowerCase() === 't';
                } else if (element.type === 'select-one') {
                    // For select elements, try to find matching option
                    const options = Array.from(element.options);
                    const matchingOption = options.find(option => 
                        option.value == parameterValues[paramName] || 
                        option.text.toLowerCase().includes(parameterValues[paramName].toString().toLowerCase())
                    );
                    if (matchingOption) {
                        element.value = matchingOption.value;
                    }
                }
                
                // Trigger change event
                element.dispatchEvent(new Event('change'));
                console.log(`Set ${paramName} = ${parameterValues[paramName]}`);
            } else {
                console.log(`Parameter ${paramName} element not found (will be created when UI updates)`);
            }
        });
        
        // Store parameter values for later use when creating moved parameter fields
        this.pendingParameterValues = parameterValues;
    },
    
    /**
     * Apply pending parameter values to newly created fields
     */
    applyPendingParameterValues: function() {
        if (this.pendingParameterValues) {
            console.log('Applying pending parameter values to newly created fields');

            Object.keys(this.pendingParameterValues).forEach(paramName => {
                const element = document.getElementById(paramName);
                if (element && (!element.value || element.value === '')) {
                    element.value = this.pendingParameterValues[paramName];
                    element.dispatchEvent(new Event('change'));
                    console.log(`Applied pending value ${paramName} = ${this.pendingParameterValues[paramName]}`);
                }
            });
        }
    },

    /**
     * Move a parameter between General and Advanced sections
     * @param {string} paramName - Name of the parameter to move
     * @param {boolean} toGeneral - true to move to General, false to move to Advanced
     */
    moveParameter: function(paramName, toGeneral) {
        console.log(`Moving parameter ${paramName} to ${toGeneral ? 'General' : 'Advanced'}`);

        if (toGeneral) {
            // Move from Advanced to General
            if (this.currentCategorization.advanced.includes(paramName)) {
                // Remove from Advanced
                this.currentCategorization.advanced = this.currentCategorization.advanced.filter(
                    p => p !== paramName
                );
                // Add to General
                if (!this.currentCategorization.general.includes(paramName)) {
                    this.currentCategorization.general.push(paramName);
                }
            }
        } else {
            // Move from General to Advanced
            if (this.currentCategorization.general.includes(paramName)) {
                // Don't allow moving default general parameters
                if (this.defaultGeneralParams.includes(paramName)) {
                    console.warn(`Cannot move default general parameter ${paramName} to Advanced`);
                    alert(`Cannot move default parameter "${paramName}" to Advanced section`);
                    return;
                }
                // Remove from General
                this.currentCategorization.general = this.currentCategorization.general.filter(
                    p => p !== paramName
                );
                // Add to Advanced
                if (!this.currentCategorization.advanced.includes(paramName)) {
                    this.currentCategorization.advanced.push(paramName);
                }
            }
        }

        console.log('Updated categorization:', this.currentCategorization);
    },

    /**
     * Reset parameters to default categorization
     */
    resetToDefaults: function() {
        console.log('Resetting parameters to defaults');
        this.resetToDefaultCategorization();
        this.updateUI();
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (window.FrescoParameterManager) {
        window.FrescoParameterManager.init();
    }
});

// Integration with existing toggle functionality
function toggleNamelistSection(categoryName) {
    const section = document.getElementById(`${categoryName}-section`);
    if (section) {
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }
}

console.log('fresco-parameter-manager.js loaded successfully');