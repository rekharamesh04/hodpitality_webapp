(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/(dashboard)/check-ins/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CheckInsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/constants/mock-data.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const TODAY_LABEL = 'Thursday 6 August';
const FILTER_TABS = [
    {
        key: 'all',
        label: 'All'
    },
    {
        key: 'scheduled',
        label: 'Expected'
    },
    {
        key: 'checked_in',
        label: 'On site'
    },
    {
        key: 'completed',
        label: 'Completed'
    },
    {
        key: 'cancelled',
        label: 'Cancelled'
    }
];
const STATUS_META = {
    scheduled: {
        label: 'Scheduled',
        badge: 'bg-blue-100 text-blue-800 border-blue-300'
    },
    checked_in: {
        label: 'Checked in',
        badge: 'bg-green-100 text-green-800 border-green-300'
    },
    completed: {
        label: 'Completed',
        badge: 'bg-gray-100 text-gray-600 border-gray-300'
    },
    cancelled: {
        label: 'Cancelled',
        badge: 'bg-red-50 text-red-600 border-red-200'
    },
    no_show: {
        label: 'No-show',
        badge: 'bg-orange-50 text-orange-700 border-orange-200'
    }
};
const TIER_COLORS = {
    Founding: 'bg-amber-100 text-amber-800',
    Signature: 'bg-purple-100 text-purple-800',
    Standard: 'bg-gray-100 text-gray-700'
};
function formatTime(t) {
    const [hStr, m] = t.split(':');
    const h = Number(hStr);
    const ampm = h < 12 ? 'am' : 'pm';
    const d = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return "".concat(d, ":").concat(m, " ").concat(ampm);
}
function CheckInsPage() {
    _s();
    const [appointments, setAppointments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockSpaAppointments"]);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CheckInsPage.useMemo[stats]": ()=>({
                expected: appointments.filter({
                    "CheckInsPage.useMemo[stats]": (a)=>a.status === 'scheduled'
                }["CheckInsPage.useMemo[stats]"]).length,
                onSite: appointments.filter({
                    "CheckInsPage.useMemo[stats]": (a)=>a.status === 'checked_in'
                }["CheckInsPage.useMemo[stats]"]).length,
                completed: appointments.filter({
                    "CheckInsPage.useMemo[stats]": (a)=>a.status === 'completed'
                }["CheckInsPage.useMemo[stats]"]).length,
                noShows: appointments.filter({
                    "CheckInsPage.useMemo[stats]": (a)=>a.status === 'no_show'
                }["CheckInsPage.useMemo[stats]"]).length,
                cancelled: appointments.filter({
                    "CheckInsPage.useMemo[stats]": (a)=>a.status === 'cancelled'
                }["CheckInsPage.useMemo[stats]"]).length
            })
    }["CheckInsPage.useMemo[stats]"], [
        appointments
    ]);
    const filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CheckInsPage.useMemo[filtered]": ()=>{
            const sorted = [
                ...appointments
            ].sort({
                "CheckInsPage.useMemo[filtered].sorted": (a, b)=>a.startTime.localeCompare(b.startTime)
            }["CheckInsPage.useMemo[filtered].sorted"]);
            if (activeTab === 'all') return sorted;
            return sorted.filter({
                "CheckInsPage.useMemo[filtered]": (a)=>a.status === activeTab
            }["CheckInsPage.useMemo[filtered]"]);
        }
    }["CheckInsPage.useMemo[filtered]"], [
        appointments,
        activeTab
    ]);
    function updateStatus(id, newStatus) {
        const now = new Date().toTimeString().slice(0, 5);
        setAppointments((prev)=>prev.map((a)=>a.id === id ? {
                    ...a,
                    status: newStatus,
                    checkInTime: newStatus === 'checked_in' ? now : a.checkInTime,
                    checkOutTime: newStatus === 'completed' ? now : a.checkOutTime,
                    cancelledTime: newStatus === 'cancelled' ? now : a.cancelledTime,
                    noShowTime: newStatus === 'no_show' ? now : a.noShowTime
                } : a));
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-2xl font-bold",
                        children: "Check-ins"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                        lineNumber: 84,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-muted-foreground",
                        children: [
                            "Harbor Street · ",
                            TODAY_LABEL
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                        lineNumber: 85,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                lineNumber: 83,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                        label: "Expected",
                        value: stats.expected,
                        color: "text-blue-700"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                        lineNumber: 90,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                        label: "On site",
                        value: stats.onSite,
                        color: "text-green-700"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                        label: "Completed",
                        value: stats.completed,
                        color: "text-gray-700"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                        lineNumber: 92,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                        label: "No-shows",
                        value: stats.noShows,
                        color: "text-orange-700"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                        label: "Cancelled",
                        value: stats.cancelled,
                        color: "text-red-600"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                        lineNumber: 94,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                lineNumber: 89,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-1 border-b overflow-x-auto scrollbar-none",
                children: FILTER_TABS.map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setActiveTab(tab.key),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px', activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'),
                        children: tab.label
                    }, tab.key, false, {
                        fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                        lineNumber: 100,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                lineNumber: 98,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-3",
                children: [
                    filtered.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-muted-foreground text-center py-10",
                        children: "No appointments in this category."
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                        lineNumber: 118,
                        columnNumber: 11
                    }, this),
                    filtered.map((appt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AppointmentRow, {
                            appt: appt,
                            onCheckIn: ()=>updateStatus(appt.id, 'checked_in'),
                            onComplete: ()=>updateStatus(appt.id, 'completed'),
                            onCancel: ()=>updateStatus(appt.id, 'cancelled'),
                            onNoShow: ()=>updateStatus(appt.id, 'no_show'),
                            onUndo: ()=>updateStatus(appt.id, 'scheduled')
                        }, appt.id, false, {
                            fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                            lineNumber: 121,
                            columnNumber: 11
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                lineNumber: 116,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
        lineNumber: 81,
        columnNumber: 5
    }, this);
}
_s(CheckInsPage, "9EKTo+iuUTR8GNndp/w42ed20Tg=");
_c = CheckInsPage;
function StatCard(param) {
    let { label, value, color } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-lg border bg-card px-4 py-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-2xl font-bold ".concat(color),
                children: value
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                lineNumber: 147,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-muted-foreground mt-0.5",
                children: label
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                lineNumber: 148,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
        lineNumber: 146,
        columnNumber: 5
    }, this);
}
_c1 = StatCard;
function AppointmentRow(param) {
    let { appt, onCheckIn, onComplete, onCancel, onNoShow, onUndo } = param;
    const meta = STATUS_META[appt.status];
    var _TIER_COLORS_appt_customerTier;
    const tierColor = (_TIER_COLORS_appt_customerTier = TIER_COLORS[appt.customerTier]) !== null && _TIER_COLORS_appt_customerTier !== void 0 ? _TIER_COLORS_appt_customerTier : '';
    const [h, m] = appt.startTime.split(':').map(Number);
    const endMin = h * 60 + m + appt.duration;
    const endH = Math.floor(endMin / 60);
    const endM = endMin % 60;
    const startLabel = formatTime(appt.startTime);
    const endLabel = "".concat(endH > 12 ? endH - 12 : endH, ":").concat(String(endM).padStart(2, '0'), " ").concat(endH < 12 ? 'am' : 'pm');
    var _appt_checkInTime, _appt_checkOutTime, _appt_noShowTime, _appt_cancelledTime;
    const timestampLabel = appt.status === 'checked_in' ? "In ".concat((_appt_checkInTime = appt.checkInTime) !== null && _appt_checkInTime !== void 0 ? _appt_checkInTime : '') : appt.status === 'completed' ? "Out ".concat((_appt_checkOutTime = appt.checkOutTime) !== null && _appt_checkOutTime !== void 0 ? _appt_checkOutTime : '') : appt.status === 'no_show' ? "Missed ".concat((_appt_noShowTime = appt.noShowTime) !== null && _appt_noShowTime !== void 0 ? _appt_noShowTime : '') : appt.status === 'cancelled' ? "Cancelled ".concat((_appt_cancelledTime = appt.cancelledTime) !== null && _appt_cancelledTime !== void 0 ? _appt_cancelledTime : '') : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border bg-card p-3 sm:p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 flex-1 min-w-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-16 shrink-0 text-right",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-semibold",
                                children: startLabel
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                                lineNumber: 187,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-muted-foreground",
                                children: endLabel
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                                lineNumber: 188,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                        lineNumber: 186,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0",
                        children: appt.customerInitials
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                        lineNumber: 192,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-w-0 flex-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 flex-wrap",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-semibold truncate",
                                        children: appt.customerName
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                                        lineNumber: 197,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "inline-flex items-center px-1.5 py-0 rounded-full text-xs font-medium ".concat(tierColor),
                                        children: appt.customerTier
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                                        lineNumber: 198,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                                lineNumber: 196,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-muted-foreground",
                                children: appt.customerPhone
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                                lineNumber: 202,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-muted-foreground sm:hidden",
                                children: [
                                    appt.service,
                                    " · ",
                                    appt.staffName
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                                lineNumber: 204,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                        lineNumber: 195,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                lineNumber: 184,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hidden sm:block w-48 shrink-0 min-w-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-medium truncate",
                        children: appt.service
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                        lineNumber: 210,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-muted-foreground truncate",
                        children: [
                            appt.staffName,
                            " · ",
                            appt.duration,
                            " min · ",
                            appt.room
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                        lineNumber: 211,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                lineNumber: 209,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between sm:justify-end gap-2 shrink-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-start sm:items-end gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ".concat(meta.badge),
                                children: meta.label
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                                lineNumber: 219,
                                columnNumber: 11
                            }, this),
                            timestampLabel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs text-muted-foreground",
                                children: timestampLabel
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                                lineNumber: 223,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                        lineNumber: 218,
                        columnNumber: 9
                    }, this),
                    appt.status === 'scheduled' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                size: "sm",
                                className: "h-7 text-xs px-2",
                                onClick: onCheckIn,
                                children: "Check in"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                                lineNumber: 229,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                size: "sm",
                                variant: "outline",
                                className: "h-7 text-xs px-2",
                                onClick: onCancel,
                                children: "Cancel"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                                lineNumber: 230,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                        lineNumber: 228,
                        columnNumber: 11
                    }, this),
                    appt.status === 'checked_in' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        size: "sm",
                        className: "h-7 text-xs px-2",
                        onClick: onComplete,
                        children: "Complete"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                        lineNumber: 234,
                        columnNumber: 11
                    }, this),
                    (appt.status === 'no_show' || appt.status === 'cancelled') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        size: "sm",
                        variant: "outline",
                        className: "h-7 text-xs px-2",
                        onClick: onUndo,
                        children: "Undo"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                        lineNumber: 237,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
                lineNumber: 217,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(dashboard)/check-ins/page.tsx",
        lineNumber: 182,
        columnNumber: 5
    }, this);
}
_c2 = AppointmentRow;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "CheckInsPage");
__turbopack_context__.k.register(_c1, "StatCard");
__turbopack_context__.k.register(_c2, "AppointmentRow");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_%28dashboard%29_check-ins_page_tsx_4905ff92._.js.map