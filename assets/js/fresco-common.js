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
            
            // Always use the unified parsing approach
            parseAndPopulateForm(content, formType);
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

    // Store parsed parameters globally for use in generation
    window.parsedFrescoParameters = {};

    // Extract and store the header (first non-empty, non-comment line before NAMELIST)
    let headerExtracted = false;
    for (let i = 0; i < lines.length && !headerExtracted; i++) {
        const line = lines[i].trim();
        // Skip empty lines and comments
        if (line === '' || line.startsWith('!') || line.startsWith('#') ||
            line.startsWith('*') || line.match(/^[Cc]\s/)) continue;

        // If we hit NAMELIST or a namelist start, we're done looking for header
        if (line.toUpperCase() === 'NAMELIST' || line.startsWith('&')) {
            headerExtracted = true;
            break;
        }

        // This is the header line - store it
        window.parsedFileHeader = line;
        console.log(`Extracted header: "${line}"`);

        // Populate the header field if it exists
        const headerField = document.getElementById('header');
        if (headerField) {
            headerField.value = line;
        }

        headerExtracted = true;
    }

    // Parse the input file
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip comments and empty lines - be careful not to skip "&FRESCO"
        // Fortran comments: 'C' or 'c' followed by space, or !, #, *
        if (line === '' ||
            line.startsWith('!') ||
            line.startsWith('#') ||
            line.startsWith('*') ||
            (line.startsWith('C ') && !line.startsWith('&')) ||
            (line.startsWith('c ') && !line.startsWith('&'))) continue;
        
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
        if (line === '/' || line === '&end' || line.trim() === '/') {
            console.log(`End of namelist: ${currentNamelist}`);
            currentNamelist = null;
            continue;
        }

        // Parse parameters within namelist
        if (currentNamelist && line.includes('=')) {
            console.log(`Processing parameter line in ${currentNamelist}: "${line}"`);

            // Check if line contains both parameter and terminator (e.g., "cutc=20 /")
            let cleanLine = line;
            if (line.includes('/')) {
                // Split at the '/' and get everything before it
                const slashIndex = line.indexOf('/');
                cleanLine = line.substring(0, slashIndex).trim();
                console.log(`  Line contains terminator, extracted: "${cleanLine}"`);

                // Parse the parameters before the /
                if (cleanLine && cleanLine.includes('=')) {
                    parseParametersFromLine(cleanLine, namelists[currentNamelist]);
                }

                // End the namelist
                console.log(`End of namelist: ${currentNamelist}`);
                currentNamelist = null;
                continue;
            }

            parseParametersFromLine(cleanLine, namelists[currentNamelist]);
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
                    // Regular parameter - check if there are multiple values following
                    const values = [value];

                    // For certain parameters like elab, check if multiple space-separated values follow
                    // Look ahead for more numeric values that might belong to this parameter
                    let j = i + 1;
                    const multiValueParams = ['elab', 'ek', 'thetas', 'energies']; // Parameters that can have multiple values

                    if (multiValueParams.includes(key.toLowerCase())) {
                        while (j < tokens.length && !tokens[j].includes('=') && /^[\d\.\-\+eE]+$/.test(tokens[j])) {
                            values.push(tokens[j]);
                            j++;
                        }
                    }

                    // Store as space-separated string if multiple values, otherwise as single value
                    if (values.length > 1) {
                        namelistObj[key.toLowerCase()] = values.join(' ');
                        console.log(`  ${key} = ${values.join(' ')} (${values.length} values)`);
                        i = j - 1; // Skip the consumed tokens
                    } else {
                        namelistObj[key.toLowerCase()] = value;
                        console.log(`  ${key} = ${value}`);
                    }
                }
            }
        }
        i++;
    }
}

function populateFormFields(namelists, formType, content) {
    console.log('Populating form fields for type:', formType);
    console.log('Parsed namelists:', namelists);

    // Use new FrescoPotentialUI module if available (preferred method)
    if (typeof window.FrescoPotentialUI !== 'undefined' &&
        typeof window.FrescoPotentialUI.loadFromFile === 'function') {
        console.log('Using FrescoPotentialUI module for potential parsing');
        window.FrescoPotentialUI.loadFromFile(content);
    } else {
        // Fallback to old method for pages that don't use FrescoPotentialUI
        // Clear existing nuclear potential cards to avoid duplicates
        const potentialContainer = document.getElementById('potential-container');
        if (potentialContainer) {
            // Count how many nuclear potentials are in the uploaded file
            const nuclearPotCount = Object.keys(namelists).filter(name => {
                if (!name.startsWith('pot') || name === 'pot') return false;
                const namelist = namelists[name];
                return namelist.hasOwnProperty('type') || namelist.hasOwnProperty('p1') || namelist.hasOwnProperty('p');
            }).length;

            if (nuclearPotCount > 0) {
                console.log(`Found ${nuclearPotCount} nuclear potentials in file, clearing existing potential cards`);
                potentialContainer.innerHTML = '';
            }
        }
    }

    // Use FrescoNamelist configuration if available
    let useAdvancedConfig = false;
    if (typeof window.FrescoNamelist !== 'undefined') {
        useAdvancedConfig = true;
        console.log('Using FrescoNamelist configuration for parameter mapping');
    }
    
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
    
    // Handle FRESCO namelist parameters first if using advanced config
    if (useAdvancedConfig && namelists.fresco) {
        console.log('Processing FRESCO namelist with advanced configuration');
        fieldsPopulated += populateFrescoNamelistParameters(namelists.fresco);
    }
    
    // Go through all namelists and try to populate fields
    Object.keys(namelists).forEach(namelistName => {
        const namelist = namelists[namelistName];
        console.log(`Processing namelist: ${namelistName}`, namelist);
        
        // Skip FRESCO namelist if already processed
        if (namelistName === 'fresco' && useAdvancedConfig) {
            console.log('Skipping FRESCO namelist (already processed)');
            return;
        }
        
        // Handle potentials specially - create dynamic potential cards
        if (namelistName.startsWith('pot') && namelistName !== 'pot') {
            // Skip POT namelists if using FrescoPotentialUI (already handled above)
            if (typeof window.FrescoPotentialUI !== 'undefined' &&
                typeof window.FrescoPotentialUI.loadFromFile === 'function') {
                console.log(`Skipping ${namelistName} - already handled by FrescoPotentialUI`);
                return;
            }

            // Old method for pages that don't use FrescoPotentialUI
            // Check if this is a nuclear potential (has type parameter)
            // Coulomb potentials typically only have kp, ap, at, rc
            const hasType = namelist.hasOwnProperty('type');
            const hasNuclearParams = namelist.hasOwnProperty('p1') || namelist.hasOwnProperty('p');

            if (hasType || hasNuclearParams) {
                console.log(`Nuclear potential detected: ${namelistName}`);
                handlePotentialData(namelistName, namelist);
            } else {
                console.log(`Coulomb potential detected: ${namelistName} - populating basic fields`);
                // Handle Coulomb potential parameters in basic form fields
                if (namelist.rc) {
                    const rcElement = document.getElementById('rc');
                    if (rcElement) rcElement.value = namelist.rc;
                }
                if (namelist.ap) {
                    const apElement = document.getElementById('ap');
                    if (apElement) apElement.value = namelist.ap;
                }
                if (namelist.at) {
                    const atElement = document.getElementById('at');
                    if (atElement) atElement.value = namelist.at;
                }
            }
            return;
        }

        // Handle partition and states namelists specially
        if (namelistName === 'partition' || namelistName.startsWith('partition')) {
            console.log(`Partition namelist detected: ${namelistName} - storing data and populating basic fields`);

            // Store full partition data for later use
            if (!window.parsedPartitionStatesData) {
                window.parsedPartitionStatesData = { partitions: [], states: [] };
            }
            window.parsedPartitionStatesData.partitions.push(namelist);

            // Only populate fields that exist (no error logging for missing fields)
            const partitionFieldMappings = {
                'namep': 'projectile',
                'massp': 'proj-mass',
                'zp': 'proj-z',
                'namet': 'target',
                'masst': 'targ-mass',
                'zt': 'targ-z'
            };

            Object.keys(partitionFieldMappings).forEach(param => {
                if (namelist.hasOwnProperty(param)) {
                    const fieldId = partitionFieldMappings[param];
                    const element = document.getElementById(fieldId);
                    if (element) {
                        console.log(`  ✅ Partition: ${param} → ${fieldId} = ${namelist[param]}`);
                        element.value = namelist[param];
                        element.dispatchEvent(new Event('change'));
                        fieldsPopulated++;
                    }
                }
            });
            return;
        }

        if (namelistName === 'states' || namelistName.startsWith('states')) {
            console.log(`States namelist detected: ${namelistName} - storing data and populating basic fields`);

            // Store full states data for later use
            if (!window.parsedPartitionStatesData) {
                window.parsedPartitionStatesData = { partitions: [], states: [] };
            }
            window.parsedPartitionStatesData.states.push(namelist);

            // Only populate fields that exist (no error logging for missing fields)
            const statesFieldMappings = {
                'jp': 'proj-spin',
                'jt': 'targ-spin'
            };

            Object.keys(statesFieldMappings).forEach(param => {
                if (namelist.hasOwnProperty(param)) {
                    const fieldId = statesFieldMappings[param];
                    const element = document.getElementById(fieldId);
                    if (element) {
                        console.log(`  ✅ States: ${param} → ${fieldId} = ${namelist[param]}`);
                        element.value = namelist[param];
                        element.dispatchEvent(new Event('change'));
                        fieldsPopulated++;
                    }
                }
            });
            return;
        }

        Object.keys(namelist).forEach(param => {
            let paramLower = param.toLowerCase();
            let value = namelist[param];
            
            // Handle array values - special handling for elab parameter
            if (Array.isArray(value)) {
                if (paramLower === 'elab') {
                    // For elab, join multiple values with commas
                    value = value.join(', ');
                    console.log(`Array parameter ${param}: joined values = ${value}`);
                } else {
                    // For other parameters, use first value
                    value = value[0] || value;
                    console.log(`Array parameter ${param}: using first value = ${value}`);
                }
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
                'it': '.it-field',
                // Note: 'kp' is a partition-level parameter, not a potential card field
                'p': '.p1',  // Map p array to p1 for now
                'p1': '.p1',
                'p2': '.p2',
                'p3': '.p3',
                'p4': '.p4',
                'p5': '.p5',
                'p6': '.p6',
                'p7': '.p7'
            };

            // Skip partition-level parameters that don't belong in potential cards
            const skipParams = ['kp', 'kt', 'ap', 'at', 'rc'];
            if (skipParams.includes(param.toLowerCase())) {
                return; // Silently skip these parameters
            }
            
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

    // Update parameter manager categorization based on uploaded file parameters
    if (window.FrescoParameterManager && window.parsedFrescoParameters) {
        const uploadedParams = Object.keys(window.parsedFrescoParameters);
        if (uploadedParams.length > 0) {
            console.log('Updating parameter categorization from uploaded file:', uploadedParams);
            window.FrescoParameterManager.updateCategorizationFromInputFile(uploadedParams);

            // If FrescoParameterUI is available, refresh the display and ensure fields exist
            if (window.FrescoParameterUI) {
                window.FrescoParameterUI.ensureGeneralParameterFields();
                window.FrescoParameterUI.updateParameterDisplay();
                console.log('Parameter UI updated with uploaded file parameters');
            }
        }
    }

    if (fieldsPopulated === 0) {
        showNotification('No matching form fields found. The input file format may not be compatible.', 'warning');
    } else {
        showNotification(`Successfully populated ${fieldsPopulated} form fields!`, 'success');
    }

    // IMPORTANT: After all form fields are populated (including partition data),
    // restore Coulomb potential values from uploaded file to prevent them from being
    // overwritten by automatic synchronization (e.g., ap/at syncing with massp/masst)
    if (typeof window.FrescoPotential !== 'undefined' &&
        typeof window.FrescoPotential.getAllPotentials === 'function') {
        setTimeout(() => {
            const potentials = window.FrescoPotential.getAllPotentials();
            const coulombPot = potentials.find(pot => pot.type === 0);

            if (coulombPot) {
                // Restore Coulomb potential form values from parsed file data
                const atInput = document.getElementById('at');
                const apInput = document.getElementById('ap');
                const rcInput = document.getElementById('rc');

                // IMPORTANT: For TYPE=0 Coulomb potential with p(1:3) array syntax,
                // values are stored as p1/p2/p3 during parsing
                // We need to map: p1 -> at, p2 -> ap, p3 -> rc
                const atValue = coulombPot.p1 !== undefined ? coulombPot.p1 :
                               (coulombPot.at !== undefined ? coulombPot.at : null);
                const apValue = coulombPot.p2 !== undefined ? coulombPot.p2 :
                               (coulombPot.ap !== undefined ? coulombPot.ap : null);
                const rcValue = coulombPot.p3 !== undefined ? coulombPot.p3 :
                               (coulombPot.rc !== undefined ? coulombPot.rc : null);

                if (atValue !== null && atInput) {
                    atInput.value = atValue;
                    console.log(`Restored Coulomb at=${atValue} from file`);
                }
                if (apValue !== null && apInput) {
                    apInput.value = apValue;
                    console.log(`Restored Coulomb ap=${apValue} from file`);
                }
                if (rcValue !== null && rcInput) {
                    rcInput.value = rcValue;
                    console.log(`Restored Coulomb rc=${rcValue} from file`);
                }
            }
        }, 300);  // Delay to ensure all sync operations complete
    }
}

// Function to populate FRESCO namelist parameters using the new configuration
function populateFrescoNamelistParameters(frescoNamelist) {
    if (typeof window.FrescoNamelist === 'undefined') {
        console.log('FrescoNamelist configuration not available');
        return 0;
    }
    
    let fieldsPopulated = 0;
    console.log('Populating FRESCO namelist parameters:', frescoNamelist);
    
    // Get all configured parameters
    const allParams = window.FrescoNamelist.getAllParameters();
    
    // Process each parameter from the uploaded file
    Object.keys(frescoNamelist).forEach(paramName => {
        const paramLower = paramName.toLowerCase();
        let value = frescoNamelist[paramName];
        
        // Handle array values - convert arrays to comma-separated string  
        if (Array.isArray(value)) {
            value = value.join(', ');
            console.log(`Array parameter ${paramName}: converted to = ${value}`);
        }
        
        // Check if this parameter is configured in FrescoNamelist
        const paramConfig = allParams[paramLower];
        if (paramConfig) {
            console.log(`Found configuration for parameter: ${paramLower}`);
            
            // Try to populate the basic form field first
            const basicElement = document.getElementById(paramLower);
            if (basicElement) {
                try {
                    if (basicElement.type === 'checkbox') {
                        basicElement.checked = value.toString().toLowerCase() === 'true' || 
                                            value === '1' || 
                                            value.toString().toLowerCase() === 't';
                    } else if (basicElement.type === 'select-one') {
                        // For select elements, try to find matching option
                        const options = Array.from(basicElement.options);
                        const matchingOption = options.find(option => 
                            option.value == value || 
                            option.text.toLowerCase().includes(value.toString().toLowerCase())
                        );
                        if (matchingOption) {
                            basicElement.value = matchingOption.value;
                        } else {
                            basicElement.value = value;
                        }
                    } else {
                        basicElement.value = value;
                    }
                    
                    // Trigger change event
                    basicElement.dispatchEvent(new Event('change'));
                    fieldsPopulated++;
                    console.log(`✅ Set basic field ${paramLower} = ${value}`);
                } catch (error) {
                    console.log(`❌ Error setting basic field ${paramLower}:`, error);
                }
            } else {
                // Store parameter for later use in generation even if no form field exists
                // For elab, make sure we store the full comma-separated string
                let storeValue = value;
                if (paramLower === 'elab' && Array.isArray(frescoNamelist[paramName])) {
                    storeValue = frescoNamelist[paramName].join(', ');
                }
                window.parsedFrescoParameters[paramLower] = storeValue;
                
                // Only log warning for parameters that should exist in basic forms
                const basicParams = ['hcm', 'rmatch', 'jtmax', 'absend', 'thmin', 'thmax', 'thinc', 'elab', 'iter', 'pel', 'exl', 'lin', 'lex'];
                if (basicParams.includes(paramLower)) {
                    console.log(`⚠️ Basic field ${paramLower} not found`);
                } else {
                    console.log(`ℹ️ Advanced parameter ${paramLower} = ${storeValue} (stored for generation)`);
                }
            }
        } else {
            console.log(`⚠️ Parameter ${paramLower} not found in FrescoNamelist configuration`);
            
            // Fallback to basic mapping for unknown parameters
            const basicElement = document.getElementById(paramLower);
            if (basicElement) {
                try {
                    basicElement.value = value;
                    basicElement.dispatchEvent(new Event('change'));
                    fieldsPopulated++;
                    console.log(`✅ Set fallback field ${paramLower} = ${value}`);
                } catch (error) {
                    console.log(`❌ Error setting fallback field ${paramLower}:`, error);
                }
            } else {
                // Store parameter for later use in generation
                window.parsedFrescoParameters[paramLower] = value;
                console.log(`ℹ️ Unknown parameter ${paramLower} = ${value} (stored for generation)`);
            }
        }
    });
    
    return fieldsPopulated;
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