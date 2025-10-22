/**
 * FRESCO Breakup/CDCC Page JavaScript
 * Handles CDCC-specific functionality including file upload, parameter management,
 * J-intervals, bins, and input file generation
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    let parameterManager;
    let jintervalCount = 0;
    let binCount = 0;

    // CDCC-specific essential parameters for General section
    const cdccDefaultGeneralParams = [
        // Integration and matching
        'hcm', 'rmatch', 'rasym', 'hktarg',
        // Accuracy and convergence
        'accrcy', 'absend',
        // Angular distribution
        'thmin', 'thmax', 'thinc',
        // Energy
        'elab',
        // Output control
        'smats', 'chans', 'xstabl',
        // Cutoffs
        'cutr',
        // CDCC-specific
        'nk', 'cdcc',
        // Iteration
        'iter'
    ];

    console.log(`Using ${cdccDefaultGeneralParams.length} curated essential CDCC parameters for General section`);

    // ===========================
    // Parameter Management Functions
    // ===========================
    function updateParameterDisplay() {
        if (!parameterManager) return;

        const allocation = parameterManager.getCurrentCategorization();

        // Update counts
        const generalCountEl = document.getElementById('generalCount');
        const advancedCountEl = document.getElementById('advancedCount');

        if (generalCountEl) generalCountEl.textContent = allocation.general.length;
        if (advancedCountEl) advancedCountEl.textContent = allocation.advanced.length;

        // Update parameter lists
        updateParameterList('generalParameters', allocation.general, 'advanced');
        updateParameterList('advancedParameters', allocation.advanced, 'general');
    }

    function updateParameterList(containerId, parameters, moveToSection) {
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
            if (param.currentValue !== null) {
                valueSpan.textContent = `= ${param.currentValue}`;
            }

            leftDiv.appendChild(nameSpan);
            leftDiv.appendChild(valueSpan);

            const moveBtn = document.createElement('button');
            moveBtn.className = 'btn btn-sm btn-outline-primary';
            moveBtn.innerHTML = moveToSection === 'general' ? '<i class="fas fa-arrow-left"></i>' : '<i class="fas fa-arrow-right"></i>';
            moveBtn.title = `Move to ${moveToSection} section`;
            moveBtn.onclick = () => moveParameter(param.name, moveToSection === 'general');

            item.appendChild(leftDiv);
            item.appendChild(moveBtn);
            container.appendChild(item);
        });
    }

    function moveParameter(paramName, toGeneral) {
        if (!parameterManager) return;

        try {
            parameterManager.moveParameter(paramName, toGeneral);
            updateParameterDisplay();

            const section = toGeneral ? 'General' : 'Advanced';
            console.log(`Parameter '${paramName}' moved to ${section} section`);

        } catch (error) {
            console.error('Parameter move error:', error);
        }
    }

    window.resetParametersToDefaults = function() {
        if (!parameterManager) return;

        if (confirm('Reset all parameters to default allocation?')) {
            parameterManager.resetToDefaults();
            updateParameterDisplay();
            console.log('Parameters reset to default allocation');
        }
    };

    window.showParameterState = function() {
        if (!parameterManager) return;

        const allocation = parameterManager.getCurrentCategorization();
        console.log('Current Parameter State:', allocation);
        alert(`Current State:\n\nGeneral: ${allocation.general.length} parameters\nAdvanced: ${allocation.advanced.length} parameters\n\nSee console for detailed information.`);
    };

    // ===========================
    // Initialization
    // ===========================

    // Initialize the parameter UI with CDCC defaults
    if (typeof FrescoParameterUI !== 'undefined') {
        window.FrescoParameterUI.init(cdccDefaultGeneralParams);
        console.log('CDCC Parameter UI initialized with', cdccDefaultGeneralParams.length, 'essential parameters');
    } else {
        console.error('FrescoParameterUI not available');
    }

    // Initialize the parameter manager
    if (typeof FrescoParameterManager !== 'undefined') {
        parameterManager = window.FrescoParameterManager;
        parameterManager.init();
        updateParameterDisplay();
        console.log('Parameter manager initialized for CDCC/breakup reactions');
    } else {
        console.error('FrescoParameterManager not available');
    }

    // Toggle chevron icon for Parameter Management collapse
    const paramMgmtContent = document.getElementById('parameterManagementContent');
    const paramMgmtIcon = document.getElementById('paramMgmtToggleIcon');
    if (paramMgmtContent && paramMgmtIcon) {
        paramMgmtContent.addEventListener('show.bs.collapse', function() {
            paramMgmtIcon.classList.remove('fa-chevron-down');
            paramMgmtIcon.classList.add('fa-chevron-up');
        });
        paramMgmtContent.addEventListener('hide.bs.collapse', function() {
            paramMgmtIcon.classList.remove('fa-chevron-up');
            paramMgmtIcon.classList.add('fa-chevron-down');
        });
    }

    // Check if FrescoNamelist is available for backward compatibility
    console.log('DOM loaded, checking FrescoNamelist:', typeof window.FrescoNamelist);

    // Initialize basic form fields with configuration values
    if (window.FrescoNamelist && window.FrescoNamelist.initializeBasicFields) {
        window.FrescoNamelist.initializeBasicFields();
    }

    // ===========================
    // Bins Management
    // ===========================
    const binsContainer = document.getElementById('bins-container');
    const addBinBtn = document.getElementById('add-bin-btn');
    const binTemplate = document.getElementById('bin-template');

    // Add a continuum bin
    function addBin() {
        binCount++;

        // Clone the template
        const binNode = document.importNode(binTemplate.content, true);

        // Set unique IDs and update labels
        const binCard = binNode.querySelector('.bin-card');
        binCard.dataset.binId = binCount;
        binCard.querySelector('.bin-number').textContent = binCount;

        // Set default values based on bin type (odd = positive parity, even = negative parity)
        if (binCount > 1) {
            if (binCount === 2) {
                // Second bin: negative parity, l=1, j=0.5
                binCard.querySelector('.bin-parity').value = "-1";
                binCard.querySelector('.bin-l').value = "1";
                binCard.querySelector('.bin-j').value = "0.5";
            } else if (binCount === 3) {
                // Third bin: negative parity, l=1, j=1.5
                binCard.querySelector('.bin-parity').value = "-1";
                binCard.querySelector('.bin-l').value = "1";
                binCard.querySelector('.bin-j').value = "1.5";
            }
        }

        // Set remove button action
        binCard.querySelector('.remove-bin').addEventListener('click', function(e) {
            e.preventDefault();
            binCard.remove();
            updateBinNumbers();
        });

        // Append to container
        binsContainer.appendChild(binNode);

        return binCard;
    }

    // Update numbering when a bin is removed
    function updateBinNumbers() {
        const bins = binsContainer.querySelectorAll('.bin-card');
        bins.forEach((bin, index) => {
            bin.querySelector('.bin-number').textContent = index + 1;
            bin.dataset.binId = index + 1;
        });
        binCount = bins.length;
    }

    // Add bin button listener
    addBinBtn.addEventListener('click', function() {
        addBin();
    });

    // ===========================
    // J-Intervals Management
    // ===========================
    const jintervalsContainer = document.getElementById('jintervals-container');
    const addJIntervalBtn = document.getElementById('add-jinterval-btn');
    const jintervalTemplate = document.getElementById('jinterval-template');

    // Add a J-interval
    function addJInterval(jbordValue = 0, jumpValue = 1) {
        jintervalCount++;

        // Clone the template
        const jintervalNode = document.importNode(jintervalTemplate.content, true);

        // Set unique ID
        const jintervalRow = jintervalNode.querySelector('.jinterval-row');
        jintervalRow.dataset.jintervalId = jintervalCount;

        // Set values
        jintervalRow.querySelector('.jbord').value = jbordValue;
        jintervalRow.querySelector('.jump').value = jumpValue;

        // Set remove button action
        jintervalRow.querySelector('.remove-jinterval').addEventListener('click', function(e) {
            e.preventDefault();
            jintervalRow.remove();
            jintervalCount--;
        });

        // Append to container
        jintervalsContainer.appendChild(jintervalNode);

        return jintervalRow;
    }

    // Add J-interval button listener
    addJIntervalBtn.addEventListener('click', function() {
        addJInterval();
    });

    // Initialize with default J-intervals
    addJInterval(0, 4);
    addJInterval(60, 5);
    addJInterval(200, 20);
    addJInterval(2500, 0);

    // ===========================
    // CDCC File Upload Handler
    // ===========================
    window.handleCDCCFileUpload = function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            console.log('📂 CDCC file loaded, parsing...');

            // Parse CDCC namelist
            parseCDCCFile(content);
        };
        reader.readAsText(file);
    };

    function parseCDCCFile(content) {
        const lines = content.split('\n');

        // Extract header (first line)
        if (lines.length > 0 && lines[0].trim()) {
            const headerField = document.getElementById('header');
            if (headerField) {
                headerField.value = lines[0].trim();
                console.log('✅ Set header:', lines[0].trim());
            }
        }

        // Parse &CDCC namelist
        const cdccMatch = content.match(/&CDCC\s+([\s\S]*?)\s*\//i);
        if (cdccMatch) {
            const cdccContent = cdccMatch[1];
            const params = {};

            // Extract all parameter=value pairs
            const paramRegex = /(\w+)\s*=\s*([^=\s]+(?:\s+[^=\s]+)*?)(?=\s+\w+\s*=|\s*$)/g;
            let match;
            while ((match = paramRegex.exec(cdccContent)) !== null) {
                const paramName = match[1].toLowerCase();
                let value = match[2].trim();

                // Handle multi-value parameters (space-separated)
                if (value.includes(' ')) {
                    value = value.split(/\s+/).join(' ');
                }

                params[paramName] = value;
            }

            console.log('📋 Parsed CDCC parameters:', params);

            // Map CDCC parameters to form fields
            for (const [key, value] of Object.entries(params)) {
                // Handle CDCC-specific aliases
                let fieldId = key;
                if (key === 'cdccc') fieldId = 'cdcc';  // cdccc -> cdcc alias
                if (key === 'q') fieldId = 'q';  // q is ip1 alias but we have a q field

                const field = document.getElementById(fieldId);
                if (field) {
                    field.value = value;
                    console.log(`✅ Set ${fieldId} = ${value}`);
                } else {
                    // Try to use parameter UI
                    if (window.FrescoParameterUI && window.FrescoParameterUI.getAllFrescoParameters) {
                        console.log(`⚠️  Field ${fieldId} not found, will be handled by parameter manager`);
                    }
                }
            }

            // Update parameter manager with file parameters
            if (parameterManager && parameterManager.updateCategorizationFromInputFile) {
                parameterManager.updateCategorizationFromInputFile(Object.keys(params));
                updateParameterDisplay();
            }
        }

        // Parse &NUCLEUS namelists
        parseNucleusNamelists(content);

        // Parse &BIN namelists
        parseBinNamelists(content);

        console.log('✅ CDCC file parsing complete');
    }

    function parseNucleusNamelists(content) {
        const nucleusRegex = /&NUCLEUS\s+([\s\S]*?)\s*\//gi;
        let match;
        const nuclei = [];

        while ((match = nucleusRegex.exec(content)) !== null) {
            const nucleusContent = match[1];
            const params = {};

            // Extract parameters
            const paramRegex = /(\w+)\s*=\s*'?([^'=\s]+)'?/g;
            let paramMatch;
            while ((paramMatch = paramRegex.exec(nucleusContent)) !== null) {
                params[paramMatch[1].toLowerCase()] = paramMatch[2];
            }

            nuclei.push(params);
        }

        console.log('📋 Parsed nuclei:', nuclei);

        // Map to form fields based on part
        nuclei.forEach(nucleus => {
            const part = nucleus.part?.toLowerCase();
            let prefix = '';

            if (part === 'proj') prefix = 'proj';
            else if (part === 'core') prefix = 'core';
            else if (part === 'valence') prefix = 'valence';
            else if (part === 'target') prefix = 'target';

            if (prefix) {
                if (nucleus.name) setField(`${prefix}-name`, nucleus.name);
                if (nucleus.spin) setField(`${prefix}-spin`, nucleus.spin);
                if (nucleus.parity) setField(`${prefix}-parity`, nucleus.parity === '+1' ? '1' : '-1');
                if (nucleus.be) setField(`${prefix}-be`, nucleus.be);
                if (nucleus.n) setField(`${prefix}-n`, nucleus.n);
                if (nucleus.l) setField(`${prefix}-l`, nucleus.l);
                if (nucleus.j) setField(`${prefix}-j`, nucleus.j);
                if (nucleus.charge) setField(`${prefix}-charge`, nucleus.charge);
                if (nucleus.mass) setField(`${prefix}-mass`, nucleus.mass);
            }
        });
    }

    function parseBinNamelists(content) {
        const binRegex = /&BIN\s+([\s\S]*?)\s*\//gi;
        let match;
        const bins = [];

        while ((match = binRegex.exec(content)) !== null) {
            const binContent = match[1].trim();
            if (!binContent) continue;  // Skip empty &BIN /

            const params = {};
            const paramRegex = /(\w+)\s*=\s*([^=\s]+)/g;
            let paramMatch;
            while ((paramMatch = paramRegex.exec(binContent)) !== null) {
                params[paramMatch[1].toLowerCase()] = paramMatch[2];
            }

            if (Object.keys(params).length > 0) {
                bins.push(params);
            }
        }

        console.log('📋 Parsed bins:', bins);

        // Clear existing bins and add parsed ones
        binsContainer.innerHTML = '';
        binCount = 0;

        bins.forEach(bin => {
            const binCard = addBin();
            if (bin.spin) binCard.querySelector('.bin-spin').value = bin.spin;
            if (bin.parity) binCard.querySelector('.bin-parity').value = bin.parity === '+1' ? '1' : '-1';
            if (bin.step) binCard.querySelector('.bin-step').value = bin.step;
            if (bin.end) binCard.querySelector('.bin-end').value = bin.end.replace(/\.$/, '');
            if (bin.energy) binCard.querySelector('.bin-energy').value = bin.energy;
            if (bin.l) binCard.querySelector('.bin-l').value = bin.l;
            if (bin.j) binCard.querySelector('.bin-j').value = bin.j;
        });
    }

    function setField(id, value) {
        const field = document.getElementById(id);
        if (field) {
            field.value = value;
            console.log(`✅ Set ${id} = ${value}`);
        }
    }

    // ===========================
    // Generate CDCC Namelist
    // ===========================
    function generateCdccNamelist(formData) {
        // CDCC-specific parameter aliases
        const cdccAliases = {
            'cdcc': 'cdccc',    // cdccc is the CDCC alias for cdcc
            'ip1': 'q',         // q = ip1 for projectile single-particle couplings
            'ip2': 'ncoul',     // ncoul = ip2 for nuclear/coulomb selection
            'ip3': 'reor',      // reor = ip3 for diagonal/off-diagonal couplings
            'ip4': 'qc',        // qc = ip4 for Qmax deformed core potential multipoles
            'ip5': 'la',        // la = ip5 for Lmax multipole orders
            'isc': 'iscgs',     // iscgs = isc for projectile ground state
            'ipc': 'ipcgs'      // ipcgs = ipc for projectile ground state
        };

        // Parameters that are valid in &CDCC namelist
        const cdccValidParams = [
            'hcm', 'rmatch', 'rintp', 'hnl', 'rnl', 'centre', 'rsp',
            'iter', 'pset', 'llmax', 'dry', 'rasym',
            'accrcy', 'switch', 'ajswtch', 'sinjmax',
            'cutl', 'cutr', 'cutc', 'absend',
            'jtmin', 'jump', 'jbord',
            'nnu', 'rmatr', 'nrbases', 'nrbmin',
            'pralpha', 'pcon', 'meigs', 'listcc',
            'smats', 'veff', 'chans', 'xstabl',
            'thmin', 'thmax', 'thinc',
            'smallchan', 'smallcoup', 'melfil', 'nosol',
            'cdetr', 'numnode', 'treneg', 'nlpl',
            'trans', 'pel', 'exl', 'qscale', 'pade', 'kfus',
            'elab', 'lab', 'lin', 'lex', 'hktarg',
            'nk', 'hat', 'remnant', 'postprior',
            'quasi', 'sumform', 'static', 'expand', 'maxcoup',
            // CDCC aliases (output names)
            'cdccc', 'q', 'ncoul', 'reor', 'qc', 'la', 'iscgs', 'ipcgs'
        ];

        // Build output object with aliases
        const cdccData = {};

        // Process formData and apply aliases
        for (let key in formData) {
            const value = formData[key];

            // Skip empty, null, undefined, NaN, or Infinity values
            if (value === null || value === undefined || value === '' ||
                (typeof value === 'number' && (isNaN(value) || !isFinite(value)))) {
                continue;
            }

            // Apply alias mapping if exists
            const outputKey = cdccAliases[key] || key;

            // Only include if it's a valid CDCC parameter
            if (cdccValidParams.includes(outputKey)) {
                cdccData[outputKey] = value;
            }
        }

        // Generate namelist lines
        let namelistLines = [];
        namelistLines.push(' &CDCC');

        // Group parameters for better readability
        const paramGroups = [
            // Integration parameters
            ['hcm', 'rmatch', 'rintp', 'hnl', 'rnl', 'centre', 'rsp', 'rasym'],
            // Accuracy and convergence
            ['accrcy', 'switch', 'ajswtch', 'sinjmax', 'absend'],
            // Angular momentum and jumps
            ['jtmin', 'jbord', 'jump', 'llmax', 'pset', 'dry'],
            // Radial cutoffs
            ['cutl', 'cutr', 'cutc'],
            // Angular distribution
            ['thmin', 'thmax', 'thinc'],
            // Iteration and matrix
            ['iter', 'nnu', 'rmatr', 'nrbases', 'nrbmin'],
            // Output control
            ['pralpha', 'pcon', 'meigs', 'listcc', 'smats', 'veff', 'chans', 'xstabl'],
            // Channel control
            ['smallchan', 'smallcoup', 'melfil', 'nosol'],
            // Special parameters
            ['cdetr', 'numnode', 'treneg', 'nlpl'],
            // Transfer and coupling
            ['trans', 'pel', 'exl', 'qscale', 'pade', 'kfus'],
            // Energy and lab parameters
            ['elab', 'lab', 'lin', 'lex', 'hktarg'],
            // CDCC-specific
            ['nk', 'cdccc', 'q', 'ncoul', 'reor', 'qc', 'la'],
            ['hat', 'quasi', 'sumform', 'iscgs', 'ipcgs'],
            ['remnant', 'postprior', 'pauli', 'static', 'expand', 'maxcoup']
        ];

        // Build grouped output
        for (let group of paramGroups) {
            let groupLine = '   ';
            let hasContent = false;

            for (let param of group) {
                if (cdccData.hasOwnProperty(param)) {
                    const value = cdccData[param];

                    // Format value based on type
                    let formattedValue;
                    if (typeof value === 'boolean') {
                        formattedValue = value ? 'T' : 'F';
                    } else if (typeof value === 'string') {
                        // Don't quote if it's already a multi-value string
                        formattedValue = value;
                    } else {
                        formattedValue = value;
                    }

                    groupLine += `${param}=${formattedValue} `;
                    hasContent = true;
                }
            }

            if (hasContent) {
                namelistLines.push(groupLine.trimEnd());
            }
        }

        namelistLines.push('   /');

        return namelistLines.join('\n');
    }

    // ===========================
    // Generate Input File
    // ===========================
    window.generateInputFile = function() {
        // Collect form data
        const formData = {};

        // Smart collection of all CDCC/FRESCO parameters
        if (window.FrescoParameterUI && window.FrescoParameterUI.getAllFrescoParameters) {
            const allCdccParams = window.FrescoParameterUI.getAllFrescoParameters();
            Object.assign(formData, allCdccParams);
            console.log('CDCC parameters collected via smart system:', allCdccParams);
        }

        // Get header
        const header = document.getElementById('header').value || '11Be+4He CDCC Breakup Calculation';

        // Get values from hardcoded fields (these override parameter UI if present)
        const hcm = document.getElementById('hcm').value;
        const hktarg = document.getElementById('hktarg').value;
        const rmatch = document.getElementById('rmatch').value;
        const rasym = document.getElementById('rasym').value;
        const accrcy = document.getElementById('accrcy').value;
        const absend = document.getElementById('absend').value;
        const elab = document.getElementById('elab').value;
        const thmax = document.getElementById('thmax').value;
        const thinc = document.getElementById('thinc').value;
        const cutr = document.getElementById('cutr').value;
        const nk = document.getElementById('nk').value;
        const q = document.getElementById('q').value;

        // Override formData with values from hardcoded fields
        if (hcm) formData.hcm = hcm;
        if (hktarg) formData.hktarg = hktarg;
        if (rmatch) formData.rmatch = rmatch;
        if (rasym) formData.rasym = rasym;
        if (accrcy) formData.accrcy = accrcy;
        if (absend) formData.absend = absend;
        if (elab) formData.elab = elab;
        if (thmax) formData.thmax = thmax;
        if (thinc) formData.thinc = thinc;
        if (cutr) formData.cutr = cutr;
        if (nk) formData.nk = nk;
        if (q) formData.ip1 = q;  // q is an alias for ip1 in CDCC

        // Get J-boundaries and jumps
        const jbords = document.querySelectorAll('.jbord');
        const jumps = document.querySelectorAll('.jump');
        let jbord = "";
        let jump = "";
        for (let i = 0; i < jbords.length; i++) {
            if (jbords[i].value) {
                jbord += jbords[i].value + " ";
            }
        }
        for (let i = 0; i < jumps.length; i++) {
            if (jumps[i].value && jumps[i].value !== "0") {
                jump += jumps[i].value + " ";
            }
        }
        formData.jbord = jbord.trim();
        formData.jump = jump.trim();

        // Generate &CDCC namelist section with CDCC-specific aliases
        const cdccNamelist = generateCdccNamelist(formData);

        // Get Nucleus Properties
        const projName = document.getElementById('proj-name').value;
        const projSpin = document.getElementById('proj-spin').value;
        const projParity = document.getElementById('proj-parity').value > 0 ? "+1" : "-1";
        const projBe = document.getElementById('proj-be').value;
        const projN = document.getElementById('proj-n').value;
        const projL = document.getElementById('proj-l').value;
        const projJ = document.getElementById('proj-j').value;

        const coreName = document.getElementById('core-name').value;
        const coreCharge = document.getElementById('core-charge').value;
        const coreMass = document.getElementById('core-mass').value;

        const valenceName = document.getElementById('valence-name').value;
        const valenceCharge = document.getElementById('valence-charge').value;
        const valenceMass = document.getElementById('valence-mass').value;
        const valenceSpin = document.getElementById('valence-spin').value;

        const targetName = document.getElementById('target-name').value;
        const targetCharge = document.getElementById('target-charge').value;
        const targetMass = document.getElementById('target-mass').value;

        // Get Potential Parameters
        const projTargA1 = document.getElementById('proj-targ-a1').value;
        const projTargA2 = document.getElementById('proj-targ-a2').value;
        const projTargRc = document.getElementById('proj-targ-rc').value;

        const coreTargA1 = document.getElementById('core-targ-a1').value;
        const coreTargA2 = document.getElementById('core-targ-a2').value;
        const coreTargRc = document.getElementById('core-targ-rc').value;
        const coreTargV = document.getElementById('core-targ-v').value;
        const coreTargVr0 = document.getElementById('core-targ-vr0').value;
        const coreTargA = document.getElementById('core-targ-a').value;
        const coreTargW = document.getElementById('core-targ-w').value;
        const coreTargWr0 = document.getElementById('core-targ-wr0').value;
        const coreTargAw = document.getElementById('core-targ-aw').value;

        const valTargA1 = document.getElementById('val-targ-a1').value;
        const valTargA2 = document.getElementById('val-targ-a2').value;
        const valTargRc = document.getElementById('val-targ-rc').value;
        const valTargV = document.getElementById('val-targ-v').value;
        const valTargVr0 = document.getElementById('val-targ-vr0').value;
        const valTargA = document.getElementById('val-targ-a').value;
        const valTargW = document.getElementById('val-targ-w').value;
        const valTargWr0 = document.getElementById('val-targ-wr0').value;
        const valTargAw = document.getElementById('val-targ-aw').value;

        const gsA1 = document.getElementById('gs-a1').value;
        const gsA2 = document.getElementById('gs-a2').value;
        const gsRc = document.getElementById('gs-rc').value;
        const gsV = document.getElementById('gs-v').value;
        const gsVr0 = document.getElementById('gs-vr0').value;
        const gsA = document.getElementById('gs-a').value;
        const gsVso = document.getElementById('gs-vso').value;
        const gsRso0 = document.getElementById('gs-rso0').value;
        const gsAso = document.getElementById('gs-aso').value;

        const exA1 = document.getElementById('ex-a1').value;
        const exA2 = document.getElementById('ex-a2').value;
        const exRc = document.getElementById('ex-rc').value;
        const exV = document.getElementById('ex-v').value;
        const exVr0 = document.getElementById('ex-vr0').value;
        const exA = document.getElementById('ex-a').value;
        const exVso = document.getElementById('ex-vso').value;
        const exRso0 = document.getElementById('ex-rso0').value;
        const exAso = document.getElementById('ex-aso').value;

        // Get Continuum Bins
        const bins = binsContainer.querySelectorAll('.bin-card');

        // Build the input file content
        let inputContent = `${header}
CDCC
${cdccNamelist}
 &NUCLEUS part='Proj' name='${projName}' spin=${projSpin} parity=${projParity} be = ${projBe} n=${projN} l=${projL} j=${projJ} /
 &NUCLEUS part='Core' name='${coreName}' charge=${coreCharge} mass=${coreMass} /
 &NUCLEUS part='Valence' name='${valenceName}' charge=${valenceCharge} mass=${valenceMass} spin=${valenceSpin}/
 &NUCLEUS part='Target' name='${targetName}' charge=${targetCharge} mass=${targetMass} /
`;

        // Add bins
        bins.forEach(bin => {
            const spin = bin.querySelector('.bin-spin').value;
            const parity = bin.querySelector('.bin-parity').value > 0 ? '+1' : '-1';
            const step = bin.querySelector('.bin-step').value;
            const end = bin.querySelector('.bin-end').value;
            const energy = bin.querySelector('.bin-energy').value;
            const l = bin.querySelector('.bin-l').value;
            const j = bin.querySelector('.bin-j').value;

            inputContent += `
 &BIN spin=${spin} parity=${parity} step=${step} end=${end}. energy=${energy} l=${l} j=${j}/`;
        });

        // Add empty bin to terminate bin definitions
        inputContent += `
 &BIN /

 &POTENTIAL part='Proj' a1=${projTargA1} a2=${projTargA2} rc=${projTargRc}  /
 &POTENTIAL part='Core' a1=${coreTargA1} a2=${coreTargA2} rc=${coreTargRc}
             V=${coreTargV} vr0=${coreTargVr0} a=${coreTargA} W=${coreTargW} wr0=${coreTargWr0} aw=${coreTargAw} /
 &POTENTIAL part='Valence' a1=${valTargA1} a2=${valTargA2} rc=${valTargRc}
             V=${valTargV} vr0=${valTargVr0} a=${valTargA} W=${valTargW} wr0=${valTargWr0} aw=${valTargAw} /
 &POTENTIAL part='Gs' a1=${gsA1} a2=${gsA2} rc=${gsRc} v=${gsV} vr0=${gsVr0} a=${gsA} vso=${gsVso} rso0=${gsRso0} aso=${gsAso}/
 &POTENTIAL part='Bi' a1=${exA1} a2=${exA2} rc=${exRc} v=${exV} vr0=${exVr0} a=${exA} vso=${exVso} rso0=${exRso0} aso=${exAso}/
`;

        // Update output area
        document.getElementById('output').textContent = inputContent;
    };

    // Add default bins
    addBin(); // First bin: positive parity, l=0, j=0.5
    addBin(); // Second bin: negative parity, l=1, j=0.5
    addBin(); // Third bin: negative parity, l=1, j=1.5

}); // End DOMContentLoaded
