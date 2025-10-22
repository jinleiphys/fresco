/**
 * FRESCO Integration Script
 * Integrates parameter manager with existing form generation functions
 */

// Override the global function to generate input files with dynamic parameters
function generateInputFile() {
    console.log('Generating input file with dynamic parameter support');
    
    // Get all form data including dynamic parameters
    let formData = {};
    if (window.FrescoNamelist && window.FrescoNamelist.getAllFormData) {
        formData = window.FrescoNamelist.getAllFormData();
    } else {
        // Fallback to basic form data collection
        const form = document.querySelector('form');
        if (form) {
            const formElements = form.querySelectorAll('input, select, textarea');
            formElements.forEach(element => {
                if (element.value !== '' && element.value !== null) {
                    formData[element.name || element.id] = element.value;
                }
            });
        }
    }
    
    console.log('Form data collected:', formData);
    
    // Generate namelist section
    let namelistSection = '';
    if (window.FrescoNamelist && window.FrescoNamelist.generateNamelistSection) {
        namelistSection = window.FrescoNamelist.generateNamelistSection(formData);
    }
    
    console.log('Generated namelist section:', namelistSection);
    
    // Continue with existing input file generation logic
    // This would call the existing page-specific generation function
    if (typeof generateElasticInputFile === 'function') {
        return generateElasticInputFile(namelistSection);
    } else if (typeof generateInelasticInputFile === 'function') {
        return generateInelasticInputFile(namelistSection);
    } else if (typeof generateTransferInputFile === 'function') {
        return generateTransferInputFile(namelistSection);
    } else if (typeof generateCaptureInputFile === 'function') {
        return generateCaptureInputFile(namelistSection);
    }
    
    return namelistSection;
}

// Function to reset parameters to default categorization
function resetParameterCategorization() {
    if (window.FrescoParameterManager) {
        window.FrescoParameterManager.resetToDefaultCategorization();
        console.log('Parameter categorization reset to default');
    }
}

// Enhanced file upload handling
function handleFileUploadWithDynamicParameters(event, formType) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.in') && !file.name.toLowerCase().endsWith('.inp') && !file.name.toLowerCase().endsWith('.txt')) {
        if (typeof showNotification === 'function') {
            showNotification('Please upload a FRESCO input file (.in, .inp, or .txt)', 'error');
        } else {
            alert('Please upload a FRESCO input file (.in, .inp, or .txt)');
        }
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            
            // Reset parameter categorization first
            resetParameterCategorization();
            
            // Parse and populate form
            if (typeof parseAndPopulateForm === 'function') {
                parseAndPopulateForm(content, formType);
            } else {
                console.error('parseAndPopulateForm function not available');
                throw new Error('parseAndPopulateForm function not available');
            }
            
            if (typeof showNotification === 'function') {
                showNotification('Input file loaded successfully! Parameters have been dynamically categorized.', 'success');
            } else {
                alert('Input file loaded successfully! Parameters have been dynamically categorized.');
            }
        } catch (error) {
            console.error('Error parsing file:', error);
            if (typeof showNotification === 'function') {
                showNotification('Error parsing input file: ' + error.message, 'error');
            } else {
                alert('Error parsing input file: ' + error.message);
            }
        }
    };
    reader.readAsText(file);
}

// Initialize integration when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('FRESCO Integration initialized');
    
    // Override any existing file upload handlers
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        // Remove any existing onclick handlers and use the enhanced version
        input.onchange = function(event) {
            const formType = this.id.replace('file-upload-', '');
            
            // Use the original handleFileUpload function if available, otherwise use enhanced version
            if (typeof handleFileUpload === 'function') {
                handleFileUpload(event, formType);
            } else {
                handleFileUploadWithDynamicParameters(event, formType);
            }
        };
    });
    
    // Add event listeners for parameter section toggles
    const toggleButtons = document.querySelectorAll('[onclick*="toggleNamelistSection"]');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const categoryName = this.getAttribute('onclick').match(/toggleNamelistSection\('([^']+)'/)[1];
            setTimeout(() => {
                const section = document.getElementById(`${categoryName}-section`);
                if (section && section.style.display === 'block') {
                    // Section is now visible, ensure it's properly populated
                    if (window.FrescoParameterManager) {
                        window.FrescoParameterManager.updateUI();
                    }
                }
            }, 100);
        });
    });
});

console.log('fresco-integration.js loaded successfully');