/**
 * FRESCO Potential Management Module
 *
 * Provides comprehensive potential handling for all FRESCO reaction types
 * (elastic, inelastic, transfer, capture) except breakup.
 *
 * Features:
 * - Complete potential TYPE and SHAPE definitions with metadata
 * - Parsing &POT namelists from uploaded FRESCO input files
 * - Generating &POT namelists with proper formatting
 * - Dynamic UI generation for potential cards
 * - Reaction-specific default potentials
 * - Smart potential validation and error checking
 */

window.FrescoPotential = (function() {
    'use strict';

    // ============================================================================
    // POTENTIAL TYPE DEFINITIONS
    // ============================================================================

    const POTENTIAL_TYPES = {
        0: {
            label: '0 - Coulomb potential',
            description: 'Defines radii and diagonal Coulomb potential',
            appliesTo: 'all',
            parameters: ['kp', 'type', 'at', 'ap', 'rc', 'ac'],
            isNuclear: false
        },
        1: {
            label: '1 - Central potential, Volume',
            description: 'Central volume potential (SHAPE determines form)',
            appliesTo: 'all',
            validShapes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, -1, -7, -8, -9],
            isNuclear: true
        },
        2: {
            label: '2 - Central potential, Derivative (surface)',
            description: 'Surface potential (first derivative forms)',
            appliesTo: 'all',
            validShapes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            isNuclear: true
        },
        3: {
            label: '3 - Spin-orbit for projectile',
            description: 'Spin-orbit potential for projectile',
            appliesTo: 'all',
            validShapes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            isNuclear: true
        },
        4: {
            label: '4 - Spin-orbit for target',
            description: 'Spin-orbit potential for target',
            appliesTo: 'all',
            validShapes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            isNuclear: true
        },
        5: {
            label: '5 - Tr tensor force for projectile',
            description: 'Tensor force for projectile (second derivative forms)',
            appliesTo: 'all',
            validShapes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            isNuclear: true
        },
        6: {
            label: '6 - Tr tensor force for target',
            description: 'Tensor force for target (second derivative forms)',
            appliesTo: 'all',
            validShapes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            isNuclear: true
        },
        7: {
            label: '7 - Tensor force between L and combined spins',
            description: 'Tensor force between L and combined projectile+target spins (e.g. n-p tensor)',
            appliesTo: 'all',
            validShapes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            isNuclear: true
        },
        8: {
            label: '8 - Spin·spin force',
            description: 'Spin-spin force for target & projectile spins',
            appliesTo: 'all',
            validShapes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            isNuclear: true
        },
        9: {
            label: '9 - Effective mass reduction',
            description: 'Effective mass: reduction from unity',
            appliesTo: 'all',
            validShapes: [0, 1, 2, 3, 4],
            isNuclear: true
        },
        10: {
            label: '10 - Deformed projectile (ROTOR)',
            description: 'Deformed projectile with matrix elements from ROTOR',
            appliesTo: 'inelastic',
            validShapes: [7, 8, 9, 10, 11, 12, 13],
            isNuclear: true
        },
        11: {
            label: '11 - Deformed target (ROTOR)',
            description: 'Deformed target with matrix elements from ROTOR',
            appliesTo: 'inelastic',
            validShapes: [7, 8, 9, 10, 11, 12, 13],
            isNuclear: true
        },
        12: {
            label: '12 - Projectile coupled by matrix elements',
            description: 'Projectile coupled by matrix elements read in',
            appliesTo: 'inelastic',
            validShapes: [7, 8, 9, 10, 11, 12, 13],
            isNuclear: true
        },
        13: {
            label: '13 - Target coupled by matrix elements',
            description: 'Target coupled by matrix elements read in',
            appliesTo: 'inelastic',
            validShapes: [7, 8, 9, 10, 11, 12, 13],
            isNuclear: true
        },
        14: {
            label: '14 - Projectile second-order coupled',
            description: 'Projectile second-order coupled by matrix elements read in',
            appliesTo: 'inelastic',
            validShapes: [7, 8, 9, 10, 11, 12, 13],
            isNuclear: true
        },
        15: {
            label: '15 - Target second-order coupled',
            description: 'Target second-order coupled by matrix elements read in',
            appliesTo: 'inelastic',
            validShapes: [7, 8, 9, 10, 11, 12, 13],
            isNuclear: true
        },
        16: {
            label: '16 - Target & projectile simultaneous second-order',
            description: 'Target & projectile simultaneous second-order coupled by matrix elements',
            appliesTo: 'inelastic',
            validShapes: [7, 8, 9, 10, 11, 12, 13],
            isNuclear: true
        },
        17: {
            label: '17 - Target & projectile all-order coupled',
            description: 'Target & projectile all-order coupled by matrix elements (Kermode-Rowley method)',
            appliesTo: 'inelastic',
            validShapes: [],  // SHAPE and P0-P6 not used for TYPE=17
            isNuclear: true
        },
        20: {
            label: '20 - Super-soft N-N potential (SSC)',
            description: 'Super-soft N-N potential of de Tourreil & Sprung (SSC)',
            appliesTo: 'transfer',
            validShapes: [],  // NUM parameter instead
            isNuclear: true
        },
        21: {
            label: '21 - User-supplied N-N potential',
            description: 'User-supplied N-N potential via subroutine NNPOT',
            appliesTo: 'transfer',
            validShapes: [],  // NUM parameter instead
            isNuclear: true
        }
    };

    // ============================================================================
    // SHAPE DEFINITIONS (for volume potentials TYPE=1, 8, 15)
    // ============================================================================

    const VOLUME_SHAPES = {
        0: {
            label: '0 - Woods-Saxon',
            formula: '-P1 / (1 + 1/E)',
            description: 'Standard Woods-Saxon form factor',
            variables: 'R = P2*CC, RH = (r-R)/P3, E = exp(-(r-R)/P3)'
        },
        1: {
            label: '1 - WS squared',
            formula: '-P1 / (1 + 1/E)²',
            description: 'Woods-Saxon squared form factor',
            variables: 'R = P2*CC, RH = (r-R)/P3, E = exp(-(r-R)/P3)'
        },
        2: {
            label: '2 - Gaussian',
            formula: '-P1 * exp(-RH²)',
            description: 'Gaussian form factor',
            variables: 'R = P2*CC, RH = (r-R)/P3'
        },
        3: {
            label: '3 - Yukawa',
            formula: '-P1 * E / r',
            description: 'Yukawa form factor',
            variables: 'E = exp(-(r-R)/P3)'
        },
        4: {
            label: '4 - Exponential',
            formula: '-P1 * E',
            description: 'Exponential form factor',
            variables: 'E = exp(-(r-R)/P3)'
        },
        5: {
            label: '5 - Reid soft core T=0',
            formula: 'Reid soft core for T=0, central part',
            description: 'Reid soft core potential for isospin T=0'
        },
        6: {
            label: '6 - Reid soft core T=1',
            formula: 'Reid soft core for T=1, central part',
            description: 'Reid soft core potential for isospin T=1'
        },
        7: {
            label: '7 - Read Real from file',
            description: 'Read real part from external file (Input File 4)',
            requiresFile: true
        },
        8: {
            label: '8 - Read Imaginary from file',
            description: 'Read imaginary part from external file (Input File 4)',
            requiresFile: true
        },
        9: {
            label: '9 - Read Complex from file',
            description: 'Read complex (both parts) from external file (Input File 4)',
            requiresFile: true
        },
        '-1': {
            label: '-1 - Fourier-Bessel',
            formula: 'j₀(RH) = sin(RH)/RH',
            description: 'Fourier-Bessel form factor'
        },
        '-7': {
            label: '-7 - Read Real (rewind)',
            description: 'Rewind file 4, then read real part',
            requiresFile: true
        },
        '-8': {
            label: '-8 - Read Imaginary (rewind)',
            description: 'Rewind file 4, then read imaginary part',
            requiresFile: true
        },
        '-9': {
            label: '-9 - Read Complex (rewind)',
            description: 'Rewind file 4, then read complex part',
            requiresFile: true
        }
    };

    // ============================================================================
    // SURFACE SHAPE DEFINITIONS (for TYPE=2)
    // ============================================================================

    const SURFACE_SHAPES = {
        0: {
            label: '0 - Woods-Saxon derivative',
            formula: '-P1 * 4 * E / (1+E)²',
            description: 'First derivative of Woods-Saxon, normalized to -1 when E=1'
        },
        1: {
            label: '1 - WS squared derivative',
            formula: '-P1 * 8 * E² / (1+E)³',
            description: 'First derivative of WS squared'
        },
        2: {
            label: '2 - Gaussian derivative',
            formula: '-P1 * 2 * exp(-RH²) * RH',
            description: 'First derivative of Gaussian'
        },
        3: {
            label: '3 - Yukawa derivative',
            formula: '-P1 * E * (1 + r/P3) / r²',
            description: 'First derivative of Yukawa'
        },
        4: {
            label: '4 - Exponential derivative',
            formula: '-P1 * E',
            description: 'First derivative of Exponential'
        },
        5: {
            label: '5 - Reid soft core T=0 S-O',
            description: 'Reid soft core for T=0, spin-orbit part × r'
        },
        6: {
            label: '6 - Reid soft core T=1 S-O',
            description: 'Reid soft core for T=1, spin-orbit part × r'
        },
        7: {
            label: '7 - Read from file',
            requiresFile: true
        },
        8: {
            label: '8 - Read from file',
            requiresFile: true
        },
        9: {
            label: '9 - Read from file',
            requiresFile: true
        }
    };

    // ============================================================================
    // SPECIAL SHAPE DEFINITIONS
    // ============================================================================

    const SPECIAL_SHAPES = {
        10: {
            label: '10 - Write to output file 25',
            description: 'Use SHAPE-10, write resulting potential to Output file 25 in FORMAT(6E12.4)'
        },
        20: {
            label: '20 - J-dependent from file (J+1)',
            description: 'Read J-dependent potential from file #20 for each CC set'
        },
        21: {
            label: '21 - J-dependent from file',
            description: 'Read J-dependent potential from file #21'
        },
        22: {
            label: '22 - J-dependent from file',
            description: 'Read J-dependent potential from file #22'
        },
        23: {
            label: '23 - J-dependent from file',
            description: 'Read J-dependent potential from file #23'
        },
        24: {
            label: '24 - J-dependent from file (int(J)+1)',
            description: 'Read J-dependent potential from file #24, using int(J)+1'
        },
        30: {
            label: '30 - L/J-dependent form factor',
            description: 'Use SHAPE-30 with JL, LSHAPE, XLVARY, ALVARY for L/J-dependent potential'
        },
        40: {
            label: '40 - Parity-dependent',
            description: 'Use KP=P1 for + parity, KP=P2 for - parity'
        },
        41: {
            label: '41 - L-dependent',
            description: 'Use KP=P(L+1) for L=0–5, P0 for L≥6'
        },
        42: {
            label: '42 - J-dependent',
            description: 'Use KP=P(Ji+1) for Ji=0–5, P0 for Ji≥6'
        }
    };

    // ============================================================================
    // DEFORMATION SHAPES (for TYPE≥10)
    // ============================================================================

    const DEFORMATION_SHAPES = {
        7: {
            label: '7 - Read from file (external)',
            description: 'Read multipoles from external file, multiplied by P(k)'
        },
        8: {
            label: '8 - Read from file (external)',
            description: 'Read multipoles from external file, multiplied by P(k)'
        },
        9: {
            label: '9 - Read from file (external)',
            description: 'Read multipoles from external file, multiplied by P(k)'
        },
        10: {
            label: '10 - Coulomb/Nuclear multipoles',
            description: 'Coulomb: M(Ek)=P(k) charged sphere. Nuclear: DEF(k)=P(k) × dU/dr'
        },
        11: {
            label: '11 - Nuclear deformation (quadrature)',
            description: 'Numerically deform radii of previous potential, project onto multipoles'
        },
        12: {
            label: '12 - Nuclear deformation + monopole',
            description: 'Same as 11, but recalculate monopole k=0 part with volume conservation'
        },
        13: {
            label: '13 - Nuclear deformation (no correction)',
            description: 'Same as 12, but without first-order radius correction for volume conservation'
        }
    };

    // ============================================================================
    // IT PARAMETER OPTIONS
    // ============================================================================

    const IT_OPTIONS = {
        0: {
            label: '0 - Normal (default)',
            description: 'Include potential normally in all calculations'
        },
        1: {
            label: '1 - Include iteratively only',
            description: 'Include this component only iteratively'
        },
        2: {
            label: '2 - Do not subtract in KIND=3,4',
            description: 'Do NOT subtract this component in KIND=3,4 single-particle couplings'
        },
        3: {
            label: '3 - Both: iterative & no subtract',
            description: 'Combine options 1 and 2: iterative and no subtract in KIND=3,4'
        }
    };

    // ============================================================================
    // REACTION-SPECIFIC DEFAULT POTENTIALS
    // ============================================================================

    const DEFAULT_POTENTIALS = {
        elastic: [
            {
                kp: 1,
                type: 0,
                at: 12.0,
                ap: 4.0,
                rc: 1.2,
                ac: 0.0
            },
            {
                kp: 1,
                type: 1,
                shape: 0,
                it: 0,
                p0: 0.0,
                p1: 40.0,  // Real depth (MeV)
                p2: 1.2,   // Real radius (fm)
                p3: 0.65,  // Real diffuseness (fm)
                p4: 10.0,  // Imag depth (MeV)
                p5: 1.2,   // Imag radius (fm)
                p6: 0.5,   // Imag diffuseness (fm)
                p7: 0.0
            }
        ],
        inelastic: [
            {
                kp: 1,
                type: 0,
                at: 12.0,
                ap: 4.0,
                rc: 1.2,
                ac: 0.0
            },
            {
                kp: 1,
                type: 1,
                shape: 0,
                it: 0,
                p0: 0.0,
                p1: 40.0,
                p2: 1.2,
                p3: 0.65,
                p4: 10.0,
                p5: 1.2,
                p6: 0.5,
                p7: 0.0
            },
            {
                kp: 1,
                type: 11,  // Deformed target
                shape: 10,
                it: 0,
                p0: 0.0,
                p1: 0.0,
                p2: 1.8,   // Deformation length (fm)
                p3: 0.0,
                p4: 0.0,
                p5: 0.0,
                p6: 0.0,
                p7: 0.0
            }
        ],
        transfer: [
            {
                kp: 1,
                type: 0,
                at: 12.0,
                ap: 3.0,
                rc: 1.2,
                ac: 0.0
            },
            {
                kp: 1,
                type: 1,
                shape: 0,
                it: 0,
                p0: 0.0,
                p1: 50.0,
                p2: 1.15,
                p3: 0.75,
                p4: 12.0,
                p5: 1.3,
                p6: 0.58,
                p7: 0.0
            }
        ],
        capture: [
            {
                kp: 1,
                type: 0,
                at: 12.0,
                ap: 1.0,
                rc: 1.2,
                ac: 0.0
            },
            {
                kp: 1,
                type: 1,
                shape: 0,
                it: 0,
                p0: 0.0,
                p1: 45.0,
                p2: 1.25,
                p3: 0.65,
                p4: 8.0,
                p5: 1.25,
                p6: 0.48,
                p7: 0.0
            }
        ]
    };

    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================

    let potentials = [];
    let parsedPotentials = null;
    let potentialCounter = 0;
    let reactionType = 'elastic';  // Default
    let useArraySyntax = false;  // Use p(1:6) format instead of p1 p2 p3 p4 p5 p6
    let detectedArraySyntax = false;  // Track if array syntax was found during parsing

    // ============================================================================
    // PUBLIC API - INITIALIZATION
    // ============================================================================

    /**
     * Initialize the potential system for a specific reaction type
     * @param {string} type - Reaction type: 'elastic', 'inelastic', 'transfer', or 'capture'
     */
    function init(type) {
        if (!['elastic', 'inelastic', 'transfer', 'capture'].includes(type)) {
            console.warn(`Invalid reaction type: ${type}. Defaulting to 'elastic'.`);
            type = 'elastic';
        }

        reactionType = type;
        potentials = [];
        parsedPotentials = null;
        potentialCounter = 0;
        useArraySyntax = false;  // Reset to default
        detectedArraySyntax = false;

        console.log(`FRESCO Potential system initialized for ${type} reaction`);
    }

    /**
     * Load default potentials for the current reaction type
     */
    function loadDefaults() {
        const defaults = DEFAULT_POTENTIALS[reactionType] || DEFAULT_POTENTIALS.elastic;
        potentials = JSON.parse(JSON.stringify(defaults));  // Deep copy
        potentialCounter = potentials.length;
        return potentials;
    }

    // ============================================================================
    // PUBLIC API - POTENTIAL PARSING
    // ============================================================================

    /**
     * Parse &POT namelists from FRESCO input file content
     * @param {string} content - Full content of the input file
     * @returns {Array} Array of parsed potential objects
     */
    function parsePotentials(content) {
        const parsed = [];
        const lines = content.split('\n');

        let inPotSection = false;
        let currentPot = null;
        detectedArraySyntax = false;  // Reset detection flag

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Skip comments (lines starting with 'C ' or 'c ')
            if (line.match(/^[Cc]\s/)) continue;

            // Detect if array syntax is used in this file
            if (line.match(/p\(\d+:\d+\)\s*=/i)) {
                detectedArraySyntax = true;
            }

            // Check for &POT namelist start
            if (line.match(/&POT/i)) {
                inPotSection = true;
                currentPot = parsePotNamelist(line);

                // Check if the terminator is on the same line
                if (line.includes('/')) {
                    parsed.push(currentPot);
                    currentPot = null;
                    inPotSection = false;

                    // Check if this was the last POT (kp < 0)
                    if (parsed.length > 0 && parsed[parsed.length - 1].kp < 0) {
                        break;
                    }
                }
                continue;
            }

            // If in POT section, continue reading parameters until /
            if (inPotSection && currentPot) {
                if (line.includes('/')) {
                    // End of this &POT namelist
                    const beforeSlash = line.substring(0, line.indexOf('/'));
                    if (beforeSlash.trim()) {
                        parseParameters(beforeSlash, currentPot);
                    }
                    parsed.push(currentPot);
                    currentPot = null;
                    inPotSection = false;

                    // Check if this was the last POT (kp < 0)
                    if (parsed.length > 0 && parsed[parsed.length - 1].kp < 0) {
                        break;
                    }
                } else {
                    // Continue reading parameters
                    parseParameters(line, currentPot);
                }
            }

            // Check for empty namelist (terminator)
            if (line === '&POT /' || line.match(/^&POT\s*\/$/)) {
                break;
            }
        }

        // Filter out invalid potentials (those with type=null, which come from empty &POT / terminators)
        const validPotentials = parsed.filter(pot => pot.type !== null && pot.type !== undefined);

        parsedPotentials = validPotentials;
        potentials = JSON.parse(JSON.stringify(validPotentials));  // Deep copy
        potentialCounter = potentials.length;

        // Automatically set array syntax preference based on detected format
        if (detectedArraySyntax) {
            useArraySyntax = true;
            console.log(`Parsed ${validPotentials.length} potentials from input file (array syntax detected, will preserve format)`);
        } else {
            console.log(`Parsed ${validPotentials.length} potentials from input file`);
        }

        return validPotentials;
    }

    /**
     * Parse a single &POT namelist line
     * @private
     */
    function parsePotNamelist(line) {
        const pot = {
            kp: 1,
            type: null
        };

        // Remove &POT and any trailing /
        line = line.replace(/&POT/i, '').replace(/\/.*$/, '').trim();

        // Parse key=value pairs
        parseParameters(line, pot);

        return pot;
    }

    /**
     * Parse parameter assignments into a potential object
     * Supports both individual parameters (p1=, p2=) and array syntax (p(1:6)=)
     * @private
     */
    function parseParameters(line, pot) {
        // First handle array syntax like p(1:3)= or p(1:6)= or p(1:7)=
        const arrayRegex = /(\w+)\((\d+):(\d+)\)\s*=\s*([\d\.\-\+eE\s]+)/g;
        let arrayMatch;

        while ((arrayMatch = arrayRegex.exec(line)) !== null) {
            const baseKey = arrayMatch[1].toLowerCase();  // e.g., 'p'
            const startIndex = parseInt(arrayMatch[2]);    // e.g., 1
            const endIndex = parseInt(arrayMatch[3]);      // e.g., 6
            const valuesStr = arrayMatch[4].trim();        // e.g., "40.0 1.2 0.65 10.0 1.2 0.5"

            // Split values by whitespace
            const values = valuesStr.split(/\s+/).filter(v => v.length > 0);

            console.log(`  Parsing array syntax: ${baseKey}(${startIndex}:${endIndex}) = [${values.join(', ')}]`);

            // Distribute values to p1, p2, p3, etc.
            for (let i = 0; i < values.length && (startIndex + i) <= endIndex; i++) {
                const paramName = `${baseKey}${startIndex + i}`;
                const value = parseFloat(values[i]);
                if (!isNaN(value)) {
                    pot[paramName] = value;
                    console.log(`    ${paramName} = ${value}`);
                }
            }

            // Remove the matched array syntax from the line to avoid re-processing
            line = line.replace(arrayMatch[0], '');
        }

        // Now handle regular key=value pairs
        const regex = /(\w+)\s*=\s*([^\s=]+(?:\s+[^\s=]+)*?)(?=\s+\w+\s*=|\s*$)/g;
        let match;

        while ((match = regex.exec(line)) !== null) {
            const key = match[1].toLowerCase();
            const value = match[2].trim();

            // Handle boolean values
            if (value === 'T' || value === 't' || value === '.true.' || value === '.TRUE.') {
                pot[key] = true;
            } else if (value === 'F' || value === 'f' || value === '.false.' || value === '.FALSE.') {
                pot[key] = false;
            }
            // Handle numeric values (including multi-value like "6.9 11.0 49.35")
            else if (!isNaN(parseFloat(value))) {
                // Check if it's a multi-value string
                if (value.includes(' ')) {
                    pot[key] = value;  // Keep as string
                } else {
                    pot[key] = parseFloat(value);
                }
            }
            // Handle string values
            else {
                // Remove quotes if present
                pot[key] = value.replace(/^['"]|['"]$/g, '');
            }
        }
    }

    // ============================================================================
    // PUBLIC API - POTENTIAL GENERATION
    // ============================================================================

    /**
     * Generate &POT namelist section from current potentials
     * Supports both individual parameter format (p1= p2=) and array format (p(1:6)=)
     * @param {boolean} useArray - If true, use p(1:N) array syntax; if false, use p1 p2 p3 format
     * @returns {string} Formatted &POT namelists
     */
    function generatePotentialSection(useArray) {
        if (potentials.length === 0) {
            return '! No potentials defined\n';
        }

        // Use provided parameter or fall back to module setting
        const useArrayFormat = useArray !== undefined ? useArray : useArraySyntax;

        let output = '';

        for (let i = 0; i < potentials.length; i++) {
            const pot = potentials[i];

            // Use kp as-is from the potential object
            // Do NOT automatically make the last kp negative
            const kp = pot.kp;

            if (pot.type === 0) {
                // Coulomb potential (TYPE=0) - can use p(1:3) format
                // In FRESCO: p(1:3) for TYPE=0 corresponds to at, ap, rc
                // Values can be stored as either at/ap/rc OR p1/p2/p3
                const val1 = pot.at !== undefined ? pot.at : (pot.p1 !== undefined ? pot.p1 : 0);
                const val2 = pot.ap !== undefined ? pot.ap : (pot.p2 !== undefined ? pot.p2 : 0);
                const val3 = pot.rc !== undefined ? pot.rc : (pot.p3 !== undefined ? pot.p3 : 0);

                if (useArrayFormat) {
                    // Array format: p(1:3)=
                    output += ` &POT kp=${kp} type=0 shape=0 p(1:3)=${val1} ${val2} ${val3}`;
                    if (pot.ac !== undefined && pot.ac !== 0) {
                        output += ` ac=${pot.ac}`;
                    }
                } else {
                    // Individual format: at= ap= rc=
                    output += ` &POT kp=${kp} type=0 at=${val1} ap=${val2} rc=${val3}`;
                    if (pot.ac !== undefined && pot.ac !== 0) {
                        output += ` ac=${pot.ac}`;
                    }
                }
                output += '  /\n';
            } else {
                // Nuclear potential (TYPE>0)
                output += ` &POT kp=${kp} type=${pot.type}`;

                // Add shape
                if (pot.shape !== undefined) {
                    output += ` shape=${pot.shape}`;
                }

                // Add IT parameter
                if (pot.it !== undefined && pot.it !== 0) {
                    output += ` it=${pot.it}`;
                }

                if (useArrayFormat) {
                    // Use array syntax p(1:7)= for parameters
                    const pValues = [];
                    for (let j = 0; j <= 7; j++) {
                        const paramName = j === 0 ? 'p0' : `p${j}`;
                        pValues.push(pot[paramName] !== undefined ? pot[paramName] : 0);
                    }

                    // Determine range based on non-zero values
                    let maxIndex = 7;
                    while (maxIndex > 0 && pValues[maxIndex] === 0) {
                        maxIndex--;
                    }

                    // Always include at least p1-p6 if any are non-zero
                    if (maxIndex < 6 && pValues.slice(1, 7).some(v => v !== 0)) {
                        maxIndex = 6;
                    }

                    if (maxIndex >= 1) {
                        // Determine start index (skip p0 if it's zero)
                        const startIndex = pValues[0] !== 0 ? 0 : 1;
                        const endIndex = maxIndex;

                        // Build the array
                        const arrayValues = pValues.slice(startIndex, endIndex + 1);
                        output += ` p(${startIndex === 0 ? 0 : 1}:${endIndex})=${arrayValues.join(' ')}`;
                    }
                } else {
                    // Use individual parameter syntax p0= p1= p2= ...
                    // Add p0 if non-zero
                    if (pot.p0 !== undefined && pot.p0 !== 0) {
                        output += ` p0=${pot.p0}`;
                    }

                    // Add p1-p6 parameters
                    const params = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
                    for (const param of params) {
                        if (pot[param] !== undefined) {
                            output += ` ${param}=${pot[param]}`;
                        }
                    }

                    // Add p7 if non-zero
                    if (pot.p7 !== undefined && pot.p7 !== 0) {
                        output += ` p7=${pot.p7}`;
                    }
                }

                // Add other special parameters if present
                if (pot.jl !== undefined) output += ` jl=${pot.jl}`;
                if (pot.lshape !== undefined) output += ` lshape=${pot.lshape}`;
                if (pot.xlvary !== undefined) output += ` xlvary=${pot.xlvary}`;
                if (pot.alvary !== undefined) output += ` alvary=${pot.alvary}`;
                if (pot.datafile !== undefined) output += ` datafile='${pot.datafile}'`;

                output += '  /\n';
            }
        }

        return output;
    }

    /**
     * Add a new potential
     * @param {Object} potential - Potential object (optional, uses defaults if not provided)
     */
    function addPotential(potential) {
        if (!potential) {
            // Create default nuclear potential
            potential = {
                kp: 1,
                type: 1,
                shape: 0,
                it: 0,
                p0: 0.0,
                p1: 40.0,
                p2: 1.2,
                p3: 0.65,
                p4: 10.0,
                p5: 1.2,
                p6: 0.5,
                p7: 0.0
            };
        }

        potentials.push(potential);
        potentialCounter++;
        return potentials.length - 1;
    }

    /**
     * Remove a potential by index
     * @param {number} index - Index of potential to remove
     */
    function removePotential(index) {
        if (index >= 0 && index < potentials.length) {
            potentials.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Update a potential by index
     * @param {number} index - Index of potential to update
     * @param {Object} updates - Object with properties to update
     */
    function updatePotential(index, updates) {
        if (index >= 0 && index < potentials.length) {
            Object.assign(potentials[index], updates);
            return true;
        }
        return false;
    }

    /**
     * Get all potentials
     * @returns {Array} Array of potential objects
     */
    function getAllPotentials() {
        return JSON.parse(JSON.stringify(potentials));  // Deep copy
    }

    /**
     * Get a single potential by index
     * @param {number} index - Index of potential
     * @returns {Object|null} Potential object or null
     */
    function getPotential(index) {
        if (index >= 0 && index < potentials.length) {
            return JSON.parse(JSON.stringify(potentials[index]));  // Deep copy
        }
        return null;
    }

    /**
     * Clear all potentials
     */
    function clearPotentials() {
        potentials = [];
        parsedPotentials = null;
        potentialCounter = 0;
    }

    /**
     * Get Coulomb potential parameters
     * @returns {Object|null} Coulomb potential object or null
     */
    function getCoulombPotential() {
        const coulomb = potentials.find(pot => pot.type === 0);
        return coulomb ? JSON.parse(JSON.stringify(coulomb)) : null;
    }

    /**
     * Update Coulomb potential parameters
     * @param {Object} updates - Coulomb potential updates
     */
    function updateCoulombPotential(updates) {
        const index = potentials.findIndex(pot => pot.type === 0);
        if (index >= 0) {
            Object.assign(potentials[index], updates);
        } else {
            // Add Coulomb potential at the beginning
            potentials.unshift({
                kp: 1,
                type: 0,
                at: updates.at || 12.0,
                ap: updates.ap || 4.0,
                rc: updates.rc || 1.2,
                ac: updates.ac || 0.0
            });
        }
    }

    // ============================================================================
    // PUBLIC API - METADATA ACCESS
    // ============================================================================

    function getPotentialTypes() {
        return POTENTIAL_TYPES;
    }

    function getVolumeShapes() {
        return VOLUME_SHAPES;
    }

    function getSurfaceShapes() {
        return SURFACE_SHAPES;
    }

    function getSpecialShapes() {
        return SPECIAL_SHAPES;
    }

    function getDeformationShapes() {
        return DEFORMATION_SHAPES;
    }

    function getITOptions() {
        return IT_OPTIONS;
    }

    /**
     * Get appropriate shapes for a given potential type
     * @param {number} type - Potential TYPE value
     * @returns {Object} Shape definitions object
     */
    function getShapesForType(type) {
        if (type === 1 || type === 8 || type === 15) {
            return VOLUME_SHAPES;
        } else if (type === 2) {
            return SURFACE_SHAPES;
        } else if (type >= 10 && type <= 17) {
            return DEFORMATION_SHAPES;
        } else {
            return VOLUME_SHAPES;  // Default
        }
    }

    // ============================================================================
    // PUBLIC API - UI GENERATION HELPERS
    // ============================================================================

    /**
     * Get options HTML for potential type selector
     * @param {number} selectedType - Currently selected type (optional)
     * @returns {string} HTML options
     */
    function getPotentialTypeOptions(selectedType) {
        let html = '';
        for (const [type, data] of Object.entries(POTENTIAL_TYPES)) {
            if (data.isNuclear === false) continue;  // Skip Coulomb (TYPE=0)
            const selected = (parseInt(type) === selectedType) ? ' selected' : '';
            html += `<option value="${type}"${selected}>${data.label}</option>\n`;
        }
        return html;
    }

    /**
     * Get options HTML for shape selector based on potential type
     * @param {number} potType - Potential TYPE value
     * @param {number} selectedShape - Currently selected shape (optional)
     * @returns {string} HTML options
     */
    function getShapeOptions(potType, selectedShape) {
        const shapes = getShapesForType(potType);
        let html = '';

        for (const [shape, data] of Object.entries(shapes)) {
            const selected = (parseInt(shape) === selectedShape || shape === String(selectedShape)) ? ' selected' : '';
            html += `<option value="${shape}"${selected}>${data.label}</option>\n`;
        }

        // Add special shapes if applicable
        if (potType >= 10 && potType <= 17) {
            // Can also use special shapes
            for (const [shape, data] of Object.entries(SPECIAL_SHAPES)) {
                const shapeNum = parseInt(shape);
                if (shapeNum >= 30) {
                    const selected = (shapeNum === selectedShape) ? ' selected' : '';
                    html += `<option value="${shape}"${selected}>${data.label}</option>\n`;
                }
            }
        }

        return html;
    }

    /**
     * Get options HTML for IT parameter selector
     * @param {number} selectedIT - Currently selected IT (optional)
     * @returns {string} HTML options
     */
    function getITOptions_HTML(selectedIT) {
        let html = '';
        for (const [it, data] of Object.entries(IT_OPTIONS)) {
            const selected = (parseInt(it) === selectedIT) ? ' selected' : '';
            html += `<option value="${it}"${selected}>${data.label}</option>\n`;
        }
        return html;
    }

    // ============================================================================
    // OUTPUT FORMAT CONFIGURATION
    // ============================================================================

    /**
     * Set whether to use array syntax (p(1:6)=) or individual parameters (p1= p2=) for output
     * @param {boolean} useArray - If true, use p(1:N) array syntax; if false, use individual parameters
     */
    function setArraySyntax(useArray) {
        useArraySyntax = !!useArray;
        console.log(`Potential output format: ${useArraySyntax ? 'p(1:N) array syntax' : 'individual parameters (p1, p2, ...)'}`);
    }

    /**
     * Get current array syntax setting
     * @returns {boolean} True if using array syntax, false if using individual parameters
     */
    function getArraySyntax() {
        return useArraySyntax;
    }

    // ============================================================================
    // RETURN PUBLIC API
    // ============================================================================

    return {
        // Initialization
        init,
        loadDefaults,

        // Parsing
        parsePotentials,

        // Generation
        generatePotentialSection,

        // Output format configuration
        setArraySyntax,
        getArraySyntax,

        // CRUD operations
        addPotential,
        removePotential,
        updatePotential,
        getAllPotentials,
        getPotential,
        clearPotentials,

        // Coulomb-specific
        getCoulombPotential,
        updateCoulombPotential,

        // Metadata access
        getPotentialTypes,
        getVolumeShapes,
        getSurfaceShapes,
        getSpecialShapes,
        getDeformationShapes,
        getITOptions,
        getShapesForType,

        // UI helpers
        getPotentialTypeOptions,
        getShapeOptions,
        getITOptions_HTML
    };
})();
