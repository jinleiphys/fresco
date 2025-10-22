/**
 * FRESCO Namelist Configuration
 * Complete list of &FRESCO namelist variables organized by category
 * Only parameters that are defined (non-default) will be included in the generated input file
 */

window.FrescoNamelist = {
    // Configuration for each parameter category
    categories: {
        radialCoordinates: {
            title: "Radial Coordinates",
            description: "Wave function calculation and radial grid parameters",
            parameters: {
                hcm: {
                    label: "Integration step size (hcm)",
                    tooltip: "Wave functions calculated at intervals of HCM up to abs(RMATCH). Step size for integration in center-of-mass frame.",
                    type: "number",
                    default: 0.1,
                    step: 0.01,
                    min: 0.001
                },
                rmatch: {
                    label: "Matching radius (rmatch)",
                    tooltip: "The radius at which the internal and asymptotic solutions are matched. If negative, use coupled Coulomb wave functions.",
                    type: "number",
                    default: 60,
                    step: 0.1
                },
                rintp: {
                    label: "Non-local radius step (rintp)",
                    tooltip: "Non-local kernels calculated at Rf intervals of RINTP. Rounded to multiples of HCM.",
                    type: "number",
                    default: null,
                    step: 0.1
                },
                hnl: {
                    label: "Non-local step size (hnl)",
                    tooltip: "Step size for non-local range discretization. Rounded to multiple or sub-multiple of HCM.",
                    type: "number",
                    default: null,
                    step: 0.01
                },
                rnl: {
                    label: "Non-local range (rnl)",
                    tooltip: "Non-local range for kernels K0fi(Rf;Dfi).",
                    type: "number",
                    default: null,
                    step: 0.1
                },
                centre: {
                    label: "Non-local center (centre)",
                    tooltip: "Center position for non-local range RNL.",
                    type: "number",
                    default: null,
                    step: 0.1
                },
                hnn: {
                    label: "N-N step size (hnn)",
                    tooltip: "Target step size for nucleon-nucleon distance discretization in two-nucleon transfers.",
                    type: "number",
                    default: null,
                    step: 0.01
                },
                rnn: {
                    label: "N-N max distance (rnn)",
                    tooltip: "Maximum nucleon-nucleon distance for two-nucleon transfers.",
                    type: "number",
                    default: null,
                    step: 0.1
                },
                rmin: {
                    label: "N-N min distance (rmin)",
                    tooltip: "Minimum nucleon-nucleon distance for two-nucleon transfers.",
                    type: "number",
                    default: null,
                    step: 0.1
                },
                rsp: {
                    label: "State radius limit (rsp)",
                    tooltip: "Upper limit of state radius when folding single-particle states with KIND=3 or 4 couplings.",
                    type: "number",
                    default: null,
                    step: 0.1
                },
                cutl: {
                    label: "Lower radial cutoff factor (cutl)",
                    tooltip: "Radial points per ℓ for lower cutoff. Default=-1.6. >0: use ℓ=J, <0: use ℓ=Lin.",
                    type: "number",
                    default: -1.6,
                    step: 0.1
                },
                cutr: {
                    label: "Lower radial cutoff (cutr)",
                    tooltip: "Lower radial cutoff in fm. If negative, cutoff at point-Coulomb turning point.",
                    type: "number",
                    default: null,
                    step: 0.1
                },
                cutc: {
                    label: "Off-diagonal cutoff (cutc)",
                    tooltip: "Lower radial cutoff in fm for off-diagonal couplings.",
                    type: "number",
                    default: null,
                    step: 0.1
                },
                rasym: {
                    label: "Asymptotic radius (rasym)",
                    tooltip: "Asymptotic radius for coupled Coulomb wave functions. If negative, determine from classical angle.",
                    type: "number",
                    default: null,
                    step: 0.1
                },
                accrcy: {
                    label: "Accuracy parameter (accrcy)",
                    tooltip: "Accuracy parameter for piecewise step length. Default=0.01, smaller gives greater accuracy.",
                    type: "number",
                    default: 0.01,
                    step: 0.001,
                    min: 0.0001
                },
                switch: {
                    label: "Switch radius (switch)",
                    tooltip: "Radius to switch from Airy functions to sines/cosines in piecewise method. Default=1000 fm.",
                    type: "number",
                    default: 1000,
                    step: 10
                },
                sinjmax: {
                    label: "Sin switch J-max (sinjmax)",
                    tooltip: "If >0, change switchover condition to J > SINJMAX instead of radius.",
                    type: "number",
                    default: null,
                    step: 0.5
                },
                ajswtch: {
                    label: "Angular momentum switch (ajswtch)",
                    tooltip: "Coupled Coulomb matching allowed only when J ≤ AJSWITCH. Default=0.0.",
                    type: "number",
                    default: 0.0,
                    step: 0.5
                }
            }
        },
        
        partialWaves: {
            title: "Partial Waves",
            description: "Angular momentum and J-value control parameters",
            parameters: {
                jtmin: {
                    label: "Minimum J (jtmin)",
                    tooltip: "Minimum total angular momentum. If negative, J < |JTMIN| include only incoming channel.",
                    type: "number",
                    default: 0.0,
                    step: 0.5
                },
                jtmax: {
                    label: "Maximum J (jtmax)",
                    tooltip: "Maximum total angular momentum included in calculation.",
                    type: "number",
                    default: 50,
                    step: 0.5,
                    min: 0
                },
                absend: {
                    label: "Convergence criterion (absend)",
                    tooltip: "Stop if absorption < ABSEND mb for 3 successive J/parity sets. If negative, take full J interval.",
                    type: "number",
                    default: 0.001,
                    step: 0.001
                },
                jump: {
                    label: "J-value intervals (jump)",
                    tooltip: "Calculate at intervals of JUMP(i) for J ≥ JBORD(i). Comma-separated for multiple intervals.",
                    type: "text",
                    default: null,
                    placeholder: "1,2,5"
                },
                jbord: {
                    label: "J-value borders (jbord)",
                    tooltip: "J borders for different JUMP intervals. Comma-separated values.",
                    type: "text",
                    default: null,
                    placeholder: "10,20,40"
                },
                pset: {
                    label: "Parity restriction (pset)",
                    tooltip: "Restrict parity: -1 (negative), +1 (positive), 0 (no restriction).",
                    type: "select",
                    default: 0,
                    options: [
                        { value: -1, text: "-1 (Negative parity only)" },
                        { value: 0, text: "0 (No restriction)" },
                        { value: 1, text: "+1 (Positive parity only)" }
                    ]
                },
                jset: {
                    label: "Number of sets (jset)",
                    tooltip: "Number of CRC sets to calculate before stopping. 0 = all sets.",
                    type: "number",
                    default: 0,
                    step: 1,
                    min: 0
                },
                iso: {
                    label: "Isocentrifugal approximation (iso)",
                    tooltip: "Replace barriers: 'A'/'J' for L=J barrier, 'B'/'L' for L=Lin barrier, 0/blank for none.",
                    type: "select",
                    default: "",
                    options: [
                        { value: "", text: "None (exact barriers)" },
                        { value: "A", text: "A - L=J barrier" },
                        { value: "J", text: "J - L=J barrier" },
                        { value: "B", text: "B - L=Lin barrier" },
                        { value: "L", text: "L - L=Lin barrier" }
                    ]
                },
                llmax: {
                    label: "Maximum L (llmax)",
                    tooltip: "Maximum partial wave L in any CRC set.",
                    type: "number",
                    default: null,
                    step: 1,
                    min: 0
                }
            }
        },
        
        angularDistributions: {
            title: "Angular Distributions",
            description: "Scattering angle and analyzing power parameters",
            parameters: {
                kqmax: {
                    label: "Max tensor rank (kqmax)",
                    tooltip: "Maximum tensor analyzing power rank K.",
                    type: "number",
                    default: 0,
                    step: 1,
                    min: 0
                },
                thmin: {
                    label: "Minimum angle (thmin)",
                    tooltip: "Minimum center-of-mass scattering angle in degrees.",
                    type: "number",
                    default: 0.0,
                    step: 0.1,
                    min: 0
                },
                thmax: {
                    label: "Maximum angle (thmax)",
                    tooltip: "Maximum scattering angle. If negative, absolute cross sections instead of ratio to Rutherford.",
                    type: "number",
                    default: 180,
                    step: 0.1
                },
                thinc: {
                    label: "Angle increment (thinc)",
                    tooltip: "Increment between calculated scattering angles in degrees.",
                    type: "number",
                    default: 1.0,
                    step: 0.1,
                    min: 0.01
                },
                pp: {
                    label: "Polarization type (pp)",
                    tooltip: "Calculate analyzing powers for: 0=projectile, 1=target, 2=ejectile, 3=residual, 4=projectile+Kyy.",
                    type: "select",
                    default: 0,
                    options: [
                        { value: 0, text: "0 - Projectile" },
                        { value: 1, text: "1 - Target" },
                        { value: 2, text: "2 - Ejectile" },
                        { value: 3, text: "3 - Residual nucleus" },
                        { value: 4, text: "4 - Projectile + Kyy" }
                    ]
                },
                koords: {
                    label: "Coordinate system (koords)",
                    tooltip: "Coordinate systems: 0=Madison, 1=Madison+Transverse, 2=+Recoil, 3=+Hooton-Johnson.",
                    type: "select",
                    default: 0,
                    options: [
                        { value: 0, text: "0 - Madison coordinates" },
                        { value: 1, text: "1 - Madison + Transverse" },
                        { value: 2, text: "2 - Madison + Transverse + Recoil" },
                        { value: 3, text: "3 - Madison + Transverse + Recoil + Hooton-Johnson" }
                    ]
                },
                nearfa: {
                    label: "Near/far analysis (nearfa)",
                    tooltip: "0/1=usual, 2/-2=+far side, 3/-3=+near&far. >0=elastic only, <0=all channels. >10=split Coulomb.",
                    type: "number",
                    default: 0,
                    step: 1
                }
            }
        },
        
        coupledEquations: {
            title: "Coupled Equations",
            description: "Coupling definition and accuracy parameters",
            parameters: {
                inh: {
                    label: "Transfer form storage (inh)",
                    tooltip: "Zero-range transfer forms: 0=HCM intervals, 1=proj.core/proj.composite, 2=targ.core/targ.composite.",
                    type: "select",
                    default: 0,
                    options: [
                        { value: 0, text: "0 - HCM intervals exactly" },
                        { value: 1, text: "1 - Projectile recoil correction" },
                        { value: 2, text: "2 - Target recoil correction" }
                    ]
                },
                nnu: {
                    label: "Angular integration points (nnu)",
                    tooltip: "Gaussian integration points for non-local transfer kernels. Multiple of 6, minimum 18.",
                    type: "number",
                    default: 24,
                    step: 6,
                    min: 18
                },
                maxl: {
                    label: "Max L for kernels (maxl)",
                    tooltip: "Maximum L for non-local kernels. Default=JTMAX+6 if zero.",
                    type: "number",
                    default: null,
                    step: 1,
                    min: 0
                },
                minl: {
                    label: "Min L for kernels (minl)",
                    tooltip: "Minimum L for non-local kernels. Default=|JTMIN|-6 if negative.",
                    type: "number",
                    default: null,
                    step: 1
                },
                mtmin: {
                    label: "Min L-transfer for m-dep (mtmin)",
                    tooltip: "Lowest L-transfer for m-dependent spherical harmonics. Default=6 if zero, <0 avoids default.",
                    type: "number",
                    default: 6,
                    step: 1
                },
                epc: {
                    label: "Angular integration accuracy (epc)",
                    tooltip: "Percentage cutoff accuracy in NNU angular integration. Default=(30/NNU)²% if zero.",
                    type: "number",
                    default: null,
                    step: 0.1,
                    min: 0
                },
                erange: {
                    label: "Continuum energy range (erange)",
                    tooltip: "Energy range for continuum bins: >0=ratio of boundaries, <0=difference in MeV.",
                    type: "number",
                    default: null,
                    step: 0.1
                },
                dk: {
                    label: "Continuum k step (dk)",
                    tooltip: "Step size of k (fm⁻¹) for integration over ERANGE for continuum bins.",
                    type: "number",
                    default: null,
                    step: 0.01,
                    min: 0.001
                },
                plane: {
                    label: "Coulomb zeroing (plane)",
                    tooltip: "Zero Coulomb potential: 1/3=elastic channel, 2/3=all nonelastic channels.",
                    type: "select",
                    default: null,
                    options: [
                        { value: null, text: "None (include all Coulomb)" },
                        { value: 1, text: "1 - Zero elastic Coulomb" },
                        { value: 2, text: "2 - Zero nonelastic Coulomb" },
                        { value: 3, text: "3 - Zero all Coulomb" }
                    ]
                },
                rela: {
                    label: "Relativistic kinematics (rela)",
                    tooltip: "Relativistic options: 'a'=Ingemarsson eq(16), 'b'=eq(17), 'c'/'3d'=knockout, 'na'=potential factor.",
                    type: "text",
                    default: null,
                    placeholder: "a, b, c, 3d, na"
                },
                unitmass: {
                    label: "Mass unit (unitmass)",
                    tooltip: "Unit in amu for MASS values read in. Default=1.000.",
                    type: "number",
                    default: 1.000,
                    step: 0.001,
                    min: 0.1
                },
                finec: {
                    label: "Fine structure constant (finec)",
                    tooltip: "1/(fine-structure constant) for electrostatic e². Default=137.03599.",
                    type: "number",
                    default: 137.03599,
                    step: 0.001,
                    min: 100
                }
            }
        },
        
        incidentChannel: {
            title: "Incident Channel",
            description: "Incoming wave and energy parameters",
            parameters: {
                pel: {
                    label: "Elastic partition (pel)",
                    tooltip: "Incoming plane waves present in partition PEL. Default=1.",
                    type: "number",
                    default: 1,
                    step: 1,
                    min: 1
                },
                exl: {
                    label: "Elastic excitation (exl)",
                    tooltip: "Excitation pair EXL for incoming waves. Default=1.",
                    type: "number",
                    default: 1,
                    step: 1,
                    min: 1
                },
                lab: {
                    label: "Laboratory partition (lab)",
                    tooltip: "Partition for laboratory energy definition. Default=PEL.",
                    type: "number",
                    default: null,
                    step: 1,
                    min: 1
                },
                lin: {
                    label: "Laboratory nucleus (lin)",
                    tooltip: "Nucleus for laboratory energy: 1=projectile, 2=target. Default=1.",
                    type: "select",
                    default: 1,
                    options: [
                        { value: 1, text: "1 - Projectile" },
                        { value: 2, text: "2 - Target" }
                    ]
                },
                lex: {
                    label: "Laboratory excitation (lex)",
                    tooltip: "Excitation pair LEX for laboratory energy. Default=1.",
                    type: "number",
                    default: 1,
                    step: 1,
                    min: 1
                },
                elab: {
                    label: "Laboratory energy (elab)",
                    tooltip: "Laboratory energies in MeV. Use spaces or commas for multiple energies (e.g., '6.9 11.0 49.35').",
                    type: "text",
                    default: null,
                    placeholder: "6.9 11.0 49.35",
                    required: true
                },
                nlab: {
                    label: "Energy intervals (nlab)",
                    tooltip: "Number of linear intervals between consecutive ELAB values. Comma-separated.",
                    type: "text",
                    default: null,
                    placeholder: "1, 1, 1"
                }
            }
        },
        
        solvingEquations: {
            title: "Solving Equations",
            description: "Iteration and convergence control parameters",
            parameters: {
                ips: {
                    label: "Convergence percentage (ips)",
                    tooltip: "Stop if S-matrix differences < IPS percent. If negative, skip numerical integration check.",
                    type: "number",
                    default: 0.1,
                    step: 0.01,
                    min: 0.001
                },
                it0: {
                    label: "Minimum iterations (it0)",
                    tooltip: "Minimum number of iterations. IT0=ITER=0 gives elastic only, =1 gives DWBA.",
                    type: "number",
                    default: 1,
                    step: 1,
                    min: 0
                },
                iter: {
                    label: "Maximum iterations (iter)",
                    tooltip: "Maximum number of iterations. IT0=ITER=1 gives 1-step DWBA.",
                    type: "number",
                    default: 1,
                    step: 1,
                    min: 1
                },
                fatal: {
                    label: "Continue after failure (fatal)",
                    tooltip: "If False, continue even after convergence failure. Default=True.",
                    type: "select",
                    default: true,
                    options: [
                        { value: true, text: "True - Stop on convergence failure" },
                        { value: false, text: "False - Continue after failure" }
                    ]
                },
                iblock: {
                    label: "Blocked channels (iblock)",
                    tooltip: "Number of excitation pairs coupled exactly by blocking together. Start from partition 1, excitation 1.",
                    type: "number",
                    default: 1,
                    step: 1,
                    min: 1
                },
                pade: {
                    label: "Pade acceleration (pade)",
                    tooltip: "Pade acceleration: 0=none, 1=epsilon algorithm, 2=N/D polynomials.",
                    type: "select",
                    default: 0,
                    options: [
                        { value: 0, text: "0 - No Pade acceleration" },
                        { value: 1, text: "1 - Epsilon algorithm" },
                        { value: 2, text: "2 - N/D polynomials" }
                    ]
                },
                nosol: {
                    label: "No solution (nosol)",
                    tooltip: "If True, only construct couplings without solving CRC equations.",
                    type: "select",
                    default: false,
                    options: [
                        { value: false, text: "False - Solve equations" },
                        { value: true, text: "True - Only construct couplings" }
                    ]
                },
                dry: {
                    label: "Dry run (dry)",
                    tooltip: "If True, check array sizes without solving. Only elastic channels non-zero.",
                    type: "select",
                    default: false,
                    options: [
                        { value: false, text: "False - Normal run" },
                        { value: true, text: "True - Dry run (check arrays)" }
                    ]
                },
                smallchan: {
                    label: "Small channel threshold (smallchan)",
                    tooltip: "Fraction of unitarity to define 'small channel'. Dropped after 5 times small.",
                    type: "number",
                    default: null,
                    step: 0.001,
                    min: 0.0001,
                    max: 1.0
                },
                smallcoup: {
                    label: "Small coupling threshold (smallcoup)",
                    tooltip: "If nonelastic channels < SMALLCOUP fraction, change from CC to DWBA.",
                    type: "number",
                    default: null,
                    step: 0.001,
                    min: 0.0001,
                    max: 1.0
                },
                hort: {
                    label: "QR stabilization interval (hort)",
                    tooltip: "Radial interval for QR stabilization.",
                    type: "number",
                    default: null,
                    step: 0.1,
                    min: 0.1
                },
                rmort: {
                    label: "QR extension radius (rmort)",
                    tooltip: "Radius outside classical turning point for orthogonalizing extension.",
                    type: "number",
                    default: null,
                    step: 0.1,
                    min: 0
                },
                psiren: {
                    label: "Simple renormalization (psiren)",
                    tooltip: "Simple renormalization of channel wave functions after Pade acceleration.",
                    type: "select",
                    default: false,
                    options: [
                        { value: false, text: "False - No renormalization" },
                        { value: true, text: "True - Renormalize after Pade" }
                    ]
                },
                initwf: {
                    label: "Initial wave functions (initwf)",
                    tooltip: "Read external scattering wave functions: >0=formatted file, <0=unformatted file.",
                    type: "number",
                    default: null,
                    step: 1
                }
            }
        },
        
        traceVariables: {
            title: "Trace Variables",
            description: "Debug and output control parameters",
            parameters: {
                chans: {
                    label: "Channel output (chans)",
                    tooltip: "Print coupled partial wave sets for each J,parity. Decremented after use.",
                    type: "number",
                    default: 1,
                    step: 1,
                    min: 0
                },
                listcc: {
                    label: "Coupling coefficients (listcc)",
                    tooltip: "Print coupling coefficients: 1=basic, 2+=progressively more detail. Decremented.",
                    type: "number",
                    default: 0,
                    step: 1,
                    min: 0
                },
                treneg: {
                    label: "Potential output (treneg)",
                    tooltip: "Print potentials: 1=multipole, 3=multipole+monopole.",
                    type: "number",
                    default: 0,
                    step: 1,
                    min: 0
                },
                cdetr: {
                    label: "Equation solving info (cdetr)",
                    tooltip: "Print information on solving coupled equations. Decremented.",
                    type: "number",
                    default: 0,
                    step: 1,
                    min: 0
                },
                smats: {
                    label: "S-matrix output (smats)",
                    tooltip: "S-matrix output: 1=absorption/reaction, 2=elastic+file, 3=grazing, 4=all, 5=each iteration, 6=actual.",
                    type: "number",
                    default: 2,
                    step: 1,
                    min: 0,
                    max: 6
                }
            }
        },
        
        outputDetails: {
            title: "Output Details",
            description: "File output and analysis parameters",
            parameters: {
                xstabl: {
                    label: "Cross-section file output (xstabl)",
                    tooltip: "If non-zero, output cross sections to file 16 for all levels. Value sets tensor rank limit.",
                    type: "number",
                    default: 1,
                    step: 1,
                    min: 0
                },
                nlpl: {
                    label: "Non-local plot (nlpl)",
                    tooltip: "Print contour plot of non-local kernels. Decremented after use.",
                    type: "number",
                    default: 0,
                    step: 1,
                    min: 0
                },
                waves: {
                    label: "Wave function output (waves)",
                    tooltip: "Wave function output: ±1=solutions, ±3=+source terms, 2=source only. Negative=ratio to asymptotic.",
                    type: "number",
                    default: 0,
                    step: 1
                },
                lampl: {
                    label: "Amplitude coefficients (lampl)",
                    tooltip: "Output Legendre coefficients to file 36. Negative=file 37 amplitudes only for partition |LAMPL|.",
                    type: "number",
                    default: 0,
                    step: 1
                },
                veff: {
                    label: "Effective potential (veff)",
                    tooltip: "Calculate effective potential: <0=add to elastic, ±2=exclude S<0.1.",
                    type: "number",
                    default: 0,
                    step: 1
                },
                kfus: {
                    label: "Fusion potential number (kfus)",
                    tooltip: "Calculate core fusion using potential number KFUS (TYPE=1/2).",
                    type: "number",
                    default: 0,
                    step: 1,
                    min: 0
                },
                nfus: {
                    label: "Fusion channels (nfus)",
                    tooltip: "Number of inelastic channels for core fusion calculation.",
                    type: "number",
                    default: 0,
                    step: 1,
                    min: 0
                },
                wdisk: {
                    label: "Wave function file (wdisk)",
                    tooltip: "Write wave functions to file 17: ±1=elastic, ±2=all. Positive=formatted, negative=unformatted.",
                    type: "select",
                    default: 0,
                    options: [
                        { value: 0, text: "0 - No wave function output" },
                        { value: 1, text: "1 - Elastic, formatted" },
                        { value: 2, text: "2 - All channels, formatted" },
                        { value: -1, text: "-1 - Elastic, unformatted" },
                        { value: -2, text: "-2 - All channels, unformatted" }
                    ]
                },
                bpm: {
                    label: "Barrier penetration model (bpm)",
                    tooltip: "BPM fusion: 1=calculate, 2=+L-distributions.",
                    type: "number",
                    default: 0,
                    step: 1,
                    min: 0,
                    max: 2
                },
                melfil: {
                    label: "MEL file output (melfil)",
                    tooltip: "Write mel/spec files 53/54: ±1=real, ±2=complex. Negative=text format.",
                    type: "number",
                    default: 0,
                    step: 1
                },
                cdcc: {
                    label: "CDCC output (cdcc)",
                    tooltip: "CDCC amplitude output to file 57: 1=uncoupled bins, 2=coupled bins.",
                    type: "select",
                    default: 0,
                    options: [
                        { value: 0, text: "0 - No CDCC output" },
                        { value: 1, text: "1 - Uncoupled bin states" },
                        { value: 2, text: "2 - Coupled bin states" }
                    ]
                },
                tmp: {
                    label: "Temporary directory (tmp)",
                    tooltip: "Directory for temporary files. Default='/tmp/'.",
                    type: "text",
                    default: "/tmp/",
                    placeholder: "/tmp/ or ."
                }
            }
        }
    },

    /**
     * Get all parameters with their metadata
     */
    getAllParameters: function() {
        const allParams = {};
        for (const category in this.categories) {
            Object.assign(allParams, this.categories[category].parameters);
        }
        return allParams;
    },

    /**
     * Get parameter by name
     */
    getParameter: function(name) {
        const allParams = this.getAllParameters();
        return allParams[name] || null;
    },

    /**
     * Initialize basic form fields with configuration values
     */
    initializeBasicFields: function() {
        const basicParams = ['hcm', 'rmatch', 'jtmax', 'absend', 'thmin', 'thmax', 'thinc', 'elab', 'iter', 'chans', 'smats', 'switch', 'ajswtch', 'iblock', 'nnu', 'xstabl'];
        
        basicParams.forEach(paramName => {
            const paramConfig = this.getParameter(paramName);
            if (paramConfig) {
                const element = document.getElementById(paramName);
                if (element) {
                    // Update default value if it's different
                    if (paramConfig.default !== null && paramConfig.default !== undefined) {
                        element.value = paramConfig.default;
                    }
                    
                    // Update attributes to match configuration
                    if (paramConfig.step) {
                        element.setAttribute('step', paramConfig.step);
                    }
                    if (paramConfig.min !== undefined) {
                        element.setAttribute('min', paramConfig.min);
                    }
                    if (paramConfig.max !== undefined) {
                        element.setAttribute('max', paramConfig.max);
                    }
                    if (paramConfig.placeholder) {
                        element.setAttribute('placeholder', paramConfig.placeholder);
                    }
                    
                    // Update tooltip if there's a mismatch
                    const tooltip = element.parentElement.querySelector('.tooltip-text');
                    if (tooltip && paramConfig.tooltip) {
                        tooltip.textContent = paramConfig.tooltip;
                    }
                }
            }
        });
    },

    /**
     * Generate namelist section for input file
     * Includes all non-empty parameters. For basic parameters from General section, 
     * includes them even if they match defaults.
     */
    generateNamelistSection: function(formData, excludeBasicParams = false) {
        const allParams = this.getAllParameters();
        const namelistParams = [];
        const basicParams = ['hcm', 'rmatch', 'jtmax', 'absend', 'thmin', 'thmax', 'thinc', 'elab', 'iter', 'chans', 'smats', 'switch', 'ajswtch', 'iblock', 'nnu', 'xstabl'];
        
        for (const paramName in formData) {
            const paramConfig = allParams[paramName];
            if (!paramConfig) continue;
            
            // Skip basic parameters if requested (to avoid duplication in advanced sections)
            if (excludeBasicParams && basicParams.includes(paramName)) continue;
            
            const value = formData[paramName];
            const defaultValue = paramConfig.default;
            const isBasicParam = basicParams.includes(paramName);
            
            // Skip if value is null, undefined, or empty string
            if (value === null || value === undefined || value === '') continue;
            
            // For basic parameters from General section: include if non-empty (even if equals default)
            // For advanced parameters: only include if different from default (unless required)
            if (!isBasicParam && !paramConfig.required && value === defaultValue) continue;
            
            // Format the parameter value
            let formattedValue = value;
            if (paramConfig.type === 'select' && typeof value === 'boolean') {
                formattedValue = value ? 'T' : 'F';
            } else if (paramConfig.type === 'text' && paramName === 'elab') {
                // Special handling for ELAB - can be single value or array
                if (typeof value === 'string' && value.includes(',')) {
                    const values = value.split(',').map(v => v.trim());
                    formattedValue = values.join(' ');
                }
            }
            
            namelistParams.push(`${paramName}=${formattedValue}`);
        }
        
        if (namelistParams.length === 0) {
            return ' &FRESCO /'; // Minimal namelist
        }
        
        // Format namelist with proper line breaks for readability
        let namelist = ' &FRESCO ';
        const paramsPerLine = 3;
        
        for (let i = 0; i < namelistParams.length; i++) {
            if (i > 0 && i % paramsPerLine === 0) {
                namelist += '\n\t ';
            }
            namelist += namelistParams[i];
            if (i < namelistParams.length - 1) {
                namelist += ' ';
            }
        }
        namelist += ' /';
        
        return namelist;
    },

    /**
     * Create form fields for a category
     */
    createCategoryForm: function(categoryName, containerId, existingValues = {}) {
        const category = this.categories[categoryName];
        if (!category) {
            console.error(`Category '${categoryName}' not found`);
            return;
        }
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container '${containerId}' not found`);
            return;
        }
        
        // Clear existing content
        container.innerHTML = '';
        
        // Create category section
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'glass-card';
        categoryDiv.innerHTML = `
            <h4><i class="fas fa-cogs me-2"></i>${category.title}</h4>
            <p class="text-white-50 mb-3">${category.description}</p>
            <div class="row" id="${categoryName}-fields"></div>
        `;
        
        container.appendChild(categoryDiv);
        
        // Get the fields container after it's been added to the DOM
        const fieldsContainer = categoryDiv.querySelector(`#${categoryName}-fields`);
        
        // Basic parameters that are already in the General section
        const basicParams = ['hcm', 'rmatch', 'jtmax', 'absend', 'thmin', 'thmax', 'thinc', 'elab', 'iter', 'chans', 'smats', 'switch', 'ajswtch', 'iblock', 'nnu', 'xstabl'];
        
        // Create form fields for each parameter
        for (const [paramName, paramConfig] of Object.entries(category.parameters)) {
            // Skip basic parameters to avoid duplication
            if (basicParams.includes(paramName)) {
                continue;
            }
            
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'col-md-4 mb-3';
            
            const value = existingValues[paramName] !== undefined ? existingValues[paramName] : paramConfig.default;
            
            let inputElement = '';
            
            if (paramConfig.type === 'select') {
                inputElement = `<select class="form-select" id="${paramName}" name="${paramName}">`;
                for (const option of paramConfig.options) {
                    const selected = option.value === value ? 'selected' : '';
                    inputElement += `<option value="${option.value}" ${selected}>${option.text}</option>`;
                }
                inputElement += '</select>';
            } else if (paramConfig.type === 'number') {
                const attrs = [
                    `type="number"`,
                    `id="${paramName}"`,
                    `name="${paramName}"`,
                    `class="form-control"`
                ];
                if (value !== null && value !== undefined) attrs.push(`value="${value}"`);
                if (paramConfig.step) attrs.push(`step="${paramConfig.step}"`);
                if (paramConfig.min !== undefined) attrs.push(`min="${paramConfig.min}"`);
                if (paramConfig.max !== undefined) attrs.push(`max="${paramConfig.max}"`);
                if (paramConfig.required) attrs.push('required');
                
                inputElement = `<input ${attrs.join(' ')}>`;
            } else {
                // text input
                const attrs = [
                    `type="text"`,
                    `id="${paramName}"`,
                    `name="${paramName}"`,
                    `class="form-control"`
                ];
                if (value !== null && value !== undefined) attrs.push(`value="${value}"`);
                if (paramConfig.placeholder) attrs.push(`placeholder="${paramConfig.placeholder}"`);
                if (paramConfig.required) attrs.push('required');
                
                inputElement = `<input ${attrs.join(' ')}>`;
            }
            
            fieldDiv.innerHTML = `
                <label for="${paramName}" class="form-label">
                    ${paramConfig.label}
                    <span class="custom-tooltip">
                        <i class="fas fa-info-circle ms-1"></i>
                        <span class="tooltip-text">${paramConfig.tooltip}</span>
                    </span>
                </label>
                ${inputElement}
            `;
            
            fieldsContainer.appendChild(fieldDiv);
        }
    }
};

// Export for Node.js environments if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.FrescoNamelist;
}

// Debug log to confirm script loaded
console.log('fresco-namelist.js loaded successfully', typeof window.FrescoNamelist);