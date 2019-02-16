/* global ngapp, xelib */
registerPatcher({
    info: info,
    gameModes: [xelib.gmTES5, xelib.gmSSE],
    settings: {
        label: 'Spell absorb fix',
        hide: true
    },
    execute: (patchFile, helpers, settings, locals) => ({
        process: [{
            load: () => ({
                signature: 'SPEL',
                filter: function (record) {
                    // check for the icon being the one used for summoning spells
                    const icon = xelib.GetValue(record, "MDOB - Menu Display Object");
                    if (!icon) {
                        return false;
                    }
                    if (icon !== "MAGINVSummon [STAT:000A6459]") {
                        return false;
                    }
                    // do not process records already having the flag
                    if (xelib.GetFlag(record, 'SPIT - Data\\Flags', 'No Absorb/Reflect')) {
                        return false;
                    }
                    return true;
                }
            }),
            patch: function (record, helpers, settings, locals) {
                helpers.logMessage(`Processing spell ${xelib.LongName(record)}`);
                const effects = xelib.GetElements(record, "Effects", false);
                for (let i in effects) {
                    const form_id = xelib.GetUIntValue(effects[i], "EFID - Base Effect");
                    if (form_id === 0) {
                        continue;
                    }
                    const eff_record = xelib.GetRecord(0, form_id);
                    const archtype = xelib.GetValue(eff_record, "Magic Effect Data\\DATA - Data\\Archtype");
                    xelib.Release(eff_record);
                    if (archtype === 'Summon Creature') {
                        helpers.logMessage(`Adding "absorb" to ${xelib.LongName(record)}`);
                        xelib.SetFlag(record, 'SPIT - Data\\Flags', 'No Absorb/Reflect', true);
                        return;
                    }
                }
            }
        }],
    })
});