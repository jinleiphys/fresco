// FRESCO Common JavaScript Functions
// Shared functionality for all FRESCO input generator pages

// Theme Toggle Functionality
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    const icon = document.getElementById('theme-icon');
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// Load saved theme on page load
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const icon = document.getElementById('theme-icon');
    
    if (icon) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        if (savedTheme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }
}

// Copy to clipboard functionality
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        showNotification('Copied to clipboard!', 'success');
    }, function(err) {
        console.error('Could not copy text: ', err);
        showNotification('Failed to copy to clipboard', 'error');
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(76, 175, 80, 0.9)' : 
                    type === 'error' ? 'rgba(244, 67, 54, 0.9)' : 
                    'rgba(33, 150, 243, 0.9)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Form validation utilities
function validateRequired(value, fieldName) {
    if (!value || value.trim() === '') {
        throw new Error(`${fieldName} is required`);
    }
    return value.trim();
}

function validateNumber(value, fieldName, min = null, max = null) {
    const num = parseFloat(value);
    if (isNaN(num)) {
        throw new Error(`${fieldName} must be a valid number`);
    }
    if (min !== null && num < min) {
        throw new Error(`${fieldName} must be at least ${min}`);
    }
    if (max !== null && num > max) {
        throw new Error(`${fieldName} must be at most ${max}`);
    }
    return num;
}

function validateInteger(value, fieldName, min = null, max = null) {
    const num = parseInt(value);
    if (isNaN(num) || !Number.isInteger(num)) {
        throw new Error(`${fieldName} must be a valid integer`);
    }
    if (min !== null && num < min) {
        throw new Error(`${fieldName} must be at least ${min}`);
    }
    if (max !== null && num > max) {
        throw new Error(`${fieldName} must be at most ${max}`);
    }
    return num;
}

// Download file functionality
function downloadFile(content, filename, contentType = 'text/plain') {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Format number for display
function formatNumber(num, decimals = 3) {
    if (num === 0) return '0';
    if (Math.abs(num) < 0.001) {
        return num.toExponential(decimals);
    }
    return num.toFixed(decimals);
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load theme
    loadTheme();
    
    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add copy functionality to any copy buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const text = targetElement.textContent || targetElement.value;
                copyToClipboard(text);
            }
        });
    });
    
    // Add keyboard navigation for form elements
    document.querySelectorAll('input, select, textarea').forEach(element => {
        element.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                const form = this.closest('form');
                if (form) {
                    const formElements = Array.from(form.querySelectorAll('input, select, textarea, button'));
                    const currentIndex = formElements.indexOf(this);
                    const nextElement = formElements[currentIndex + 1];
                    
                    if (nextElement && nextElement.type !== 'submit') {
                        e.preventDefault();
                        nextElement.focus();
                    }
                }
            }
        });
    });
});

// File upload and parsing functionality
function handleFileUpload(event, formType) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.in') && !file.name.toLowerCase().endsWith('.inp') && !file.name.toLowerCase().endsWith('.txt')) {
        showNotification('Please upload a FRESCO input file (.in, .inp, or .txt)', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            parseAndPopulateForm(content, formType);
            showNotification('Input file loaded successfully!', 'success');
        } catch (error) {
            console.error('Error parsing file:', error);
            showNotification('Error parsing input file: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

function parseAndPopulateForm(content, formType) {
    console.log('Parsing FRESCO input file...');
    console.log('Content preview:', content.substring(0, 500));
    
    const lines = content.split('\n');
    const namelists = {};
    let currentNamelist = null;
    let potentialCount = 0;
    
    // Parse the input file
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip comments and empty lines
        if (line.startsWith('!') || line.startsWith('#') || line === '') continue;
        
        // Detect namelist start
        if (line.startsWith('&')) {
            // Extract just the namelist name, not the parameters
            const namelistLine = line.substring(1).trim();
            const spaceIndex = namelistLine.indexOf(' ');
            let namelistName = spaceIndex > 0 ? namelistLine.substring(0, spaceIndex).toLowerCase() : namelistLine.toLowerCase();
            
            // Handle multiple potentials by numbering them
            if (namelistName === 'pot') {
                potentialCount++;
                namelistName = `pot${potentialCount}`;
            }
            
            currentNamelist = namelistName;
            if (!namelists[currentNamelist]) {
                namelists[currentNamelist] = {};
            }
            console.log(`Found namelist: ${currentNamelist}`);
            
            // If there are parameters on the same line as the namelist declaration, parse them
            if (spaceIndex > 0) {
                const paramsPart = namelistLine.substring(spaceIndex + 1);
                parseParametersFromLine(paramsPart, namelists[currentNamelist]);
            }
            continue;
        }
        
        // Detect namelist end
        if (line === '/' || line === '&end') {
            console.log(`End of namelist: ${currentNamelist}`);
            currentNamelist = null;
            continue;
        }
        
        // Parse parameters within namelist
        if (currentNamelist && line.includes('=')) {
            parseParametersFromLine(line, namelists[currentNamelist]);
        }
    }
    
    console.log('Final parsed namelists:', namelists);
    
    // Populate form based on parsed data
    populateFormFields(namelists, formType, content);
}

function parseParametersFromLine(line, namelistObj) {
    // Handle multiple parameters on same line, including array syntax like p(1:3)=
    // First, split by spaces but be careful about parameter boundaries
    const tokens = line.trim().split(/\s+/);
    let i = 0;
    
    while (i < tokens.length) {
        const token = tokens[i];
        
        // Look for parameter assignments (param=value)
        if (token.includes('=')) {
            const equalIndex = token.indexOf('=');
            let key = token.substring(0, equalIndex).trim();
            let value = token.substring(equalIndex + 1).trim();
            
            // If value is empty, it might be the next token
            if (!value && i + 1 < tokens.length) {
                value = tokens[i + 1];
                i++; // Skip the next token since we used it as value
            }
            
            // Clean up the value (remove quotes, trailing commas, slashes, etc.)
            value = value.replace(/^['"]|['"]$/g, '').replace(/[,\/]+$/, '').trim();
            
            if (key && value) {
                // Handle array parameters like p(1:3)= or elab(1)=
                if (key.includes('(') && key.includes(')')) {
                    // Extract base parameter name (e.g., 'p' from 'p(1:3)')
                    const baseKey = key.substring(0, key.indexOf('(')).toLowerCase();
                    
                    // For array parameters, collect the values that follow
                    const values = [value];
                    
                    // Look ahead for more numeric values that belong to this array
                    let j = i + 1;
                    while (j < tokens.length && !tokens[j].includes('=') && /^[\d\.\-\+eE]+$/.test(tokens[j])) {
                        values.push(tokens[j]);
                        j++;
                    }
                    
                    // Store as array if multiple values, otherwise as single value
                    if (values.length > 1) {
                        namelistObj[baseKey] = values;
                        console.log(`  ${key} -> ${baseKey} = [${values.join(', ')}]`);
                    } else {
                        namelistObj[baseKey] = value;
                        console.log(`  ${key} -> ${baseKey} = ${value}`);
                    }
                    
                    // Skip the consumed tokens
                    i = j - 1;
                } else {
                    // Regular parameter - only take the immediate value
                    namelistObj[key.toLowerCase()] = value;
                    console.log(`  ${key} = ${value}`);
                }
            }
        }
        i++;
    }
}

function populateFormFields(namelists, formType, content) {
    console.log('Populating form fields for type:', formType);
    console.log('Parsed namelists:', namelists);
    
    // Enhanced parameter mapping - maps FRESCO parameter names to form field IDs
    const parameterMappings = {
        // Common FRESCO parameters
        'hcm': 'hcm',
        'rmatch': 'rmatch', 
        'absend': 'absend',
        'thmax': 'thmax',
        'thmin': 'thmin',
        'jtmax': 'jtmax',
        'jtmin': 'jtmin',
        'thinc': 'thinc',
        'elab': 'elab',
        'iter': 'iter',
        'rasym': 'rasym',
        'accrcy': 'accrcy',
        'hktarg': 'hktarg',
        
        // Additional FRESCO parameters
        'chans': 'chans',
        'smats': 'smats',
        'xstabl': 'xstabl',
        'nlab': 'nlab',
        'qval': 'qval',
        'nex': 'nex',
        
        // Particle parameters
        'namep': 'projectile',
        'massp': 'proj-mass',
        'zp': 'proj-z',
        'jp': 'proj-spin',
        'namet': 'target',
        'masst': 'targ-mass',
        'zt': 'targ-z',
        'jt': 'targ-spin',
        
        // State parameters
        'ep': 'proj-energy',
        'et': 'targ-energy',
        'bandp': 'proj-band',
        'bandt': 'targ-band',
        'cpot': 'cpot',
        
        // Potential parameters (these might need special handling)
        'kp': 'proj-partition',
        'kt': 'targ-partition',
        'type': 'potential-type',
        'p': 'p-values',  // For array parameters like p(1:3)
        'p1': 'p1',
        'p2': 'p2',
        'p3': 'p3',
        'p4': 'p4',
        'p5': 'p5',
        'p6': 'p6',
        'p7': 'p7',
        'ap': 'ap',
        'at': 'at',
        'rc': 'rc',
        'shape': 'shape',
        'rintp': 'rintp',
        'switch': 'switch',
        'ajswtch': 'ajswtch',
        'jump': 'jump',
        'jbord': 'jbord',
        'iblock': 'iblock',
        
        // States parameters
        'ptyp': 'ptyp',
        'ptyt': 'ptyt',
        'copyt': 'copyt'
    };
    
    let fieldsPopulated = 0;
    
    // Go through all namelists and try to populate fields
    Object.keys(namelists).forEach(namelistName => {
        const namelist = namelists[namelistName];
        console.log(`Processing namelist: ${namelistName}`, namelist);
        
        // Handle potentials specially - create dynamic potential cards
        if (namelistName.startsWith('pot') && namelistName !== 'pot') {
            handlePotentialData(namelistName, namelist);
            return;
        }
        
        Object.keys(namelist).forEach(param => {
            let paramLower = param.toLowerCase();
            let value = namelist[param];
            
            // Handle array values - convert arrays to first value for form fields
            if (Array.isArray(value)) {
                value = value[0] || value;
                console.log(`Array parameter ${param}: using first value = ${value}`);
            }
            
            const fieldId = parameterMappings[paramLower] || paramLower;
            const element = document.getElementById(fieldId);
            
            console.log(`Trying to map parameter '${param}' (${namelistName}) to field '${fieldId}'`);
            
            if (element) {
                console.log(`✅ Found element ${fieldId}, setting value:`, value);
                
                try {
                    if (element.type === 'checkbox') {
                        element.checked = value.toString().toLowerCase() === 'true' || value === '1' || value.toString().toLowerCase() === 't';
                    } else if (element.type === 'select-one') {
                        // For select elements, try to find matching option
                        const options = Array.from(element.options);
                        const matchingOption = options.find(option => 
                            option.value == value || option.text.toLowerCase().includes(value.toString().toLowerCase())
                        );
                        if (matchingOption) {
                            element.value = matchingOption.value;
                        } else {
                            element.value = value;
                        }
                    } else {
                        element.value = value;
                    }
                    
                    // Trigger change event to update any dependent fields
                    element.dispatchEvent(new Event('change'));
                    fieldsPopulated++;
                    console.log(`  ✅ Successfully set ${fieldId} = ${value}`);
                } catch (error) {
                    console.log(`  ❌ Error setting ${fieldId}:`, error);
                }
            } else {
                console.log(`  ❌ Element not found for field ID: ${fieldId}`);
            }
        });
    });
    
    // Handle potential data by creating dynamic potential cards
    function handlePotentialData(namelistName, namelist) {
        console.log(`🔧 Creating potential card for ${namelistName}:`, namelist);
        
        // Try multiple methods to create and populate potential cards
        let potentialCardCreated = false;
        
        // Method 1: Try to use page-specific addPotential function
        if (typeof window.addPotential === 'function') {
            try {
                console.log(`  🎯 Using window.addPotential function for ${namelistName}`);
                const potentialCard = window.addPotential();
                if (potentialCard) {
                    populatePotentialCard(potentialCard, namelist, namelistName);
                    potentialCardCreated = true;
                }
            } catch (error) {
                console.log(`  ⚠️ Error with window.addPotential:`, error);
            }
        }
        
        // Method 2: Try clicking the add potential button
        if (!potentialCardCreated) {
            const addPotentialBtn = document.getElementById('add-potential-btn');
            if (addPotentialBtn) {
                try {
                    console.log(`  🎯 Clicking add potential button for ${namelistName}`);
                    addPotentialBtn.click();
                    
                    // Wait a moment for the card to be created, then populate it
                    setTimeout(() => {
                        const potentialCards = document.querySelectorAll('.potential-card');
                        const lastCard = potentialCards[potentialCards.length - 1];
                        
                        if (lastCard) {
                            populatePotentialCard(lastCard, namelist, namelistName);
                        } else {
                            console.log(`  ❌ No potential card found after clicking button for ${namelistName}`);
                        }
                    }, 200); // Increased delay
                    
                } catch (error) {
                    console.log(`  ❌ Error clicking potential button:`, error);
                }
            } else {
                console.log(`  ⚠️ Add potential button not found on this page`);
            }
        }
    }
    
    // Helper function to populate a potential card
    function populatePotentialCard(card, namelist, namelistName) {
        console.log(`  ✅ Populating potential card for ${namelistName}`);
        
        // Populate the potential fields
        Object.keys(namelist).forEach(param => {
            let value = namelist[param];
            
            // Map potential parameters to form fields within the card
            const paramMapping = {
                'type': '.potential-type',
                'shape': '.potential-shape',
                'kp': '.kp-field',  // This field might not exist, keep for compatibility
                'p': '.p1',  // Map p array to p1 for now
                'p1': '.p1',
                'p2': '.p2',
                'p3': '.p3',
                'p4': '.p4',
                'p5': '.p5',
                'p6': '.p6',
                'p7': '.p7'
            };
            
            // Special handling for 'p' array parameter
            if (param.toLowerCase() === 'p' && Array.isArray(value)) {
                console.log(`    Handling p array with ${value.length} values:`, value);
                
                // Populate p1, p2, p3, etc. with the array values
                value.forEach((val, index) => {
                    const pFieldSelector = `.p${index + 1}`;
                    const pElement = card.querySelector(pFieldSelector);
                    if (pElement) {
                        try {
                            pElement.value = val;
                            pElement.dispatchEvent(new Event('change'));
                            console.log(`    ✅ Set p${index + 1} = ${val} in potential card`);
                            fieldsPopulated++;
                        } catch (error) {
                            console.log(`    ❌ Error setting p${index + 1}:`, error);
                        }
                    }
                });
                return; // Skip the normal processing for this parameter
            }
            
            // For other parameters, use single value
            if (Array.isArray(value)) {
                value = value[0];
            }
            
            const selector = paramMapping[param.toLowerCase()];
            if (selector) {
                const element = card.querySelector(selector);
                if (element) {
                    try {
                        if (element.tagName === 'SELECT') {
                            // For select elements, try to match the value
                            const options = Array.from(element.options);
                            const matchingOption = options.find(option => option.value == value);
                            if (matchingOption) {
                                element.value = value;
                                console.log(`    ✅ Set ${param} = ${value} in potential card`);
                                fieldsPopulated++;
                            } else {
                                console.log(`    ⚠️ No matching option found for ${param} = ${value}`);
                                // Try to find a partial match in option text
                                const partialMatch = options.find(option => 
                                    option.text.toLowerCase().includes(value.toString().toLowerCase()) ||
                                    option.value.toString().includes(value.toString())
                                );
                                if (partialMatch) {
                                    element.value = partialMatch.value;
                                    console.log(`    ✅ Set ${param} = ${partialMatch.value} (partial match) in potential card`);
                                    fieldsPopulated++;
                                }
                            }
                        } else {
                            element.value = value;
                            console.log(`    ✅ Set ${param} = ${value} in potential card`);
                            fieldsPopulated++;
                        }
                        
                        // Trigger change event
                        element.dispatchEvent(new Event('change'));
                    } catch (error) {
                        console.log(`    ❌ Error setting ${param}:`, error);
                    }
                } else {
                    console.log(`    ❌ Field ${selector} not found in potential card`);
                }
            } else {
                console.log(`    ⚠️ No mapping found for parameter: ${param}`);
            }
        });
    }
    
    // Try to extract header from comments or first meaningful line
    if (content) {
        const lines = content.split('\n');
        console.log('Looking for header...');
        
        // Look for the first meaningful line (often the first line in FRESCO files)
        for (let i = 0; i < Math.min(lines.length, 5); i++) {
            const line = lines[i].trim();
            console.log(`Line ${i}: "${line}"`);
            
            // Skip empty lines
            if (!line) continue;
            
            // Extract text - handle comments or plain text
            let headerText = line;
            if (line.startsWith('!') || line.startsWith('#')) {
                headerText = line.replace(/^[!#]\s*/, '').trim();
            }
            
            // Clean up the text
            headerText = headerText.replace(/;+$/, '').trim();
            
            // Skip technical FRESCO keywords and formatting lines
            const skipKeywords = ['namelist', '&fresco', '&partition', '&states', '&pot', '&overlap', '&coupling', '===', '---'];
            const isSkippable = !headerText || 
                              headerText.length < 8 ||  // Reduced minimum length
                              /^[=\-\*\s]+$/.test(headerText) ||
                              headerText.includes('=') ||  // Skip parameter lines
                              headerText.includes('&') ||  // Skip namelist lines
                              skipKeywords.some(keyword => headerText.toLowerCase().includes(keyword.toLowerCase()));
            
            console.log(`  Checking header: "${headerText}", isSkippable: ${isSkippable}`);
            
            if (!isSkippable) {
                const headerElement = document.getElementById('header');
                if (headerElement) {
                    headerElement.value = headerText;
                    fieldsPopulated++;
                    console.log('✅ Set header to:', headerText);
                    break;
                }
            }
        }
    }
    
    console.log(`Total fields populated: ${fieldsPopulated}`);
    
    if (fieldsPopulated === 0) {
        showNotification('No matching form fields found. The input file format may not be compatible.', 'warning');
    } else {
        showNotification(`Successfully populated ${fieldsPopulated} form fields!`, 'success');
    }
}

// Create upload button HTML
function createUploadButton(formType) {
    return `
        <div class="glass-card mb-4">
            <h3><i class="fas fa-upload me-2"></i>Upload Existing Input File</h3>
            <div class="row">
                <div class="col-md-6">
                    <label for="file-upload-${formType}" class="form-label">
                        Select FRESCO Input File
                        <span class="custom-tooltip">
                            <i class="fas fa-info-circle ms-1"></i>
                            <span class="tooltip-text">Upload an existing FRESCO input file (.in, .inp, .txt) to populate the form fields automatically.</span>
                        </span>
                    </label>
                    <input type="file" class="form-control" id="file-upload-${formType}" accept=".in,.inp,.txt" onchange="handleFileUpload(event, '${formType}')">
                </div>
                <div class="col-md-6 d-flex align-items-end">
                    <button type="button" class="glass-btn" onclick="document.getElementById('file-upload-${formType}').click()">
                        <i class="fas fa-folder-open me-2"></i>Browse Files
                    </button>
                </div>
            </div>
            <small class="form-text">Supported formats: .in, .inp, .txt</small>
        </div>
    `;
}

// Utility functions for FRESCO input generation
const FrescoUtils = {
    // Generate namelist format
    formatNamelist: function(name, parameters) {
        let output = `&${name}\n`;
        for (const [key, value] of Object.entries(parameters)) {
            if (value !== null && value !== undefined && value !== '') {
                if (typeof value === 'string') {
                    output += `  ${key}='${value}'\n`;
                } else if (Array.isArray(value)) {
                    output += `  ${key}=${value.join(', ')}\n`;
                } else {
                    output += `  ${key}=${value}\n`;
                }
            }
        }
        output += `/\n`;
        return output;
    },
    
    // Generate comment block
    formatComment: function(title, description) {
        let output = `! ${title}\n`;
        if (description) {
            const lines = description.split('\n');
            lines.forEach(line => {
                output += `! ${line}\n`;
            });
        }
        output += '\n';
        return output;
    },
    
    // Generate partition data
    formatPartition: function(partitions) {
        let output = '';
        partitions.forEach((partition, index) => {
            output += `! Partition ${index + 1}: ${partition.name}\n`;
            output += `  ${partition.mass} ${partition.charge} ${partition.parity}\n`;
        });
        return output;
    },
    
    // Generate state data
    formatStates: function(states) {
        let output = '';
        states.forEach((state, index) => {
            output += `! State ${index + 1}: ${state.name}\n`;
            output += `  ${state.energy} ${state.spin} ${state.parity}\n`;
        });
        return output;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleTheme,
        loadTheme,
        copyToClipboard,
        showNotification,
        validateRequired,
        validateNumber,
        validateInteger,
        downloadFile,
        formatNumber,
        handleFileUpload,
        parseAndPopulateForm,
        populateFormFields,
        createUploadButton,
        FrescoUtils
    };
}