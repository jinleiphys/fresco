# FRESCO Dynamic Parameter System

## 🎯 Overview

The FRESCO Dynamic Parameter System automatically organizes the complete set of 84 FRESCO namelist parameters into **General** and **Advanced** sections based on input file content. This provides a clean, adaptive user interface that shows the most relevant parameters prominently.

## 🔧 How It Works

### **Default State (No Input File)**
- **General Section**: 12 core parameters always visible
  - `hcm`, `rmatch`, `jtmax`, `absend`, `thmin`, `thmax`, `thinc`, `elab`, `iter`, `chans`, `smats`, `xstabl`
- **Advanced Section**: 72 additional parameters organized by category

### **Dynamic State (Input File Loaded)**
- **General Section**: Core parameters + any parameters found in the input file
- **Advanced Section**: Remaining parameters not in General section
- **Visual Indicators**: Parameters from input file get "From File" badges

## 📁 Files Structure

```
assets/js/
├── fresco-namelist.js          # Parameter definitions and configuration
├── fresco-parameter-manager.js  # Dynamic categorization logic
├── fresco-common.js            # File parsing and form population
└── fresco-integration.js       # UI integration and event handling
```

## 🔄 System Flow

1. **Initialization**: Default categorization is set
2. **File Upload**: Input file is parsed for FRESCO parameters
3. **Dynamic Categorization**: Parameters are moved to appropriate sections
4. **UI Update**: Form fields are created/updated to reflect new categorization
5. **Form Population**: Values from input file populate the form fields

## 🚀 Example Usage

### Before File Upload:
```
General Parameters (12): hcm, rmatch, jtmax, absend, thmin, thmax, thinc, elab, iter, chans, smats, xstabl
Advanced Parameters (72): rintp, hnl, rnl, centre, hnn, rnn, rmin, rsp, cutl, cutr, cutc, rasym, accrcy, switch, sinjmax, ajswtch, jtmin, jump, jbord, pset, jset, iso, llmax, kqmax, pp, koords, nearfa, inh, nnu, maxl, minl, mtmin, epc, erange, dk, plane, rela, unitmass, finec, pel, exl, lab, lin, lex, nlab, ips, it0, fatal, iblock, pade, nosol, dry, smallchan, smallcoup, hort, rmort, psiren, initwf, listcc, treneg, cdetr, nlpl, waves, lampl, veff, kfus, nfus, wdisk, bpm, melfil, cdcc, tmp
```

### After Loading Input File with Advanced Parameters:
```
General Parameters (18): hcm, rmatch, jtmax, absend, thmin, thmax, thinc, elab, iter, chans, smats, xstabl, accrcy, rasym, koords, kqmax, switch, ajswtch
Advanced Parameters (66): rintp, hnl, rnl, centre, hnn, rnn, rmin, rsp, cutl, cutr, cutc, sinjmax, jtmin, jump, jbord, pset, jset, iso, llmax, pp, nearfa, inh, nnu, maxl, minl, mtmin, epc, erange, dk, plane, rela, unitmass, finec, pel, exl, lab, lin, lex, nlab, ips, it0, fatal, iblock, pade, nosol, dry, smallchan, smallcoup, hort, rmort, psiren, initwf, listcc, treneg, cdetr, nlpl, waves, lampl, veff, kfus, nfus, wdisk, bpm, melfil, cdcc, tmp
```

**Parameters Moved to General**: `accrcy`, `rasym`, `koords`, `kqmax`, `switch`, `ajswtch`

## 📊 Key Features

### ✅ **Complete Parameter Coverage**
- All 84 FRESCO namelist parameters are managed
- No parameters are lost or excluded
- Maintains sum: General + Advanced = Total (84)

### ✅ **Intelligent Categorization**
- Default: Common parameters in General section
- Dynamic: Input file parameters promoted to General
- Adaptive: UI updates automatically

### ✅ **Visual Feedback**
- "From File" badges on parameters from input files
- Clear section organization
- Expandable/collapsible Advanced sections

### ✅ **Seamless Integration**
- Works with all reaction types (elastic, inelastic, transfer, capture)
- Maintains backward compatibility
- No changes to existing form structure

## 🔧 API Reference

### FrescoParameterManager

```javascript
// Initialize with default categorization
FrescoParameterManager.init()

// Update categorization based on input file parameters
FrescoParameterManager.updateCategorizationFromInputFile(['hcm', 'rmatch', 'accrcy', 'rasym'])

// Get current categorization
const categorization = FrescoParameterManager.getCurrentCategorization()
// Returns: { general: [...], advanced: [...] }

// Check parameter location
const isGeneral = FrescoParameterManager.isInGeneralSection('hcm')
const isAdvanced = FrescoParameterManager.isInAdvancedSection('accrcy')

// Get all parameter values from form
const allValues = FrescoParameterManager.getAllParameterValues()
```

### FrescoNamelist

```javascript
// Get all form data including dynamic parameters
const formData = FrescoNamelist.getAllFormData()

// Generate namelist with dynamic categorization
const namelist = FrescoNamelist.generateNamelistSection(formData)
```

## 🎉 Benefits

1. **User Experience**: Most relevant parameters are always visible
2. **Efficiency**: Reduces need to search through Advanced sections
3. **Flexibility**: Adapts to different input file structures
4. **Completeness**: Ensures all FRESCO parameters are accessible
5. **Maintainability**: Centralized parameter management

## 🧪 Testing

Run the demo to see the system in action:

```bash
node demo_dynamic_parameters.js
```

The system has been tested with:
- ✅ Default categorization (12 general, 72 advanced)
- ✅ Dynamic categorization with input file parameters
- ✅ Parameter movement between sections
- ✅ Complete parameter coverage (84 total)
- ✅ Namelist generation with dynamic parameters
- ✅ Integration with existing HTML forms

## 📝 Conclusion

The FRESCO Dynamic Parameter System successfully implements your requested functionality:

> "I want the General FRESCO Parameters and Advanced FRESCO Parameters be dynamic... when load in an input file, some parameter will dynamically moved from Advanced FRESCO Parameters to General FRESCO Parameters, and keep the sum of General FRESCO Parameters and Advanced FRESCO Parameters as the whole fresco namelist"

The system maintains the complete FRESCO namelist (84 parameters) while providing an adaptive, user-friendly interface that highlights the most relevant parameters based on input file content.