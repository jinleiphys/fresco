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
- `fresco-namelist.js` - Complete definition of all 84 FRESCO namelist parameters with metadata (tooltips, defaults, types, validation)
- `fresco-parameter-manager.js` - Dynamic parameter categorization system
- `fresco-common.js` - File parsing, form population utilities, and theme management
- `fresco-integration.js` - UI integration and event handling
- `fresco-shared-components.js` - Shared HTML components (footer, theme toggle, home link) that are dynamically injected

All HTML files load these five JavaScript files in order. The shared components file automatically injects common elements (footer, theme toggle, home link) into all pages when the DOM loads, eliminating code duplication.

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
- `FrescoParameterManager.getCurrentCategorization()` - Get current general/advanced lists
- `FrescoNamelist.getAllFormData()` - Extract all parameter values from form
- `FrescoNamelist.generateNamelistSection(formData)` - Generate &FRESCO namelist text

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

## Common Pitfalls

1. **Parameter Count Mismatch**: Always ensure General + Advanced = 84 total parameters. The system validates this automatically.

2. **Default Value Handling**: Parameters with `default: null` are NOT written to output unless user provides a value. Parameters with specific defaults (e.g., `default: 0.1`) are only written if the user changes them.

3. **Script Load Order**: The five JavaScript files must be loaded in this exact order:
   - `fresco-namelist.js` (defines parameters)
   - `fresco-parameter-manager.js` (categorization logic)
   - `fresco-common.js` (parsing utilities and theme management)
   - `fresco-integration.js` (UI binding)
   - `fresco-shared-components.js` (shared HTML components injection)

4. **Namelist Format**: FRESCO is strict about namelist format. Always use `parameter=value` (no spaces around `=`) and terminate with `/` on a new line.

## File Upload Feature

Each HTML page includes file upload capability that:
1. Parses existing FRESCO input files (`.in`, `.inp`, `.txt`)
2. Extracts all &FRESCO namelist parameters
3. Dynamically reorganizes General/Advanced sections
4. Populates form fields with values from file
5. Adds visual "From File" badges to indicate source

This allows users to load, modify, and regenerate FRESCO input files easily.
