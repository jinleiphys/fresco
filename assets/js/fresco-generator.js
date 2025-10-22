/**
 * FRESCO Input File Generator
 * Shared functions for generating, copying, and downloading FRESCO input files
 * Works for all reaction types: elastic, inelastic, transfer, capture, breakup
 */

window.FrescoGenerator = {
    /**
     * Generate FRESCO input file
     * This function reads form data and generates the complete input file
     */
    generateInputFile: function() {
        console.log('Generating FRESCO input file...');

        // Get all form elements
        const formElements = document.querySelectorAll('input, select, textarea');
        const formData = {};

        // Collect all form values
        formElements.forEach(element => {
            const id = element.id;
            const value = element.value;

            if (id && value !== '') {
                // Try to parse as number if appropriate
                if (element.type === 'number' || !isNaN(value)) {
                    const parsed = parseFloat(value);
                    if (!isNaN(parsed)) {
                        formData[id] = parsed;
                    } else {
                        formData[id] = value;
                    }
                } else if (element.type === 'checkbox') {
                    formData[id] = element.checked;
                } else {
                    formData[id] = value;
                }
            }
        });

        console.log('Form data collected:', formData);

        // Generate the &FRESCO namelist section using FrescoNamelist
        let namelistSection = '';
        if (window.FrescoNamelist && typeof window.FrescoNamelist.generateNamelistSection === 'function') {
            namelistSection = window.FrescoNamelist.generateNamelistSection(formData);
        } else {
            console.error('FrescoNamelist.generateNamelistSection not available');
            // Fallback: generate basic namelist
            namelistSection = this.generateBasicNamelist(formData);
        }

        // Build the complete input file
        const header = formData.header || 'FRESCO Calculation';
        const inputContent = this.buildCompleteInputFile(header, namelistSection, formData);

        // Display in output area
        const outputElement = document.getElementById('output');
        if (outputElement) {
            outputElement.textContent = inputContent;
            console.log('Input file generated successfully');
        } else {
            console.error('Output element not found');
        }

        return inputContent;
    },

    /**
     * Generate basic namelist section (fallback)
     */
    generateBasicNamelist: function(formData) {
        let namelist = '&FRESCO\n';

        // Add common parameters
        const params = ['hcm', 'rmatch', 'rintp', 'jtmin', 'jtmax', 'absend',
                       'thmin', 'thmax', 'thinc', 'elab', 'iter', 'chans', 'smats', 'xstabl'];

        params.forEach(param => {
            if (formData[param] !== undefined && formData[param] !== null && formData[param] !== '') {
                namelist += `  ${param}=${formData[param]}\n`;
            }
        });

        namelist += '/\n';
        return namelist;
    },

    /**
     * Build complete FRESCO input file
     */
    buildCompleteInputFile: function(header, namelistSection, formData) {
        let content = header + '\n';
        content += namelistSection + '\n';

        // Add &PARTITION section
        content += '&PARTITION\n';
        if (formData.projectile && formData['proj-mass']) {
            content += `  namep='${formData.projectile}' massp=${formData['proj-mass']} `;
            if (formData['proj-z']) content += `zp=${formData['proj-z']} `;
            if (formData['proj-spin']) content += `jp=${formData['proj-spin']} `;
            content += '\n';
        }
        if (formData.target && formData['targ-mass']) {
            content += `  namet='${formData.target}' masst=${formData['targ-mass']} `;
            if (formData['targ-z']) content += `zt=${formData['targ-z']} `;
            if (formData['targ-spin']) content += `jt=${formData['targ-spin']} `;
            content += '\n';
        }
        content += '/\n\n';

        // Add &STATES section
        content += '&STATES\n';
        content += '/\n\n';

        // Add &POTENTIAL section
        content += '&POTENTIAL\n';
        content += '/\n\n';

        // Add &COUPLING section
        content += '&COUPLING\n';
        content += '/\n\n';

        return content;
    },

    /**
     * Copy generated input file to clipboard
     */
    copyToClipboard: function() {
        const outputText = document.getElementById('output').textContent;

        if (!outputText || outputText.includes('Select parameters')) {
            alert('Please generate an input file first');
            return;
        }

        navigator.clipboard.writeText(outputText).then(
            function() {
                // Success message
                const copyBtn = document.getElementById('copy-btn');
                if (copyBtn) {
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fas fa-check me-1"></i>Copied!';
                    copyBtn.classList.add('btn-success');
                    copyBtn.classList.remove('action-btn');

                    setTimeout(function() {
                        copyBtn.innerHTML = originalText;
                        copyBtn.classList.remove('btn-success');
                        copyBtn.classList.add('action-btn');
                    }, 2000);
                }
                console.log('Copied to clipboard');
            },
            function(err) {
                console.error('Failed to copy:', err);
                alert('Failed to copy to clipboard');
            }
        );
    },

    /**
     * Download generated input file
     */
    downloadInputFile: function() {
        const outputText = document.getElementById('output').textContent;

        if (!outputText || outputText.includes('Select parameters')) {
            alert('Please generate an input file first');
            return;
        }

        // Determine filename based on projectile and target
        const projectile = document.getElementById('projectile')?.value || 'projectile';
        const target = document.getElementById('target')?.value || 'target';
        const fileName = `${projectile}_${target}_fresco.in`;

        // Create blob and download
        const blob = new Blob([outputText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();

        // Clean up
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);

        console.log('Downloaded as:', fileName);
    },

    /**
     * Initialize event listeners for generate, copy, and download buttons
     */
    initializeButtons: function() {
        // Generate button - use page-specific function if available
        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                // Check if page has its own generateInputFile function
                if (typeof window.generateInputFile === 'function') {
                    window.generateInputFile();
                } else {
                    this.generateInputFile();
                }
            });
            console.log('Generate button initialized');
        }

        // Copy button
        const copyBtn = document.getElementById('copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyToClipboard());
            console.log('Copy button initialized');
        }

        // Download button
        const downloadBtn = document.getElementById('download-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadInputFile());
            console.log('Download button initialized');
        }
    }
};

// Make shared functions globally available
window.copyToClipboard = function() {
    window.FrescoGenerator.copyToClipboard();
};

window.downloadInputFile = function() {
    window.FrescoGenerator.downloadInputFile();
};

// Auto-initialize when script loads (if at bottom of page)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.FrescoGenerator.initializeButtons());
} else {
    // DOM already loaded, initialize immediately
    window.FrescoGenerator.initializeButtons();
}

console.log('fresco-generator.js loaded successfully');
