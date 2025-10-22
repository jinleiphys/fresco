/**
 * FRESCO Partition and States Helper
 *
 * Simple shared module for generating &PARTITION and &STATES namelists
 * Works with existing form fields on each page
 */

window.FrescoPartitionStates = {
    /**
     * Check if we have parsed partition/states data from uploaded file
     * If yes, use it. If no, use the provided partitions data.
     */
    generateFromParsedOrProvided(partitions) {
        // Check if we have parsed data from an uploaded file
        if (window.parsedPartitionStatesData &&
            window.parsedPartitionStatesData.partitions.length > 0) {
            console.log('Using parsed partition/states data from uploaded file');
            return this.generateFromParsedData();
        }

        // Otherwise, use provided partition data
        console.log('Using provided partition data from form fields');
        return this.generateFromData(partitions);
    },

    /**
     * Generate from parsed upload file data
     */
    generateFromParsedData() {
        const parsed = window.parsedPartitionStatesData;
        let output = '';

        parsed.partitions.forEach((partition, index) => {
            // &PARTITION
            output += '&PARTITION';
            Object.keys(partition).forEach(key => {
                const value = partition[key];
                if (key === 'namep' || key === 'namet') {
                    output += ` ${key}='${value}'`;
                } else {
                    output += ` ${key}=${value}`;
                }
            });
            output += ' /\n';

            // &STATES for this partition
            if (parsed.states && parsed.states[index]) {
                const state = parsed.states[index];
                output += '&STATES';
                Object.keys(state).forEach(key => {
                    output += ` ${key}=${state[key]}`;
                });
                output += ' /\n\n';
            }
        });

        // Empty partition to signal end
        output += '&PARTITION /\n';

        return output;
    },

    /**
     * Generate &PARTITION and &STATES namelists from simple parameters
     *
     * @param {Array} partitions - Array of partition objects with structure:
     * {
     *   namep: string, massp: number, zp: number, jp: number,
     *   namet: string, masst: number, zt: number, jt: number,
     *   nex: number (optional, default 1),
     *   qval: number (optional, default 0),
     *   pwf: boolean (optional, default true),
     *   states: Array (optional) - if not provided, generates default ground state
     * }
     */
    generateFromData(partitions) {
        if (!partitions || partitions.length === 0) {
            return '&PARTITION /\n';
        }

        let output = '';

        partitions.forEach((partition) => {
            // &PARTITION namelist
            output += '&PARTITION';
            if (partition.namep) output += ` namep='${partition.namep}'`;
            if (partition.massp) output += ` massp=${partition.massp}`;
            if (partition.zp !== undefined) output += ` zp=${partition.zp}`;
            if (partition.namet) output += ` namet='${partition.namet}'`;
            if (partition.masst) output += ` masst=${partition.masst}`;
            if (partition.zt !== undefined) output += ` zt=${partition.zt}`;

            const nex = partition.nex || 1;
            const qval = partition.qval || 0;
            const pwf = partition.pwf !== false ? 'T' : 'F';

            output += ` nex=${nex}`;
            if (qval !== 0) output += ` qval=${qval}`;
            output += ` pwf=${pwf}`;
            output += ' /\n';

            // &STATES namelists
            if (partition.states && partition.states.length > 0) {
                // Use provided states
                partition.states.forEach(state => {
                    output += '&STATES';
                    if (state.jp !== undefined) output += ` jp=${state.jp}`;
                    if (state.copyp !== undefined) output += ` copyp=${state.copyp}`;
                    if (state.bandp !== undefined) output += ` bandp=${state.bandp}`;
                    if (state.ep !== undefined) output += ` ep=${state.ep}`;
                    if (state.jt !== undefined) output += ` jt=${state.jt}`;
                    if (state.copyt !== undefined) output += ` copyt=${state.copyt}`;
                    if (state.bandt !== undefined) output += ` bandt=${state.bandt}`;
                    if (state.et !== undefined) output += ` et=${state.et}`;
                    output += ' /\n';
                });
            } else {
                // Generate default ground state from partition data
                for (let i = 0; i < nex; i++) {
                    output += '&STATES';
                    output += ` jp=${partition.jp || 0}`;
                    output += ` copyp=${i === 0 ? 0 : 1}`;
                    output += ' bandp=1';
                    output += ' ep=0.0000';
                    output += ` jt=${partition.jt || 0}`;
                    output += ' copyt=0';
                    output += ' bandt=1';
                    output += ' et=0.0000';
                    output += ' /\n';
                }
            }
            output += '\n';
        });

        // Empty partition to signal end
        output += '&PARTITION /\n';

        return output;
    },

    /**
     * Simple helper for single partition case (most common)
     * Automatically uses parsed data from uploaded file if available
     */
    generateSingle(namep, massp, zp, jp, namet, masst, zt, jt, qval = 0) {
        return this.generateFromParsedOrProvided([{
            namep, massp, zp, jp,
            namet, masst, zt, jt,
            nex: 1,
            qval: qval,
            pwf: true
        }]);
    },

    /**
     * Helper for two-partition reactions (transfer, capture, etc.)
     * Automatically uses parsed data from uploaded file if available
     */
    generateTwoPartitions(partition1, partition2) {
        return this.generateFromParsedOrProvided([partition1, partition2]);
    },

    /**
     * Clear parsed partition/states data (call when user makes manual changes)
     */
    clearParsedData() {
        window.parsedPartitionStatesData = null;
        console.log('Cleared parsed partition/states data');
    }
};
