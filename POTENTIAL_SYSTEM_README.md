# FRESCO Potential System

## Overview

A comprehensive, shared potential management system for FRESCO input file generation across all reaction types (elastic, inelastic, transfer, capture). This system provides intelligent handling of &POT namelists based on the FRESCO manual specifications.

## New Files Created

### 1. `assets/js/fresco-potential.js`
Core potential management module providing:
- **Complete TYPE definitions** (0-21): All FRESCO potential types with descriptions
- **Complete SHAPE definitions**: Volume, surface, spin-orbit, tensor, deformation, and special shapes
- **Potential parsing**: Extract &POT namelists from uploaded FRESCO input files
- **Potential generation**: Create properly formatted &POT namelists
- **CRUD operations**: Add, remove, update, and retrieve potentials
- **Metadata access**: Get appropriate shapes for each TYPE

### 2. `assets/js/fresco-potential-ui.js`
UI management module providing:
- **Dynamic card generation**: Create potential cards based on reaction type
- **Event handling**: Add/remove potentials, update parameters
- **Form population**: Automatically populate from parsed files
- **Data extraction**: Collect all potential data for generation
- **Reaction-specific defaults**: Different default potentials for each reaction type

## Features

### Comprehensive Potential TYPE Support

Based on FRESCO manual Section 3.4.2, the system supports all potential types:

- **TYPE 0**: Coulomb potential (radii definition)
- **TYPE 1**: Central potential, Volume
- **TYPE 2**: Central potential, Derivative (surface)
- **TYPE 3-4**: Spin-orbit for projectile/target
- **TYPE 5-7**: Tensor forces (projectile, target, combined)
- **TYPE 8**: Spin·spin force
- **TYPE 9**: Effective mass reduction
- **TYPE 10-17**: Deformation potentials (ROTOR, matrix elements, all-order coupled)
- **TYPE 20-21**: Nucleon-nucleon potentials (SSC, user-supplied)

### Shape Options by TYPE

The system automatically provides appropriate SHAPE options based on selected TYPE:

#### Volume Potentials (TYPE=1, 8, 15)
- 0: Woods-Saxon
- 1: WS squared
- 2: Gaussian
- 3: Yukawa
- 4: Exponential
- 5-6: Reid soft core (T=0, T=1)
- 7-9: Read from external file
- -1: Fourier-Bessel
- -7 to -9: Read from file with rewind

#### Surface Potentials (TYPE=2)
- 0-6: First derivative forms (WS, WS squared, Gaussian, Yukawa, Exponential, Reid soft core)
- 7-9: Read from external file

#### Deformation Potentials (TYPE=10-17)
- 7-9: Read from external file
- 10: Coulomb/Nuclear multipoles
- 11: Nuclear deformation (Gaussian quadrature)
- 12: Nuclear deformation + monopole (with volume conservation)
- 13: Nuclear deformation (no volume correction)

#### Special Shapes (All Types)
- 10-19: Write to output file (SHAPE-10)
- 20-24: J-dependent potentials from file
- 30+: L/J-dependent form factors
- 40: Parity-dependent (P1 for +, P2 for -)
- 41: L-dependent (P(L+1) for L=0-5, P0 for L≥6)
- 42: J-dependent (P(Ji+1) for Ji=0-5, P0 for Ji≥6)

### Reaction-Specific Default Potentials

Each reaction type has optimized default potentials:

#### Elastic Scattering
- Coulomb potential (TYPE=0)
- Volume Woods-Saxon (TYPE=1, SHAPE=0) with real + imaginary parts

#### Inelastic Scattering
- Coulomb potential (TYPE=0)
- Volume Woods-Saxon (TYPE=1, SHAPE=0)
- Deformed target potential (TYPE=11, SHAPE=10)

#### Transfer Reactions
- Coulomb potential (TYPE=0)
- Volume Woods-Saxon (TYPE=1, SHAPE=0) with transfer-specific parameters

#### Capture Reactions
- Coulomb potential (TYPE=0)
- Volume Woods-Saxon (TYPE=1, SHAPE=0) with capture-specific parameters

## File Updates

### Updated HTML Files

#### ✅ elastic.html
- Added `fresco-potential.js` and `fresco-potential-ui.js` script tags
- Replaced manual potential management with `FrescoPotentialUI.init('elastic', ...)`
- Replaced manual &POT generation with `FrescoPotentialUI.generatePotentialSection()`
- **Fully integrated and tested**

#### ✅ inelastic.html
- Added script tags for new modules
- Initialized potential system with `FrescoPotentialUI.init('inelastic', ...)`
- Replaced optical model potential generation (keeps deformation potential separate)
- **Fully integrated and tested**

#### ⚠️ transfer.html
- Added script tags for new modules
- Initialized potential system with `FrescoPotentialUI.init('transfer', ...)`
- **Note**: Transfer reactions use multi-partition potentials (KP=1,2,3,4) which are largely hardcoded
- New system available for additional user-defined potentials, but main generation still uses form fields

#### ⚠️ capture.html
- Added script tags for new modules
- **Note**: Capture.html appears incomplete - no &POT generation found
- New potential system ready for future integration

## Usage

### Initialization

Each HTML page initializes the potential system in its main script:

```javascript
// Example from elastic.html
if (typeof window.FrescoPotentialUI !== 'undefined') {
    window.FrescoPotentialUI.init(
        'elastic',                      // Reaction type
        'potential-container',          // Container ID for nuclear potentials
        'add-potential-btn',            // Add button ID
        'coulomb-potential'             // Coulomb form ID (optional)
    );
    console.log('Potential UI initialized for elastic scattering');
}
```

### Adding Potentials

Users can add potentials by clicking the "Add Nuclear Potential" button. Each potential card includes:
- **Potential Type** selector (all applicable TYPEs)
- **Shape** selector (automatically filtered by TYPE)
- **IT Parameter** (0-3: iterative, no subtract, or both)
- **Real Part Parameters**: P1 (depth), P2 (radius), P3 (diffuseness)
- **Imaginary Part Parameters**: P4 (depth), P5 (radius), P6 (diffuseness)
- **Additional Parameters**: P0 and P7 for specialized potentials

### Generating Output

When users click "Generate Input File", the system:

1. Collects all potential data from the UI
2. Synchronizes with the internal model
3. Generates properly formatted &POT namelists
4. Includes them in the complete FRESCO input file

Example generated output:
```
&POT kp=1 type=0 at=12.0 ap=4.0 rc=1.2  /
&POT kp=1 type=1 shape=0 it=0 p1=40.0 p2=1.2 p3=0.65 p4=10.0 p5=1.2 p6=0.5  /
&pot /
```

### File Upload Integration

When users upload existing FRESCO input files:

1. The system parses all &POT namelists automatically
2. Potentials are extracted with all parameters preserved
3. The UI is populated with the parsed potentials
4. Users can modify and regenerate

Example parsing capabilities:
- Handles Fortran namelist format with `&POT ... /` blocks
- Supports multi-line namelists
- Preserves all parameters (kp, type, shape, it, p0-p7, etc.)
- Handles special parameters (jl, lshape, xlvary, alvary, datafile)

## API Reference

### FrescoPotential (Core Module)

```javascript
// Initialization
FrescoPotential.init(reactionType)
FrescoPotential.loadDefaults()

// Parsing
FrescoPotential.parsePotentials(fileContent)  // Returns array of potentials

// Generation
FrescoPotential.generatePotentialSection()    // Returns formatted &POT namelists

// CRUD Operations
FrescoPotential.addPotential(potentialObject)
FrescoPotential.removePotential(index)
FrescoPotential.updatePotential(index, updates)
FrescoPotential.getAllPotentials()
FrescoPotential.getPotential(index)
FrescoPotential.clearPotentials()

// Coulomb-specific
FrescoPotential.getCoulombPotential()
FrescoPotential.updateCoulombPotential(updates)

// Metadata
FrescoPotential.getPotentialTypes()
FrescoPotential.getShapesForType(type)
FrescoPotential.getITOptions()

// UI Helpers
FrescoPotential.getPotentialTypeOptions(selectedType)
FrescoPotential.getShapeOptions(potType, selectedShape)
FrescoPotential.getITOptions_HTML(selectedIT)
```

### FrescoPotentialUI (UI Module)

```javascript
// Initialization
FrescoPotentialUI.init(reactionType, containerId, addButtonId, coulombFormId)

// Rendering
FrescoPotentialUI.renderAllPotentials(potentials)
FrescoPotentialUI.renumberPotentialCards()

// Data Management
FrescoPotentialUI.extractAllPotentials()
FrescoPotentialUI.syncToModel()

// File Integration
FrescoPotentialUI.loadFromFile(fileContent)
FrescoPotentialUI.resetToDefaults()

// Generation
FrescoPotentialUI.generatePotentialSection()
```

## Potential Object Structure

```javascript
{
    kp: 1,              // Potential number (negative for last potential)
    type: 1,            // TYPE (0-21)
    shape: 0,           // SHAPE (depends on TYPE)
    it: 0,              // IT parameter (0-3)
    p0: 0.0,            // Additional parameter
    p1: 40.0,           // Real depth/strength
    p2: 1.2,            // Real radius
    p3: 0.65,           // Real diffuseness
    p4: 10.0,           // Imaginary depth/strength
    p5: 1.2,            // Imaginary radius
    p6: 0.5,            // Imaginary diffuseness
    p7: 0.0,            // Further parameter
    // Optional special parameters:
    jl: 'J',            // For L/J-dependent potentials
    lshape: 0,          // Form factor shape
    xlvary: 0.0,        // Variation parameter
    alvary: 0.0,        // Variation diffuseness
    datafile: 'file'    // External data file path
}
```

## Implementation Details

### Smart Shape Filtering

The system automatically shows only valid SHAPE options based on the selected TYPE:

```javascript
// Example: When user selects TYPE=2 (surface potential)
// Shape selector automatically updates to show only surface shapes (0-9)

typeSelect.addEventListener('change', function() {
    const potType = parseInt(this.value);
    shapeSelect.innerHTML = FrescoPotential.getShapeOptions(potType, 0);
});
```

### Automatic Parameter Validation

All numeric parameters are validated to prevent NaN and Infinity:

```javascript
function extractPotentialFromCard(card) {
    return {
        kp: 1,
        type: parseInt(card.querySelector('.potential-type')?.value) || 1,
        p1: parseFloat(card.querySelector('.p1')?.value) || 0,
        // ... all parameters checked for valid numbers
    };
}
```

### KP Management

The system automatically handles KP (potential number):
- Sets KP=1 for most potentials
- Automatically negates KP for the last potential in the list
- Maintains proper ordering

```javascript
// In generatePotentialSection():
const kp = isLast && pot.kp > 0 ? -Math.abs(pot.kp) : pot.kp;
```

## Testing

### Syntax Validation
```bash
node -c assets/js/fresco-potential.js
node -c assets/js/fresco-potential-ui.js
```

### Browser Testing
1. Open elastic.html or inelastic.html in a browser
2. Open browser console (F12)
3. Check for initialization messages:
   ```
   Potential UI initialized for elastic scattering
   FRESCO Potential system initialized for elastic reaction
   ```
4. Test adding/removing potentials
5. Test generation of input file
6. Test file upload and parsing

## Future Enhancements

### Potential Improvements
1. **Transfer reaction integration**: Refactor multi-partition handling to use new system
2. **Capture reaction completion**: Implement &POT generation for capture reactions
3. **&STEP namelist support**: Add UI for deformation coupling parameters (TYPE 12-17)
4. **Potential templates**: Add preset potentials (global optical models, etc.)
5. **Visual potential plotting**: Show potential form factors graphically
6. **Parameter constraints**: Add physics-based validation (e.g., radius > 0)

### Advanced Features
1. **Potential library**: Save/load commonly used potential sets
2. **Search functionality**: Search global optical model databases
3. **Auto-fill from literature**: Suggest potentials based on reaction type and energy
4. **Uncertainty propagation**: Show how potential uncertainties affect cross sections

## Troubleshooting

### Common Issues

#### 1. Potentials not appearing
**Symptom**: No potential cards appear after initialization
**Solution**: Check browser console for errors. Verify all script tags are present and in correct order.

#### 2. Generation produces empty &POT section
**Symptom**: Generated file has no potentials
**Solution**: Ensure potentials are added. Check that `generatePotentialSection()` is called correctly.

#### 3. Shape options don't update
**Symptom**: Shape selector doesn't change when TYPE is changed
**Solution**: Verify event handlers are attached. Check that `getShapeOptions()` is being called.

#### 4. File upload doesn't populate potentials
**Symptom**: Uploading a file doesn't show potentials
**Solution**: Check that file contains &POT namelists. Verify parsing function is called in file upload handler.

## Documentation References

### FRESCO Manual Sections
- **Section 3.4**: &pot namelist documentation
- **Section 3.4.1**: First kind of &pot namelist (TYPE=0)
- **Section 3.4.2**: Second kind of &pot namelist (TYPE>0)
- **Section 3.4.3**: Deformations (TYPE≥10)
- **Section 3.4.4**: Pairwise couplings (TYPE 12-17)

### Related Files
- `fresco-namelist.js`: FRESCO parameter definitions
- `fresco-common.js`: File parsing utilities
- `fresco-partition-states.js`: &PARTITION and &STATES handling

## License and Credits

Part of the FRESCO Input File Generator web application.
Original FRESCO code: I. Thompson (https://github.com/I-Thompson/fresco)

---

**Last Updated**: 2025-10-22
**Version**: 1.0
**Author**: Jin Lei
