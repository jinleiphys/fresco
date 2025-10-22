# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web-based input file generator for the FRESCO nuclear reaction code. FRESCO is a coupled-channels scattering code used for nuclear physics calculations. The project provides a user-friendly HTML/JavaScript interface for generating FRESCO input files for various reaction types without requiring manual editing of complex namelist files.

The original FRESCO code (Fortran) is at https://github.com/I-Thompson/fresco

## Core Architecture

### Web Application Structure

The application consists of reaction-type-specific HTML pages that share common JavaScript modules:

**HTML Pages (Reaction Types):**
- `index.html` - Landing page with links to each reaction type
- `elastic.html` - Elastic scattering calculations
- `inelastic.html` - Inelastic scattering (excitation)
- `transfer.html` - Transfer reactions
- `capture.html` - Capture reactions
- `breakup.html` - Breakup/CDCC calculations

**Shared JavaScript Modules (`assets/js/`):**
- `fresco-namelist.js` - Complete definition of 92 parameters (84 FRESCO + 7 CDCC-specific + 1 alias) with metadata (tooltips, defaults, types, validation)
- `fresco-parameter-manager.js` - Dynamic parameter categorization system (object, not a constructor)
- `fresco-parameter-ui.js` - Shared UI for parameter management and smart parameter collection
- `fresco-partition-states.js` - Shared helper for &PARTITION and &STATES namelist generation
- `fresco-potential.js` - Comprehensive potential management (all 22 FRESCO potential TYPEs and SHAPEs)
- `fresco-potential-ui.js` - Dynamic potential card UI generation and management
- `fresco-common.js` - File parsing, form population utilities, and theme management
- `fresco-integration.js` - UI integration and event handling
- `fresco-shared-components.js` - Shared HTML components (footer, theme toggle, home link) dynamically injected into all pages
- `fresco-generator.js` - Shared input file generation functions (copy to clipboard, download file, button initialization)
- `fresco-breakup.js` - **CDCC-specific** JavaScript for breakup.html (file upload, J-intervals, bins, input generation)

Most HTML files load the first ten JavaScript files. `breakup.html` additionally loads `fresco-breakup.js` which contains all CDCC-specific logic in a separate 767-line module to keep the HTML clean (reduced from 1607 to 1041 lines).

### Dynamic Parameter System

The application implements a sophisticated dynamic parameter management system that organizes the 84 FRESCO namelist parameters into General and Advanced sections:

**Default State (no file loaded):**
- General section: 12 core parameters always visible (`hcm`, `rmatch`, `jtmax`, `absend`, `thmin`, `thmax`, `thinc`, `elab`, `iter`, `chans`, `smats`, `xstabl`)
- Advanced section: Remaining 72 parameters organized by category

**Dynamic State (after loading input file):**
- Parameters found in the uploaded input file are automatically promoted from Advanced to General section
- This ensures users see the most relevant parameters for their specific calculation
- The sum always equals 84 (total FRESCO parameters)
- Parameters from file get "From File" visual badges

**Key Functions:**
- `FrescoParameterManager.init()` - Initialize with default categorization
- `FrescoParameterManager.updateCategorizationFromInputFile(params)` - Promote parameters to General section
- `FrescoParameterManager.getCurrentCategorization()` - Get current general/advanced lists with full metadata
- `FrescoParameterManager.moveParameter(paramName, toGeneral)` - Move parameter between sections
- `FrescoParameterManager.resetToDefaults()` - Reset to default categorization
- `FrescoParameterUI.init(defaultGeneralParams)` - Initialize UI with reaction-specific defaults
- `FrescoParameterUI.getAllFrescoParameters()` - **Smart collection** of all FRESCO parameters from form
- `FrescoParameterUI.ensureGeneralParameterFields()` - Create form fields for promoted parameters
- `FrescoNamelist.getAllFormData()` - Extract all parameter values from form
- `FrescoNamelist.generateNamelistSection(formData)` - Generate &FRESCO namelist text

### Partition & States System

The application includes a shared helper module for generating &PARTITION and &STATES namelists:

**Key Features:**
- **Smart data handling** - Automatically uses parsed data from uploaded files when available
- **Form data fallback** - Generates from form fields when no file is uploaded
- **Multi-state support** - Properly handles inelastic scattering with multiple excited states
- **Clean parsing** - Silently stores advanced partition/states parameters without console errors

**Key Functions:**
- `FrescoPartitionStates.generateSingle(namep, massp, zp, jp, namet, masst, zt, jt, qval)` - Generate single partition (elastic, inelastic)
- `FrescoPartitionStates.generateTwoPartitions(partition1, partition2)` - Generate two partitions (transfer, capture)
- `FrescoPartitionStates.generateFromData(partitions)` - Generate from custom partition array
- `FrescoPartitionStates.clearParsedData()` - Clear cached data from uploaded files

**Parsing Behavior:**
- When a file is uploaded, partition/states data is stored in `window.parsedPartitionStatesData`
- Only basic fields (projectile, target, mass, charge, spin) are populated in the UI
- Advanced parameters (nex, pwf, copyp, bandp, ep, et, etc.) are silently preserved
- On regeneration, if parsed data exists, it's used with all original parameters intact
- If no parsed data, simple defaults are generated from form fields

### Potential Management System

The application includes a comprehensive potential management system for &POT namelists, supporting all 22 FRESCO potential types and shapes based on the FRESCO manual (Section 3.4).

**Key Features:**
- **Complete TYPE support** - All potential types (0-21): Coulomb, central, spin-orbit, tensor, deformation, nucleon-nucleon
- **Smart SHAPE filtering** - Automatically shows only valid shapes for each TYPE
- **Reaction-specific defaults** - Each reaction type loads optimized default potentials
- **File parsing** - Automatically parses &POT namelists from uploaded files
- **Dynamic UI** - Add/remove potential cards with live validation

**Key Modules:**
- `fresco-potential.js` - Core potential logic (definitions, parsing, generation, CRUD operations)
- `fresco-potential-ui.js` - UI management (card generation, event handling, form population)

**Potential TYPE Definitions:**
- **TYPE 0**: Coulomb potential (radii definition)
- **TYPE 1**: Central potential, Volume
- **TYPE 2**: Central potential, Derivative (surface)
- **TYPE 3-4**: Spin-orbit for projectile/target
- **TYPE 5-7**: Tensor forces (projectile, target, combined)
- **TYPE 8**: Spin·spin force
- **TYPE 9**: Effective mass reduction
- **TYPE 10-17**: Deformation potentials (ROTOR, matrix elements, all-order coupled)
- **TYPE 20-21**: Nucleon-nucleon potentials (SSC, user-supplied)

**SHAPE Options by TYPE:**
- **Volume (TYPE=1,8,15)**: Woods-Saxon (0), WS squared (1), Gaussian (2), Yukawa (3), Exponential (4), Reid soft core (5-6), Read from file (7-9), Fourier-Bessel (-1)
- **Surface (TYPE=2)**: First derivative forms (0-6), Read from file (7-9)
- **Deformation (TYPE≥10)**: Read from file (7-9), Coulomb/Nuclear multipoles (10), Gaussian quadrature (11-13)
- **Special**: Write to file (10-19), J-dependent (20-24), L/J-dependent (30+), Parity/L/J-dependent (40-42)

**Key Functions:**
- `FrescoPotential.init(reactionType)` - Initialize for specific reaction type
- `FrescoPotential.parsePotentials(fileContent)` - Parse &POT namelists from file
- `FrescoPotential.generatePotentialSection()` - Generate formatted &POT output
- `FrescoPotential.addPotential(potentialObj)` - Add new potential
- `FrescoPotential.updateCoulombPotential(updates)` - Update Coulomb potential
- `FrescoPotentialUI.init(type, containerId, addBtnId, coulombFormId)` - Initialize UI
- `FrescoPotentialUI.generatePotentialSection()` - Generate &POT section for output
- `FrescoPotentialUI.loadFromFile(fileContent)` - Load potentials from uploaded file

**Integration Example** (from `elastic.html`):
```javascript
// Initialize potential system
window.FrescoPotentialUI.init(
    'elastic',                      // Reaction type
    'potential-container',          // Container ID
    'add-potential-btn',            // Add button ID
    'coulomb-potential'             // Coulomb form ID
);

// In generateInputFile():
const potentialSection = window.FrescoPotentialUI.generatePotentialSection();
```

**Potential Object Structure:**
```javascript
{
    kp: 1,              // Potential number (negative for last)
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
    p7: 0.0             // Further parameter
}
```

**Reaction-Specific Integration:**
- **elastic.html**: Fully integrated - uses `FrescoPotentialUI` for all potential management
- **inelastic.html**: Fully integrated - optical model potentials use new system, deformation potential separate
- **transfer.html**: Partially integrated - multi-partition potentials (KP=1,2,3,4) remain hardcoded, new system available for additional potentials
- **capture.html**: Ready for integration - script tags added, awaiting implementation
- **breakup.html**: Not integrated - uses different namelist structure

**Important Notes:**
- The system automatically sets KP negative for the last potential in the list
- Shape options are dynamically filtered based on selected TYPE
- All parameters are validated (no NaN or Infinity values)
- Parsing preserves all parameters including special ones (jl, lshape, xlvary, alvary, datafile)
- See `POTENTIAL_SYSTEM_README.md` for comprehensive documentation

### CDCC/Breakup-Specific Features

The `breakup.html` page implements CDCC (Continuum-Discretized Coupled-Channels) calculations with specialized functionality handled by `fresco-breakup.js`.

**Key Differences from Other Reaction Types:**
- Uses `&CDCC` namelist instead of `&FRESCO` namelist
- Requires `&NUCLEUS`, `&BIN`, and `&POTENTIAL` namelists with different structures
- Has CDCC-specific parameter aliases (cdccc, q, ncoul, reor, qc, la, iscgs, ipcgs)
- Includes 7 additional CDCC-specific parameters in `fresco-namelist.js`

**CDCC-Specific Parameters (17 essential for General section):**
```javascript
// Integration and matching
'hcm', 'rmatch', 'rasym', 'hktarg'

// Accuracy and convergence
'accrcy', 'absend'

// Angular distribution
'thmin', 'thmax', 'thinc'

// Energy
'elab'

// Output control
'smats', 'chans', 'xstabl'

// Cutoffs
'cutr'

// CDCC-specific
'nk', 'cdcc'

// Iteration
'iter'
```

**CDCC Parameter Aliases:**
The `&CDCC` namelist uses different names for some parameters compared to `&FRESCO`:
- `cdccc` (CDCC) ← `cdcc` (FRESCO)
- `q` ← `ip1` (projectile single-particle couplings)
- `ncoul` ← `ip2` (nuclear/Coulomb selection)
- `reor` ← `ip3` (diagonal/off-diagonal couplings)
- `qc` ← `ip4` (Qmax for deformed core potential multipoles)
- `la` ← `ip5` (Lmax for multipole orders)
- `iscgs` ← `isc` (ground state overlap)
- `ipcgs` ← `ipc` (ground state overlap)

**Dynamic J-Value Intervals:**
The Angular Momentum Settings section allows users to dynamically add/remove J-interval definitions:
- Default: 4 intervals (0→4, 60→5, 200→20, 2500→0)
- Users can add unlimited custom intervals via "Add J-Interval" button
- Each interval can be removed individually
- Generates `jbord` and `jump` arrays for &CDCC namelist

**CDCC File Upload Handler:**
`fresco-breakup.js` includes a specialized file upload handler (`handleCDCCFileUpload`) that:
1. Parses `&CDCC` namelist with alias mapping
2. Parses `&NUCLEUS` namelists (Projectile, Core, Valence, Target)
3. Parses `&BIN` namelists and dynamically creates bin cards
4. Populates all form fields including nucleus properties and potentials
5. Updates parameter manager to promote file parameters to General section
6. Handles empty &BIN / terminators correctly

**CDCC Potential Parameters:**
All 5 potential sections include complete parameter sets:
- **Projectile-Target** (Coulomb): a1, a2, rc
- **Core-Target**: a1, a2, rc, V, vr0, a, W, wr0, aw
- **Valence-Target**: a1, a2, rc, V, vr0, a, W, wr0, aw
- **Core-Valence Ground State**: a1, a2, rc, v, vr0, a, vso, rso0, aso
- **Core-Valence Excited States**: a1, a2, rc, v, vr0, a, vso, rso0, aso

**fresco-breakup.js Module Structure:**
```javascript
document.addEventListener('DOMContentLoaded', function() {
    // 1. CDCC parameter configuration (17 essential params)
    // 2. Parameter management functions (updateParameterDisplay, etc.)
    // 3. Initialization (parameter UI, parameter manager, chevron toggle)
    // 4. Bins management (add/remove continuum bins)
    // 5. J-intervals management (add/remove J-intervals)
    // 6. CDCC file upload handler (parseCDCCFile, parseNucleusNamelists, parseBinNamelists)
    // 7. CDCC namelist generation (generateCdccNamelist with alias mapping)
    // 8. Input file generation (window.generateInputFile)
    // 9. Default initialization (3 bins, 4 J-intervals)
});
```

**Important Implementation Details:**
- All code wrapped in DOMContentLoaded to ensure DOM is ready
- Functions defined before use to avoid hoisting issues
- Null checks on all DOM element access to prevent errors
- Duplicate function definitions removed for clean code organization
- File reduced from 1607 lines (HTML+JS embedded) to 1041 lines (HTML only) + 767 lines (fresco-breakup.js)

### FRESCO Namelist Structure

FRESCO input files use Fortran namelist format with several required sections:

```
&FRESCO
  ! 84 possible parameters organized into categories:
  ! - Radial Coordinates (hcm, rmatch, rintp, etc.)
  ! - Angular Momentum (jtmin, jtmax, absend, etc.)
  ! - Accuracy (accrcy, switch, etc.)
  ! - Output Control (chans, smats, xstabl, etc.)
  ! - Numerous other specialized parameters
/

&PARTITION
  ! Define projectile and target
  namep='name' massp=X zp=Y jp=Z
  namet='name' masst=X zt=Y jt=Z
/

&STATES
  ! Define quantum states for each partition
/

&POTENTIAL
  ! Define optical model or coupling potentials
/

&COUPLING
  ! Define couplings between channels
/
```

Only non-default parameters should be written to the &FRESCO section to keep input files clean.

## Development Workflow

### Testing HTML Pages

Open any HTML file directly in a browser:
```bash
open elastic.html
# or
open inelastic.html
```

No build process required - this is a pure client-side web application.

### Testing JavaScript Modules

Run the provided test/demo scripts with Node.js:
```bash
node demo_dynamic_parameters.js       # Test dynamic parameter categorization
node demo_parameter_movement.js       # Test parameter movement between sections
node test_core_functionality.js       # Test core namelist generation
node test_no_defaults.js              # Test default value handling
node test_rintp_simple.js             # Test specific parameter (rintp)
```

### Viewing Test HTML Pages

Several test pages demonstrate specific functionality:
```bash
open test_dynamic_parameters.html     # Visual test of dynamic parameters
open test_parameter_movement.html     # Visual test of parameter movement
open test_selector_fix.html           # Test CSS selectors
open test_no_defaults_visual.html     # Test default handling UI
```

## Fortran Source Code

The `source/` directory contains the original FRESCO Fortran code:
- Main program: `fresco.f`, `fresco_std.f`
- Core modules: `frxx0.f` through `frxx13.f` (numbered modules)
- Utilities: `coulfg.f` (Coulomb functions), `cdc.f` (CDCC), `bpmfus.f` (fusion)
- Build with: utilities in `source/`, but no Makefile (compile scripts exist: `compile-ftn95.bat`, `fr-salf.link`)

The `util/` directory contains post-processing utilities (50+ Fortran programs) with a Makefile configured for g95/f90 compilers.

The `test/` directory contains example input files (`.nin` format) for various reactions.

## Key Implementation Details

### Adding a New FRESCO Parameter

1. Add definition to `fresco-namelist.js` in the appropriate category:
```javascript
categories: {
  categoryName: {
    parameters: {
      paramName: {
        label: "Display name",
        tooltip: "Description from FRESCO manual",
        type: "number", // or "text", "checkbox"
        default: null,  // or specific value
        step: 0.1,      // for number inputs
        min: 0          // optional minimum
      }
    }
  }
}
```

2. The parameter will automatically be included in:
   - Advanced section (unless added to defaultGeneralParams in `fresco-parameter-manager.js`)
   - Form generation
   - Namelist output generation
   - Dynamic categorization system

### Modifying Parameter Categorization

Edit `defaultGeneralParams` array in `fresco-parameter-manager.js:8-11` to change which parameters appear in the General section by default.

### Working with Potentials

The potential system is designed to be integrated into HTML pages with minimal code:

**Initialization:**
```javascript
// In page initialization (after DOMContentLoaded)
window.FrescoPotentialUI.init(
    'elastic',                  // Reaction type: 'elastic', 'inelastic', 'transfer', or 'capture'
    'potential-container',      // ID of container div for nuclear potential cards
    'add-potential-btn',        // ID of "Add Nuclear Potential" button
    'coulomb-potential'         // ID of Coulomb potential form (optional, can be null)
);
```

**Generation:**
```javascript
// In window.generateInputFile() function
const potentialSection = window.FrescoPotentialUI.generatePotentialSection();

// Include in output
let inputContent = `${header}
NAMELIST
${namelistSection}

${partitionStatesSection}
${potentialSection}`;
```

**File Upload Integration:**
```javascript
// In file upload handler (after parsing file content)
window.FrescoPotentialUI.loadFromFile(fileContent);
```

**Adding Custom Potential Types:**
To add new potential types or shapes, edit the definitions in `fresco-potential.js`:
- `POTENTIAL_TYPES` object for new TYPEs
- `VOLUME_SHAPES`, `SURFACE_SHAPES`, etc. for new SHAPEs
- `DEFAULT_POTENTIALS` object for reaction-specific defaults

The UI will automatically update to include new options.

### Form Population from Input Files

The file parsing in `fresco-common.js` uses regex to extract namelist parameters:
- Supports Fortran namelist format with `&FRESCO ... /` blocks
- Handles comments (lines starting with `!`)
- Parses key=value pairs
- Automatically populates form fields matching parameter names

### Shared Components System

The `fresco-shared-components.js` file centralizes all common HTML elements to eliminate code duplication across pages:

**Auto-injected Components:**
- **Footer**: Contains project information, contact details, and resource links
- **Theme Toggle Button**: Dark/light mode switcher in the top-right corner
- **Home Link**: Navigation button to return to index (only on non-index pages)

**How it Works:**
1. Each HTML file loads `fresco-shared-components.js` in the `<head>`
2. On `DOMContentLoaded`, the script automatically injects these elements into the page
3. The script detects if it's the index page and skips the home link injection accordingly

**Modifying Shared Components:**
To update the footer, theme toggle, or home link across all pages, edit `fresco-shared-components.js`. Changes will automatically apply to all HTML files.

**Helper Functions:**
- `FrescoSharedComponents.createHeader(icon, title, subtitle)` - Generate standard page headers
- `FrescoSharedComponents.createUploadSection(formType)` - Generate file upload UI
- `FrescoSharedComponents.createActionButtons(formType)` - Generate action buttons (Generate, Copy, Download)

### Input File Generation System

The `fresco-generator.js` file provides shared functionality for all reaction types:

**Shared Functions (used by all pages):**
- `FrescoGenerator.copyToClipboard()` - Copy generated input to clipboard with visual feedback
- `FrescoGenerator.downloadInputFile()` - Download generated input as .in file
- `FrescoGenerator.initializeButtons()` - Auto-wires button click handlers on page load

**Page-Specific Functions:**
Each HTML page defines its own `window.generateInputFile()` function with reaction-specific logic:
- `elastic.html` - Generates elastic scattering input with &POT sections
- `inelastic.html` - Generates inelastic input with excited states
- `transfer.html` - Generates transfer input with overlaps
- `capture.html` - Generates capture input with EM transitions
- `breakup.html` - Generates CDCC breakup input with continuum bins

**Important:** `FrescoParameterManager` is an object (use `window.FrescoParameterManager.init()`), NOT a constructor (don't use `new`).

## Common Pitfalls

1. **Parameter Count Mismatch**: Always ensure General + Advanced = 84 total parameters. The system validates this automatically.

2. **Default Value Handling**: Parameters with `default: null` are NOT written to output unless user provides a value. Parameters with specific defaults (e.g., `default: 0.1`) are only written if the user changes them.

3. **Value Validation**: All numeric parameter collection includes NaN and Infinity checks:
   - Empty form fields are skipped (not written as `parameter=NaN`)
   - Invalid numeric values (NaN, Infinity) are automatically filtered out
   - Validation happens in three places: parameter collection, namelist generation, and file parsing
   - Use `window.getAllFrescoParameters()` to ensure proper validation

4. **Script Load Order**: The JavaScript files must be loaded in this exact order:
   - `fresco-namelist.js` (defines 92 parameters including CDCC-specific)
   - `fresco-parameter-manager.js` (categorization logic - note: it's an object, NOT a constructor)
   - `fresco-parameter-ui.js` (parameter UI and smart collection)
   - `fresco-common.js` (parsing utilities and theme management)
   - `fresco-integration.js` (UI binding)
   - `fresco-generator.js` (shared generation functions and button handlers)
   - `fresco-partition-states.js` (partition/states helper)
   - `fresco-potential.js` (potential definitions, parsing, generation)
   - `fresco-potential-ui.js` (potential card UI management)
   - `fresco-shared-components.js` (shared HTML components injection)
   - `fresco-breakup.js` (**breakup.html only** - CDCC-specific logic loaded via DOMContentLoaded)

5. **Namelist Format**: FRESCO is strict about namelist format. Always use `parameter=value` (no spaces around `=`) and terminate with `/` on a new line.

## File Upload Feature

Each HTML page includes file upload capability that:
1. Parses existing FRESCO input files (`.in`, `.inp`, `.txt`)
2. Extracts all &FRESCO namelist parameters
3. Dynamically reorganizes General/Advanced sections
4. **Automatically creates form fields** for promoted parameters with values
5. Populates form fields with values from file
6. Adds visual "From File" badges to indicate source

This allows users to load, modify, and regenerate FRESCO input files easily.

### File Parsing Features

The parser in `fresco-common.js` handles:
- **Fortran Comments**: Only `C ` or `c ` followed by space (NOT `centre=`, `cutc=`, etc.)
- **Multi-Value Parameters**: Space-separated values (e.g., `elab=6.9 11.0 49.35`)
- **Terminator Handling**: Parameters on same line as `/` (e.g., `cutc=20 /`)
- **Array Parameters**: Fortran array syntax like `p(1:3)=`
- **Value Preservation**: Multi-value strings preserved throughout collection and generation
- **Partition/States Handling**: Silently stores advanced parameters (nex, pwf, copyp, bandp, ep, et, etc.) for perfect roundtrip
- **POT Namelist Parsing**: `fresco-potential.js` parses all &POT namelists with all parameters (kp, type, shape, it, p0-p7, jl, lshape, xlvary, alvary, datafile)
- **Clean Console Output**: No error messages for expected missing fields in partition/states/pot namelists

### Smart Parameter Collection

Use `window.getAllFrescoParameters()` to collect ALL FRESCO parameters from any page:

```javascript
// In generateInputFile() function - replaces ~60 lines of code!
const allFrescoParams = window.getAllFrescoParameters();
Object.assign(formData, allFrescoParams);
```

This function automatically collects from:
- General FRESCO Parameters section (default + dynamically added)
- Advanced parameter sections (if opened)
- Uploaded input file parameters
- Handles multi-value parameters correctly (elab, ek, etc.)
- Parses types correctly (number, boolean, string)

**Example Usage** (see `elastic.html:764-770`):
```javascript
const allFrescoParams = window.getAllFrescoParameters();
Object.assign(formData, allFrescoParams);
```

### Inelastic Scattering with Multiple Excited States

The `inelastic.html` page properly handles multiple target excited states:

**How it works:**
1. User defines excited states in the Target States section
2. Each state has: spin (Jt), parity, and excitation energy
3. On generation, all states are collected and included in &STATES namelists

**Example Code** (from `inelastic.html:1537-1578`):
```javascript
// Collect all target excited states
const targStateSpins = document.querySelectorAll('.targ-state-spin');
const targStateParities = document.querySelectorAll('.targ-state-parity');
const targStateEnergies = document.querySelectorAll('.targ-state-energy');

// Create states array with correct nex value
const nex = targStateSpins.length;
const states = [];
for (let i = 0; i < targStateSpins.length; i++) {
    states.push({
        jp: 0, copyp: i === 0 ? 0 : 1, bandp: 1, ep: 0.0,
        jt: spin, copyt: 0, bandt: parity > 0 ? 1 : -1, et: energy
    });
}

// Generate with all states
const partitionStatesSection = window.FrescoPartitionStates.generateFromData([{
    namep, massp, zp, jp, namet, masst, zt, jt,
    nex: nex, qval: 0, pwf: true,
    states: states
}]);
```

**Output format:**
```
&PARTITION namep='alpha' massp=4.00 zp=2 namet='12C' masst=12.0 zt=6 nex=2 pwf=T /
&STATES jp=0 copyp=0 bandp=1 ep=0.0 jt=0.0 copyt=0 bandt=1 et=0.0 /
&STATES jp=0 copyp=1 bandp=1 ep=0.0 jt=2.0 copyt=0 bandt=1 et=4.44 /
&PARTITION /
```

## FRESCO Parameter Management UI

The FRESCO Parameter Management card is **collapsible and collapsed by default** to provide a cleaner interface:

### UI Features:
- **Collapsed by default** - Advanced users can click to expand
- **Clickable header** - Click "FRESCO Parameter Management" to toggle
- **Visual feedback** - Chevron icon rotates (▼ collapsed, ▲ expanded)
- **Smooth animation** - Bootstrap collapse transition
- **Consistent across pages** - Same behavior on all reaction types

### Implementation:
Each page initializes with reaction-specific default general parameters:

```javascript
// Example from elastic.html
const elasticDefaultGeneralParams = [
    'hcm', 'rmatch', 'jtmax', 'absend',
    'thmin', 'thmax', 'thinc',
    'elab', 'iter',
    'chans', 'smats', 'xstabl'
];

window.FrescoParameterUI.init(elasticDefaultGeneralParams);
```

Different reaction types can have different default parameters:
- **Elastic**: 12 basic scattering parameters
- **Inelastic**: 13 parameters (includes `iblock` for coupled channels)
- **Transfer**: Can include transfer-specific parameters
- **Capture**: Can include EM transition parameters
- **Breakup**: **NOTE**: Uses different namelist structure - requires special treatment

### User Workflow:
1. User loads page → Parameter Management card is **hidden**
2. User uploads file → Parameters auto-populate in General FRESCO Parameters section
3. User can expand Parameter Management to:
   - Move parameters between General/Advanced
   - Reset to defaults
   - View current categorization state
- breakup.html is different, one need to use special treatment

## Additional Documentation

For comprehensive information about specific systems, see:
- **`POTENTIAL_SYSTEM_README.md`** - Complete documentation of the potential management system including:
  - All 22 potential TYPE definitions with formulas
  - Shape options for each TYPE
  - API reference for both modules
  - Integration examples
  - Troubleshooting guide
  - FRESCO manual references