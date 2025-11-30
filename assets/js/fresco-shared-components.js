/**
 * FRESCO Shared Components
 * This file contains all shared HTML components used across FRESCO input generator pages
 * Components are dynamically injected into the page to maintain consistency
 */

window.FrescoSharedComponents = {
    /**
     * Theme Toggle Button
     * Appears in top-right corner of all pages
     */
    themeToggle: `
        <button class="theme-toggle" onclick="toggleTheme()" aria-label="Toggle dark mode">
            <i class="fas fa-moon" id="theme-icon"></i>
        </button>
    `,

    /**
     * Home Link Button
     * Appears in top-left corner of all reaction type pages
     */
    homeLink: `
        <a href="index.html" class="home-link">
            <i class="fas fa-home me-2"></i>Home
        </a>
    `,

    /**
     * Common Footer
     * Used across all pages with consistent information
     */
    footer: `
        <footer class="footer">
            <div class="container">
                <div class="row">
                    <div class="col-md-6">
                        <h5>FRESCO Input Generator</h5>
                        <p>A user-friendly web tool for generating input files for the FRESCO nuclear reaction code.</p>
                        <p>Designed and made by <a href="http://jinlei.fewbody.com/">Jin Lei</a>. Supported by the National Natural Science Foundation of China (Grants No. 12475132). If you find any bugs or errors related to this website, please <a href="mailto:jinl@tongji.edu.cn">email me</a>.</p>
                    </div>
                    <div class="col-md-6 text-md-end">
                        <h5>Resources</h5>
                        <ul class="list-unstyled">
                            <li><a href="fresco.pdf" target="_blank">FRESCO Documentation</a></li>
                            <li><a href="https://github.com/I-Thompson/fresco" target="_blank">FRESCO GitHub Repository</a></li>
                            <li><a href="mailto:jinl@tongji.edu.cn" target="_blank">Contact Us</a></li>
                        </ul>
                    </div>
                </div>
                <hr class="my-4" style="border-color: rgba(255, 255, 255, 0.1);">
                <div class="text-center">
                    <p class="mb-0">© 2025 FRESCO Input Generator. Created for educational and research purposes. Designed and made by <a href="http://jinlei.fewbody.com/">Jin Lei</a>.</p>
                </div>
            </div>
        </footer>
    `,

    /**
     * Common Head Tags
     * Meta tags, CSS, and JavaScript imports shared across all pages
     */
    commonHeadTags: {
        meta: [
            '<meta charset="UTF-8">',
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
            '<meta name="author" content="Jin Lei">'
        ],
        css: [
            '<link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">',
            '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" crossorigin="anonymous">',
            '<link rel="preconnect" href="https://cdnjs.cloudflare.com">',
            '<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">',
            '<link rel="stylesheet" href="assets/css/fresco-styles.css">'
        ],
        googleAnalytics: `
            <!-- Google tag (gtag.js) -->
            <script async src="https://www.googletagmanager.com/gtag/js?id=G-J60NE88WR1"></script>
            <script>
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-J60NE88WR1');
            </script>
        `,
        scripts: [
            '<script src="assets/js/fresco-namelist.js"></script>',
            '<script src="assets/js/fresco-parameter-manager.js"></script>',
            '<script src="assets/js/fresco-common.js"></script>',
            '<script src="assets/js/fresco-integration.js"></script>'
        ]
    },

    /**
     * Inject shared components into the page
     * This function should be called when the DOM is loaded
     */
    init: function() {
        // Inject theme toggle at the beginning of body
        const themeToggleDiv = document.createElement('div');
        themeToggleDiv.innerHTML = this.themeToggle;
        document.body.insertBefore(themeToggleDiv.firstElementChild, document.body.firstChild);

        // Inject home link (only for non-index pages)
        if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
            const homeLinkDiv = document.createElement('div');
            homeLinkDiv.innerHTML = this.homeLink;
            document.body.insertBefore(homeLinkDiv.firstElementChild, document.body.children[1]);
        }

        // Inject footer before the closing body tag
        const footerDiv = document.createElement('div');
        footerDiv.innerHTML = this.footer;
        document.body.appendChild(footerDiv.firstElementChild);
    },

    /**
     * Create a standard page header
     * @param {string} icon - FontAwesome icon class (e.g., 'fa-atom')
     * @param {string} title - Page title
     * @param {string} subtitle - Page subtitle/description
     * @returns {string} HTML for the header
     */
    createHeader: function(icon, title, subtitle) {
        return `
            <header class="header">
                <div class="container">
                    <h1><i class="fas ${icon} me-2"></i>${title}</h1>
                    <p>${subtitle}</p>
                </div>
            </header>
        `;
    },

    /**
     * Create a standard file upload section
     * @param {string} formType - Type of form (elastic, inelastic, etc.)
     * @returns {string} HTML for the upload section
     */
    createUploadSection: function(formType) {
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
    },

    /**
     * Create standard action buttons for forms
     * @param {string} formType - Type of form
     * @returns {string} HTML for action buttons
     */
    createActionButtons: function(formType) {
        return `
            <div class="glass-card">
                <h3><i class="fas fa-file-code me-2"></i>Generated Input File</h3>
                <div class="mb-3">
                    <div class="btn-group" role="group">
                        <button type="button" class="glass-btn" onclick="generateInputFile()">
                            <i class="fas fa-sync-alt me-1"></i>Generate Input File
                        </button>
                        <button type="button" class="glass-btn" id="copy-btn" onclick="copyToClipboard()">
                            <i class="fas fa-copy me-1"></i>Copy to Clipboard
                        </button>
                        <button type="button" class="glass-btn" onclick="downloadInputFile()">
                            <i class="fas fa-download me-1"></i>Download
                        </button>
                    </div>
                </div>
                <pre id="output" class="output-area">Select parameters and click "Generate Input File" to create a FRESCO input file for ${formType} scattering.</pre>
            </div>
        `;
    }
};

// Auto-initialize when DOM is loaded (only inject footer and theme toggle)
document.addEventListener('DOMContentLoaded', function() {
    // Only auto-inject footer, theme toggle, and home link
    // Headers and other components should be manually added via innerHTML

    // Inject theme toggle
    if (!document.querySelector('.theme-toggle')) {
        const themeToggleDiv = document.createElement('div');
        themeToggleDiv.innerHTML = window.FrescoSharedComponents.themeToggle;
        document.body.insertBefore(themeToggleDiv.firstElementChild, document.body.firstChild);
    }

    // Inject home link (only for non-index pages)
    const isIndexPage = window.location.pathname.endsWith('index.html') ||
                       window.location.pathname.endsWith('/') ||
                       window.location.pathname === '/';

    if (!isIndexPage && !document.querySelector('.home-link')) {
        const homeLinkDiv = document.createElement('div');
        homeLinkDiv.innerHTML = window.FrescoSharedComponents.homeLink;
        // Insert after theme toggle
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle && themeToggle.nextSibling) {
            document.body.insertBefore(homeLinkDiv.firstElementChild, themeToggle.nextSibling);
        } else {
            document.body.insertBefore(homeLinkDiv.firstElementChild, document.body.children[1]);
        }
    }

    // Inject footer if it doesn't exist
    if (!document.querySelector('footer.footer')) {
        const footerDiv = document.createElement('div');
        footerDiv.innerHTML = window.FrescoSharedComponents.footer;
        document.body.appendChild(footerDiv.firstElementChild);
    }
});
