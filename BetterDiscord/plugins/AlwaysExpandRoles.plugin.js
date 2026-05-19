/**
 * @name AlwaysExpandRoles
 * @author SamanthaB
 * @authorId 505752339173605397
 * @description Always expands the role list in profile popouts (optionally keeps them expanded) and can optionally hide the collapse button.
 * @version 1.1.0
 * @website https://github.com/SBvn-dev/BetterDiscord/
 * @source https://github.com/SBvn-dev/BetterDiscord/blob/main/AlwaysExpandRoles.plugin.js
 */
const { DOM, UI, Data, Webpack, Patcher, React, Logger, Hooks } = new BdApi("AlwaysExpandRoles");
const DEFAULT_SETTINGS = {
    forceExpanded: true,
    hideCollapseButton: true,
    throttleMs: 600
};
const CSS_HIDE_COLLAPSE = `
    div[data-list-id^="roles-"] div[class*="pillButton"] {
        display: none !important;
    }
`;
const fakeEvt = { preventDefault() { }, stopPropagation() { } };
const isEl = (x) => !!(x && typeof x === "object" && x.$$typeof && x.props);
const unwrapped = (node) => ({ node, wrapped: false });
module.exports = class AlwaysExpandRoles {
    constructor() {
        this.settings = { ...DEFAULT_SETTINGS, ...Data.load("settings") };
        if (!this.settings.forceExpanded && this.settings.hideCollapseButton) {
            this.settings.hideCollapseButton = false;
        }
        this.active = false;
    }
    async start() {
        this._starting = true;
        await Webpack.waitForModule((m) => {
            if (!m || typeof m !== "object") return false;
            return Object.values(m).some((v) => typeof v === "function" && v.toString().includes("canRemoveAnyRoles"));
        });
        if (!this._starting) return;
        this._starting = false;
        const RoleModule = Webpack.getMangled("canRemoveAnyRoles", { RolesListWithOverflow: Webpack.Filters.byStrings("onExpand", "onCollapse", "canAddRoles", "canRemoveAnyRoles") });
        if (!RoleModule?.RolesListWithOverflow) {
            Logger.error("RolesListWithOverflow not found");
            return;
        }
        this.active = true;
        this.updateStyles();
        this._AutoExpandToggle = this._createAutoExpandToggle();
        Patcher.after(RoleModule, "RolesListWithOverflow", (_, __, ret) => {
            return this._wrapFirstToggle(ret).node;
        });

    }
    _createAutoExpandToggle() {
        return ({ el, isExpanded, overflowCount, onClick }) => {
            const didOnce = React.useRef(false);
            const lastTs = React.useRef(0);
            React.useLayoutEffect(() => {
                if (!this.active) return;
                if (overflowCount <= 0) return;
                if (isExpanded !== false) return;
                if (!this.settings.forceExpanded && didOnce.current) return;
                const now = Date.now();
                if (now - lastTs.current < this.settings.throttleMs) return;
                lastTs.current = now;
                didOnce.current = true;
                try { onClick(fakeEvt); } catch { }
            }, [isExpanded, overflowCount, onClick]);
            return el;
        };
    }
    _wrapFirstToggle(node, depth = 0) {
        if (!node || depth > 45) return unwrapped(node);
        if (Array.isArray(node)) {
            let wrapped = false;
            const out = node.map((c) => {
                if (wrapped) return c;
                const r = this._wrapFirstToggle(c, depth + 1);
                wrapped = r.wrapped;
                return r.node;
            });
            return { node: out, wrapped };
        }
        if (!isEl(node)) return unwrapped(node);
        const p = node.props;
        const looksLikeToggle =
            typeof p.overflowCount === "number" &&
            typeof p.isExpanded === "boolean" &&
            typeof p.onClick === "function";
        if (looksLikeToggle) {
            return {
                wrapped: true,
                node: React.createElement(this._AutoExpandToggle, {
                    key: "aer-toggle",
                    el: node,
                    isExpanded: p.isExpanded,
                    overflowCount: p.overflowCount,
                    onClick: p.onClick
                })
            };
        }
        const ch = p.children;
        if (!ch) return unwrapped(node);
        const r = this._wrapFirstToggle(ch, depth + 1);
        if (!r.wrapped) return unwrapped(node);
        return {
            wrapped: true,
            node: React.cloneElement(node, { ...p, children: r.node })
        };
    }
    stop() {
        this._starting = false;
        this.active = false;
        DOM.removeStyle();
        Patcher.unpatchAll();
    }
    updateStyles() {
        DOM.removeStyle();
        if (this.settings.hideCollapseButton) {
            DOM.addStyle(CSS_HIDE_COLLAPSE);
        }
    }
    getSettingsPanel() {
        const SettingsPanel = () => {
            const settings = Hooks.useData("settings") ?? this.settings;
            const updateSetting = (id, value) => {
                if (id === "hideCollapseButton" && value && !settings.forceExpanded) return;
                const newSettings = { ...settings, [id]: value };
                if (id === "forceExpanded" && !value) {
                    newSettings.hideCollapseButton = false;
                }
                this.settings = newSettings;
                Data.save("settings", newSettings);
                this.updateStyles();
            };
            return UI.buildSettingsPanel({
                settings: [
                    {
                        type: "switch",
                        id: "forceExpanded",
                        name: "Keep roles expanded",
                        note: "If disabled, roles expand once per mount so they can be temporarily collapsed.",
                        value: settings.forceExpanded
                    },
                    {
                        type: "switch",
                        id: "hideCollapseButton",
                        name: "Hide collapse button",
                        note: "Purely cosmetic. Recommended if you keep roles expanded.",
                        value: settings.hideCollapseButton,
                        disabled: !settings.forceExpanded
                    }
                ],
                onChange: (_, id, value) => updateSetting(id, value)
            });
        };
        return React.createElement(SettingsPanel);
    }
};
