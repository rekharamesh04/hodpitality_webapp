(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/dashboard/WelcomeHeader.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WelcomeHeader",
    ()=>WelcomeHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/store/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$auth$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/auth-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function WelcomeHeader() {
    var _user_name;
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$auth$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthStore"])();
    const currentDate = new Date();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mb-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-3xl font-bold",
                children: [
                    "Welcome back, ",
                    (user === null || user === void 0 ? void 0 : (_user_name = user.name) === null || _user_name === void 0 ? void 0 : _user_name.split(' ')[0]) || 'Admin',
                    "! 👋"
                ]
            }, void 0, true, {
                fileName: "[project]/components/dashboard/WelcomeHeader.tsx",
                lineNumber: 12,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-2 text-muted-foreground",
                children: [
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDate"])(currentDate, 'MMMM dd, yyyy'),
                    " • Here's what's happening today"
                ]
            }, void 0, true, {
                fileName: "[project]/components/dashboard/WelcomeHeader.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/dashboard/WelcomeHeader.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
_s(WelcomeHeader, "aAjLQdegBonWw6v8amJtA1nd/MY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$auth$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthStore"]
    ];
});
_c = WelcomeHeader;
var _c;
__turbopack_context__.k.register(_c, "WelcomeHeader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Card",
    ()=>Card,
    "CardContent",
    ()=>CardContent,
    "CardDescription",
    ()=>CardDescription,
    "CardFooter",
    ()=>CardFooter,
    "CardHeader",
    ()=>CardHeader,
    "CardTitle",
    ()=>CardTitle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
const Card = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = (param, ref)=>{
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("rounded-xl border border-border bg-card text-card-foreground shadow-[var(--shadow-soft)]", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 8,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Card;
Card.displayName = "Card";
const CardHeader = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c2 = (param, ref)=>{
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col space-y-1.5 p-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 23,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
});
_c3 = CardHeader;
CardHeader.displayName = "CardHeader";
const CardTitle = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c4 = (param, ref)=>{
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-base font-semibold leading-none tracking-tight", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 35,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
});
_c5 = CardTitle;
CardTitle.displayName = "CardTitle";
const CardDescription = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c6 = (param, ref)=>{
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-sm text-muted-foreground", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 47,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
});
_c7 = CardDescription;
CardDescription.displayName = "CardDescription";
const CardContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c8 = (param, ref)=>{
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("p-6 pt-0", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 59,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
});
_c9 = CardContent;
CardContent.displayName = "CardContent";
const CardFooter = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c10 = (param, ref)=>{
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex items-center p-6 pt-0", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 67,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
});
_c11 = CardFooter;
CardFooter.displayName = "CardFooter";
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10, _c11;
__turbopack_context__.k.register(_c, "Card$React.forwardRef");
__turbopack_context__.k.register(_c1, "Card");
__turbopack_context__.k.register(_c2, "CardHeader$React.forwardRef");
__turbopack_context__.k.register(_c3, "CardHeader");
__turbopack_context__.k.register(_c4, "CardTitle$React.forwardRef");
__turbopack_context__.k.register(_c5, "CardTitle");
__turbopack_context__.k.register(_c6, "CardDescription$React.forwardRef");
__turbopack_context__.k.register(_c7, "CardDescription");
__turbopack_context__.k.register(_c8, "CardContent$React.forwardRef");
__turbopack_context__.k.register(_c9, "CardContent");
__turbopack_context__.k.register(_c10, "CardFooter$React.forwardRef");
__turbopack_context__.k.register(_c11, "CardFooter");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/dashboard/StatsCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StatsCard",
    ()=>StatsCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
;
;
;
;
function StatsCard(param) {
    let { title, value, icon: Icon, trend, className } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        initial: {
            opacity: 0,
            y: 20
        },
        animate: {
            opacity: 1,
            y: 0
        },
        transition: {
            duration: 0.3
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('card-hover', className),
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                className: "pt-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-medium text-muted-foreground",
                                    children: title
                                }, void 0, false, {
                                    fileName: "[project]/components/dashboard/StatsCard.tsx",
                                    lineNumber: 28,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "mt-2 text-3xl font-bold",
                                    children: value
                                }, void 0, false, {
                                    fileName: "[project]/components/dashboard/StatsCard.tsx",
                                    lineNumber: 29,
                                    columnNumber: 15
                                }, this),
                                trend && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('mt-2 text-sm font-medium', trend.isPositive ? 'text-success' : 'text-danger'),
                                    children: [
                                        trend.isPositive ? '+' : '',
                                        trend.value,
                                        "% from last week"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/dashboard/StatsCard.tsx",
                                    lineNumber: 31,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/dashboard/StatsCard.tsx",
                            lineNumber: 27,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                className: "h-6 w-6 text-primary"
                            }, void 0, false, {
                                fileName: "[project]/components/dashboard/StatsCard.tsx",
                                lineNumber: 40,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/dashboard/StatsCard.tsx",
                            lineNumber: 39,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/dashboard/StatsCard.tsx",
                    lineNumber: 26,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/dashboard/StatsCard.tsx",
                lineNumber: 25,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/dashboard/StatsCard.tsx",
            lineNumber: 24,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/dashboard/StatsCard.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
_c = StatsCard;
var _c;
__turbopack_context__.k.register(_c, "StatsCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/dashboard/ActivityFeed.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ActivityFeed",
    ()=>ActivityFeed
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$scroll$2d$area$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/scroll-area.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.js [app-client] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserPlus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-plus.js [app-client] (ecmascript) <export default as UserPlus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hotel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Hotel$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/hotel.js [app-client] (ecmascript) <export default as Hotel>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
'use client';
;
;
;
;
;
const iconMap = {
    check_in: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"],
    registration: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserPlus$3e$__["UserPlus"],
    hospitality: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hotel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Hotel$3e$__["Hotel"],
    event: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"],
    system: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"]
};
function ActivityFeed(param) {
    let { activities } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                    children: "Recent Activity"
                }, void 0, false, {
                    fileName: "[project]/components/dashboard/ActivityFeed.tsx",
                    lineNumber: 26,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/dashboard/ActivityFeed.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$scroll$2d$area$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollArea"], {
                    className: "h-[400px] pr-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: activities.map((activity)=>{
                            const Icon = iconMap[activity.type] || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"];
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                            className: "h-5 w-5 text-primary"
                                        }, void 0, false, {
                                            fileName: "[project]/components/dashboard/ActivityFeed.tsx",
                                            lineNumber: 36,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/dashboard/ActivityFeed.tsx",
                                        lineNumber: 35,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 space-y-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-medium leading-none",
                                                children: activity.title
                                            }, void 0, false, {
                                                fileName: "[project]/components/dashboard/ActivityFeed.tsx",
                                                lineNumber: 39,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-muted-foreground",
                                                children: activity.description
                                            }, void 0, false, {
                                                fileName: "[project]/components/dashboard/ActivityFeed.tsx",
                                                lineNumber: 40,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 text-xs text-muted-foreground",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRelativeTime"])(activity.timestamp)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/dashboard/ActivityFeed.tsx",
                                                        lineNumber: 42,
                                                        columnNumber: 23
                                                    }, this),
                                                    activity.user && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: "•"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/dashboard/ActivityFeed.tsx",
                                                                lineNumber: 45,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: [
                                                                    "by ",
                                                                    activity.user
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/dashboard/ActivityFeed.tsx",
                                                                lineNumber: 46,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/dashboard/ActivityFeed.tsx",
                                                lineNumber: 41,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/dashboard/ActivityFeed.tsx",
                                        lineNumber: 38,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, activity.id, true, {
                                fileName: "[project]/components/dashboard/ActivityFeed.tsx",
                                lineNumber: 34,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/ActivityFeed.tsx",
                        lineNumber: 30,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/dashboard/ActivityFeed.tsx",
                    lineNumber: 29,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/dashboard/ActivityFeed.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/dashboard/ActivityFeed.tsx",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
_c = ActivityFeed;
var _c;
__turbopack_context__.k.register(_c, "ActivityFeed");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/dashboard/UpcomingEvents.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UpcomingEvents",
    ()=>UpcomingEvents
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-client] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
'use client';
;
;
;
;
;
;
;
function UpcomingEvents(param) {
    let { events } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                className: "flex flex-row items-center justify-between space-y-0 pb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                        children: "Upcoming Events"
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/UpcomingEvents.tsx",
                        lineNumber: 19,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/events",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "ghost",
                            size: "sm",
                            children: [
                                "View all",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                    className: "ml-2 h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/components/dashboard/UpcomingEvents.tsx",
                                    lineNumber: 23,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/dashboard/UpcomingEvents.tsx",
                            lineNumber: 21,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/dashboard/UpcomingEvents.tsx",
                        lineNumber: 20,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/dashboard/UpcomingEvents.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4",
                    children: events.slice(0, 5).map((event)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-accent",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs font-semibold",
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDate"])(event.startDate, 'MMM')
                                        }, void 0, false, {
                                            fileName: "[project]/components/dashboard/UpcomingEvents.tsx",
                                            lineNumber: 32,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-lg font-bold",
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDate"])(event.startDate, 'dd')
                                        }, void 0, false, {
                                            fileName: "[project]/components/dashboard/UpcomingEvents.tsx",
                                            lineNumber: 35,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/dashboard/UpcomingEvents.tsx",
                                    lineNumber: 31,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 space-y-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-start justify-between gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                    className: "font-semibold leading-none",
                                                    children: event.title
                                                }, void 0, false, {
                                                    fileName: "[project]/components/dashboard/UpcomingEvents.tsx",
                                                    lineNumber: 41,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    variant: "outline",
                                                    children: event.category
                                                }, void 0, false, {
                                                    fileName: "[project]/components/dashboard/UpcomingEvents.tsx",
                                                    lineNumber: 42,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/dashboard/UpcomingEvents.tsx",
                                            lineNumber: 40,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col gap-1 text-sm text-muted-foreground",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                            className: "h-3 w-3"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/dashboard/UpcomingEvents.tsx",
                                                            lineNumber: 46,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: event.venue
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/dashboard/UpcomingEvents.tsx",
                                                            lineNumber: 47,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/dashboard/UpcomingEvents.tsx",
                                                    lineNumber: 45,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                            className: "h-3 w-3"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/dashboard/UpcomingEvents.tsx",
                                                            lineNumber: 50,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: [
                                                                event.attendees,
                                                                " / ",
                                                                event.capacity,
                                                                " attendees"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/dashboard/UpcomingEvents.tsx",
                                                            lineNumber: 51,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/dashboard/UpcomingEvents.tsx",
                                                    lineNumber: 49,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/dashboard/UpcomingEvents.tsx",
                                            lineNumber: 44,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/dashboard/UpcomingEvents.tsx",
                                    lineNumber: 39,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, event.id, true, {
                            fileName: "[project]/components/dashboard/UpcomingEvents.tsx",
                            lineNumber: 30,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/components/dashboard/UpcomingEvents.tsx",
                    lineNumber: 28,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/dashboard/UpcomingEvents.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/dashboard/UpcomingEvents.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
_c = UpcomingEvents;
var _c;
__turbopack_context__.k.register(_c, "UpcomingEvents");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/progress.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Progress",
    ()=>Progress
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$progress$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-progress/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
const Progress = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = (param, ref)=>{
    let { className, value, indicatorClassName, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$progress$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative h-2 w-full overflow-hidden rounded-full bg-muted", className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$progress$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Indicator"], {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("h-full w-full flex-1 bg-primary transition-all duration-500 ease-out rounded-full", indicatorClassName),
            style: {
                transform: "translateX(-".concat(100 - (value || 0), "%)")
            }
        }, void 0, false, {
            fileName: "[project]/components/ui/progress.tsx",
            lineNumber: 16,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/components/ui/progress.tsx",
        lineNumber: 11,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Progress;
Progress.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$progress$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"].displayName;
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Progress$React.forwardRef");
__turbopack_context__.k.register(_c1, "Progress");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/dashboard/VenueOccupancy.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VenueOccupancy",
    ()=>VenueOccupancy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$progress$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/progress.tsx [app-client] (ecmascript)");
'use client';
;
;
;
function VenueOccupancy(param) {
    let { venues } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                    children: "Venue Occupancy"
                }, void 0, false, {
                    fileName: "[project]/components/dashboard/VenueOccupancy.tsx",
                    lineNumber: 15,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/dashboard/VenueOccupancy.tsx",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4",
                    children: venues.map((venue)=>{
                        const occupancyPercent = venue.currentOccupancy / venue.capacity * 100;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between text-sm",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-medium",
                                            children: venue.name
                                        }, void 0, false, {
                                            fileName: "[project]/components/dashboard/VenueOccupancy.tsx",
                                            lineNumber: 24,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-muted-foreground",
                                            children: [
                                                venue.currentOccupancy,
                                                " / ",
                                                venue.capacity
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/dashboard/VenueOccupancy.tsx",
                                            lineNumber: 25,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/dashboard/VenueOccupancy.tsx",
                                    lineNumber: 23,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$progress$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Progress"], {
                                    value: occupancyPercent,
                                    className: "h-2"
                                }, void 0, false, {
                                    fileName: "[project]/components/dashboard/VenueOccupancy.tsx",
                                    lineNumber: 29,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, venue.id, true, {
                            fileName: "[project]/components/dashboard/VenueOccupancy.tsx",
                            lineNumber: 22,
                            columnNumber: 15
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/components/dashboard/VenueOccupancy.tsx",
                    lineNumber: 18,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/dashboard/VenueOccupancy.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/dashboard/VenueOccupancy.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = VenueOccupancy;
var _c;
__turbopack_context__.k.register(_c, "VenueOccupancy");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/dashboard/QuickActions.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "QuickActions",
    ()=>QuickActions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserPlus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-plus.js [app-client] (ecmascript) <export default as UserPlus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hotel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Hotel$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/hotel.js [app-client] (ecmascript) <export default as Hotel>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function QuickActions() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const actions = [
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserPlus$3e$__["UserPlus"],
            label: 'Add Guest',
            description: 'Register new guest',
            onClick: ()=>router.push('/guests?action=add'),
            color: 'text-blue-600',
            bg: 'bg-blue-50 dark:bg-blue-950/30'
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"],
            label: 'Check-in',
            description: 'Manual check-in',
            onClick: ()=>router.push('/check-ins?action=checkin'),
            color: 'text-green-600',
            bg: 'bg-green-50 dark:bg-green-950/30'
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hotel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Hotel$3e$__["Hotel"],
            label: 'Hospitality',
            description: 'Book service',
            onClick: ()=>router.push('/hospitality?action=add'),
            color: 'text-purple-600',
            bg: 'bg-purple-50 dark:bg-purple-950/30'
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"],
            label: 'New Event',
            description: 'Create event',
            onClick: ()=>router.push('/events?action=add'),
            color: 'text-orange-600',
            bg: 'bg-orange-50 dark:bg-orange-950/30'
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"],
            label: 'Generate Report',
            description: 'Create report',
            onClick: ()=>router.push('/reports?action=generate'),
            color: 'text-cyan-600',
            bg: 'bg-cyan-50 dark:bg-cyan-950/30'
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
            label: 'Manage Staff',
            description: 'View team',
            onClick: ()=>router.push('/staff'),
            color: 'text-pink-600',
            bg: 'bg-pink-50 dark:bg-pink-950/30'
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                    children: "Quick Actions"
                }, void 0, false, {
                    fileName: "[project]/components/dashboard/QuickActions.tsx",
                    lineNumber: 65,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/dashboard/QuickActions.tsx",
                lineNumber: 64,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-2 gap-3 sm:grid-cols-3",
                    children: actions.map((action)=>{
                        const Icon = action.icon;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "outline",
                            className: "h-auto flex-col items-start gap-2 p-4 hover:bg-accent",
                            onClick: action.onClick,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex h-10 w-10 items-center justify-center rounded-lg ".concat(action.bg),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                        className: "h-5 w-5 ".concat(action.color)
                                    }, void 0, false, {
                                        fileName: "[project]/components/dashboard/QuickActions.tsx",
                                        lineNumber: 79,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/dashboard/QuickActions.tsx",
                                    lineNumber: 78,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-left",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "font-semibold",
                                            children: action.label
                                        }, void 0, false, {
                                            fileName: "[project]/components/dashboard/QuickActions.tsx",
                                            lineNumber: 82,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-muted-foreground",
                                            children: action.description
                                        }, void 0, false, {
                                            fileName: "[project]/components/dashboard/QuickActions.tsx",
                                            lineNumber: 83,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/dashboard/QuickActions.tsx",
                                    lineNumber: 81,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, action.label, true, {
                            fileName: "[project]/components/dashboard/QuickActions.tsx",
                            lineNumber: 72,
                            columnNumber: 15
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/components/dashboard/QuickActions.tsx",
                    lineNumber: 68,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/dashboard/QuickActions.tsx",
                lineNumber: 67,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/dashboard/QuickActions.tsx",
        lineNumber: 63,
        columnNumber: 5
    }, this);
}
_s(QuickActions, "fN7XvhJ+p5oE6+Xlo0NJmXpxjC8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = QuickActions;
var _c;
__turbopack_context__.k.register(_c, "QuickActions");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/charts/LineChartComponent.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LineChartComponent",
    ()=>LineChartComponent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$LineChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/LineChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/Line.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/XAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/YAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/CartesianGrid.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Tooltip.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/ResponsiveContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/constants/index.ts [app-client] (ecmascript) <locals>");
'use client';
;
;
;
;
function LineChartComponent(param) {
    let { title, description, data, dataKey, xAxisKey, height = 300 } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/components/charts/LineChartComponent.tsx",
                        lineNumber: 27,
                        columnNumber: 9
                    }, this),
                    description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardDescription"], {
                        children: description
                    }, void 0, false, {
                        fileName: "[project]/components/charts/LineChartComponent.tsx",
                        lineNumber: 28,
                        columnNumber: 25
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/charts/LineChartComponent.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                    width: "100%",
                    height: height,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$LineChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LineChart"], {
                        data: data,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                                strokeDasharray: "3 3",
                                stroke: "hsl(var(--border))"
                            }, void 0, false, {
                                fileName: "[project]/components/charts/LineChartComponent.tsx",
                                lineNumber: 33,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["XAxis"], {
                                dataKey: xAxisKey,
                                stroke: "hsl(var(--muted-foreground))",
                                fontSize: 12
                            }, void 0, false, {
                                fileName: "[project]/components/charts/LineChartComponent.tsx",
                                lineNumber: 34,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YAxis"], {
                                stroke: "hsl(var(--muted-foreground))",
                                fontSize: 12
                            }, void 0, false, {
                                fileName: "[project]/components/charts/LineChartComponent.tsx",
                                lineNumber: 39,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                contentStyle: {
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px'
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/charts/LineChartComponent.tsx",
                                lineNumber: 40,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line"], {
                                type: "monotone",
                                dataKey: dataKey,
                                stroke: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHART_COLORS"].PRIMARY,
                                strokeWidth: 2,
                                dot: {
                                    fill: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHART_COLORS"].PRIMARY,
                                    strokeWidth: 2
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/charts/LineChartComponent.tsx",
                                lineNumber: 47,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/charts/LineChartComponent.tsx",
                        lineNumber: 32,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/charts/LineChartComponent.tsx",
                    lineNumber: 31,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/charts/LineChartComponent.tsx",
                lineNumber: 30,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/charts/LineChartComponent.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
_c = LineChartComponent;
var _c;
__turbopack_context__.k.register(_c, "LineChartComponent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/charts/PieChartComponent.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PieChartComponent",
    ()=>PieChartComponent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$PieChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/PieChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$Pie$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/polar/Pie.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Cell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Cell.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/ResponsiveContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Tooltip.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Legend.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/constants/index.ts [app-client] (ecmascript) <locals>");
'use client';
;
;
;
;
const COLORS = [
    __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHART_COLORS"].PRIMARY,
    __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHART_COLORS"].SECONDARY,
    __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHART_COLORS"].SUCCESS,
    __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHART_COLORS"].WARNING,
    __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHART_COLORS"].DANGER,
    __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHART_COLORS"].INFO,
    __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHART_COLORS"].PURPLE,
    __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CHART_COLORS"].PINK
];
function PieChartComponent(param) {
    let { title, description, data, height = 300 } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/components/charts/PieChartComponent.tsx",
                        lineNumber: 34,
                        columnNumber: 9
                    }, this),
                    description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardDescription"], {
                        children: description
                    }, void 0, false, {
                        fileName: "[project]/components/charts/PieChartComponent.tsx",
                        lineNumber: 35,
                        columnNumber: 25
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/charts/PieChartComponent.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                    width: "100%",
                    height: height,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$PieChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PieChart"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$Pie$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Pie"], {
                                data: data,
                                cx: "50%",
                                cy: "50%",
                                labelLine: false,
                                label: (param)=>{
                                    let { name, percent } = param;
                                    return "".concat(name, ": ").concat((percent * 100).toFixed(0), "%");
                                },
                                outerRadius: 100,
                                fill: "#8884d8",
                                dataKey: "value",
                                children: data.map((entry, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Cell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Cell"], {
                                        fill: COLORS[index % COLORS.length]
                                    }, "cell-".concat(index), false, {
                                        fileName: "[project]/components/charts/PieChartComponent.tsx",
                                        lineNumber: 51,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/charts/PieChartComponent.tsx",
                                lineNumber: 40,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                contentStyle: {
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px'
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/charts/PieChartComponent.tsx",
                                lineNumber: 54,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Legend"], {}, void 0, false, {
                                fileName: "[project]/components/charts/PieChartComponent.tsx",
                                lineNumber: 61,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/charts/PieChartComponent.tsx",
                        lineNumber: 39,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/charts/PieChartComponent.tsx",
                    lineNumber: 38,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/charts/PieChartComponent.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/charts/PieChartComponent.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
_c = PieChartComponent;
var _c;
__turbopack_context__.k.register(_c, "PieChartComponent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/constants/mock-data.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mockActivityFeed",
    ()=>mockActivityFeed,
    "mockCalendarStaff",
    ()=>mockCalendarStaff,
    "mockCheckInTrends",
    ()=>mockCheckInTrends,
    "mockCheckIns",
    ()=>mockCheckIns,
    "mockCustomers",
    ()=>mockCustomers,
    "mockDashboardStats",
    ()=>mockDashboardStats,
    "mockEvents",
    ()=>mockEvents,
    "mockGuestCategories",
    ()=>mockGuestCategories,
    "mockGuests",
    ()=>mockGuests,
    "mockHospitality",
    ()=>mockHospitality,
    "mockMonthlyStats",
    ()=>mockMonthlyStats,
    "mockNotifications",
    ()=>mockNotifications,
    "mockRegistrations",
    ()=>mockRegistrations,
    "mockSpaAppointments",
    ()=>mockSpaAppointments,
    "mockSpaServices",
    ()=>mockSpaServices,
    "mockStaff",
    ()=>mockStaff,
    "mockVenueUtilization",
    ()=>mockVenueUtilization,
    "mockVenues",
    ()=>mockVenues,
    "mockVisitHistory",
    ()=>mockVisitHistory
]);
const mockDashboardStats = {
    todayCheckIns: 248,
    guestsArrived: 1247,
    pendingGuests: 153,
    hospitalityBookings: 89,
    venueOccupancy: 78,
    totalGuests: 1400,
    totalEvents: 12,
    activeStaff: 45
};
const mockGuests = [
    {
        id: '1',
        name: 'Sarah Anderson',
        email: 'sarah.anderson@company.com',
        phone: '+1 (555) 123-4567',
        company: 'Tech Corp',
        designation: 'CEO',
        category: 'VIP',
        status: 'active',
        checkedIn: true,
        checkInTime: '2024-01-15T09:30:00Z',
        registrationDate: '2024-01-10T10:00:00Z',
        qrCode: 'QR001',
        tags: [
            'VIP',
            'Speaker'
        ]
    },
    {
        id: '2',
        name: 'Michael Chen',
        email: 'michael.chen@startup.io',
        phone: '+1 (555) 234-5678',
        company: 'Startup IO',
        designation: 'CTO',
        category: 'Speaker',
        status: 'active',
        checkedIn: false,
        registrationDate: '2024-01-12T14:30:00Z',
        qrCode: 'QR002',
        tags: [
            'Speaker',
            'Tech'
        ]
    },
    {
        id: '3',
        name: 'Emily Rodriguez',
        email: 'emily.r@designstudio.com',
        phone: '+1 (555) 345-6789',
        company: 'Design Studio',
        designation: 'Creative Director',
        category: 'Delegate',
        status: 'active',
        checkedIn: true,
        checkInTime: '2024-01-15T08:45:00Z',
        registrationDate: '2024-01-11T16:20:00Z',
        qrCode: 'QR003',
        tags: [
            'Delegate'
        ]
    }
];
const mockCheckIns = [
    {
        id: '1',
        guestId: '1',
        guestName: 'Sarah Anderson',
        guestEmail: 'sarah.anderson@company.com',
        checkInTime: '2024-01-15T09:30:00Z',
        checkInMethod: 'QR',
        venue: 'Main Hall',
        event: 'Tech Summit 2024',
        badgePrinted: true,
        verifiedBy: 'John Staff'
    },
    {
        id: '2',
        guestId: '3',
        guestName: 'Emily Rodriguez',
        guestEmail: 'emily.r@designstudio.com',
        checkInTime: '2024-01-15T08:45:00Z',
        checkInMethod: 'Manual',
        venue: 'Main Hall',
        event: 'Tech Summit 2024',
        badgePrinted: true,
        verifiedBy: 'Jane Staff'
    }
];
const mockRegistrations = [
    {
        id: '1',
        guestName: 'Sarah Anderson',
        guestEmail: 'sarah.anderson@company.com',
        phone: '+1 (555) 123-4567',
        event: 'Tech Summit 2024',
        registrationDate: '2024-01-10T10:00:00Z',
        status: 'confirmed',
        paymentStatus: 'paid',
        amount: 500,
        category: 'VIP'
    },
    {
        id: '2',
        guestName: 'Michael Chen',
        guestEmail: 'michael.chen@startup.io',
        phone: '+1 (555) 234-5678',
        event: 'Tech Summit 2024',
        registrationDate: '2024-01-12T14:30:00Z',
        status: 'pending',
        paymentStatus: 'pending',
        amount: 350,
        category: 'Speaker'
    }
];
const mockHospitality = [
    {
        id: '1',
        guestId: '1',
        guestName: 'Sarah Anderson',
        type: 'Hotel',
        description: 'Grand Hotel - Presidential Suite',
        status: 'confirmed',
        bookingDate: '2024-01-10T10:00:00Z',
        serviceDate: '2024-01-15T00:00:00Z',
        venue: 'Grand Hotel',
        cost: 500
    },
    {
        id: '2',
        guestId: '1',
        guestName: 'Sarah Anderson',
        type: 'Airport Pickup',
        description: 'Airport transfer - Luxury sedan',
        status: 'completed',
        bookingDate: '2024-01-10T10:00:00Z',
        serviceDate: '2024-01-14T18:00:00Z',
        cost: 80
    },
    {
        id: '3',
        guestId: '2',
        guestName: 'Michael Chen',
        type: 'Meal',
        description: 'VIP Dinner - Day 1',
        status: 'pending',
        bookingDate: '2024-01-12T14:30:00Z',
        serviceDate: '2024-01-15T19:00:00Z',
        venue: 'Main Hall',
        cost: 150
    }
];
const mockVenues = [
    {
        id: '1',
        name: 'Main Hall',
        capacity: 500,
        currentOccupancy: 380,
        type: 'Conference Hall',
        location: 'Building A - Ground Floor',
        status: 'active',
        amenities: [
            'WiFi',
            'Projector',
            'Sound System',
            'AC',
            'Stage'
        ]
    },
    {
        id: '2',
        name: 'Meeting Room 1',
        capacity: 50,
        currentOccupancy: 35,
        type: 'Meeting Room',
        location: 'Building B - 2nd Floor',
        status: 'active',
        amenities: [
            'WiFi',
            'TV Screen',
            'Whiteboard',
            'AC'
        ]
    },
    {
        id: '3',
        name: 'Auditorium',
        capacity: 1000,
        currentOccupancy: 0,
        type: 'Auditorium',
        location: 'Building A - 3rd Floor',
        status: 'inactive',
        amenities: [
            'WiFi',
            'Stage',
            'Sound System',
            'Lighting',
            'AC',
            'Recording'
        ]
    }
];
const mockEvents = [
    {
        id: '1',
        title: 'Tech Summit 2024',
        description: 'Annual technology conference',
        startDate: '2024-01-15T09:00:00Z',
        endDate: '2024-01-17T18:00:00Z',
        venue: 'Main Hall',
        venueId: '1',
        status: 'active',
        attendees: 380,
        capacity: 500,
        category: 'Conference',
        organizer: 'Tech Corp'
    },
    {
        id: '2',
        title: 'Workshop: AI & ML',
        description: 'Hands-on workshop on AI and Machine Learning',
        startDate: '2024-01-16T14:00:00Z',
        endDate: '2024-01-16T17:00:00Z',
        venue: 'Meeting Room 1',
        venueId: '2',
        status: 'active',
        attendees: 35,
        capacity: 50,
        category: 'Workshop',
        organizer: 'AI Labs'
    }
];
const mockStaff = [
    {
        id: '1',
        name: 'John Staff',
        email: 'john.staff@entryflow.com',
        phone: '+1 (555) 111-2222',
        role: 'manager',
        department: 'Operations',
        status: 'active',
        joinedDate: '2023-06-15T00:00:00Z'
    },
    {
        id: '2',
        name: 'Jane Staff',
        email: 'jane.staff@entryflow.com',
        phone: '+1 (555) 222-3333',
        role: 'staff',
        department: 'Registration',
        status: 'active',
        joinedDate: '2023-08-20T00:00:00Z'
    }
];
const mockNotifications = [
    {
        id: '1',
        title: 'New Guest Registration',
        message: 'Sarah Anderson registered for Tech Summit 2024',
        type: 'info',
        read: false,
        createdAt: '2024-01-15T09:30:00Z'
    },
    {
        id: '2',
        title: 'Check-in Complete',
        message: 'Emily Rodriguez checked in successfully',
        type: 'success',
        read: false,
        createdAt: '2024-01-15T09:25:00Z'
    },
    {
        id: '3',
        title: 'Venue at Capacity',
        message: 'Main Hall is at 90% capacity',
        type: 'warning',
        read: true,
        createdAt: '2024-01-15T09:00:00Z'
    }
];
const mockActivityFeed = [
    {
        id: '1',
        type: 'check_in',
        title: 'Guest Checked In',
        description: 'Sarah Anderson checked in at Main Hall',
        timestamp: '2024-01-15T09:30:00Z',
        user: 'John Staff'
    },
    {
        id: '2',
        type: 'registration',
        title: 'New Registration',
        description: 'Michael Chen registered for Tech Summit 2024',
        timestamp: '2024-01-15T09:20:00Z'
    },
    {
        id: '3',
        type: 'hospitality',
        title: 'Hospitality Booking',
        description: 'Hotel booking confirmed for Sarah Anderson',
        timestamp: '2024-01-15T09:10:00Z',
        user: 'Jane Staff'
    },
    {
        id: '4',
        type: 'event',
        title: 'Event Started',
        description: 'Tech Summit 2024 has started',
        timestamp: '2024-01-15T09:00:00Z'
    }
];
const mockCheckInTrends = [
    {
        name: 'Mon',
        value: 45
    },
    {
        name: 'Tue',
        value: 67
    },
    {
        name: 'Wed',
        value: 89
    },
    {
        name: 'Thu',
        value: 124
    },
    {
        name: 'Fri',
        value: 156
    },
    {
        name: 'Sat',
        value: 187
    },
    {
        name: 'Sun',
        value: 92
    }
];
const mockGuestCategories = [
    {
        name: 'VIP',
        value: 150,
        label: '15%'
    },
    {
        name: 'Speaker',
        value: 80,
        label: '8%'
    },
    {
        name: 'Delegate',
        value: 600,
        label: '60%'
    },
    {
        name: 'Staff',
        value: 120,
        label: '12%'
    },
    {
        name: 'Press',
        value: 50,
        label: '5%'
    }
];
const mockVenueUtilization = [
    {
        name: 'Main Hall',
        value: 76
    },
    {
        name: 'Meeting Room 1',
        value: 70
    },
    {
        name: 'Meeting Room 2',
        value: 45
    },
    {
        name: 'Auditorium',
        value: 0
    },
    {
        name: 'Banquet Hall',
        value: 85
    }
];
const mockMonthlyStats = [
    {
        name: 'Jan',
        guests: 1200,
        events: 8,
        revenue: 45000
    },
    {
        name: 'Feb',
        guests: 980,
        events: 6,
        revenue: 38000
    },
    {
        name: 'Mar',
        guests: 1450,
        events: 10,
        revenue: 52000
    },
    {
        name: 'Apr',
        guests: 1680,
        events: 12,
        revenue: 61000
    },
    {
        name: 'May',
        guests: 1320,
        events: 9,
        revenue: 48000
    },
    {
        name: 'Jun',
        guests: 1550,
        events: 11,
        revenue: 56000
    }
];
const mockSpaServices = [
    {
        id: 's1',
        name: 'Consultation',
        duration: 30,
        room: 'Suite A'
    },
    {
        id: 's2',
        name: 'Standard session',
        duration: 60,
        room: 'Room 1'
    },
    {
        id: 's3',
        name: 'Extended session',
        duration: 90,
        room: 'Room 2'
    },
    {
        id: 's4',
        name: 'Group session',
        duration: 60,
        room: 'Room 4'
    }
];
const mockCalendarStaff = [
    {
        id: 'st1',
        shortName: 'A. Okonjo',
        rooms: 'Rooms 1–2'
    },
    {
        id: 'st2',
        shortName: 'M. Reyes',
        rooms: 'Room 3'
    },
    {
        id: 'st3',
        shortName: 'T. Lindqvist',
        rooms: 'Room 4'
    },
    {
        id: 'st4',
        shortName: 'J. Park',
        rooms: 'Suite A'
    }
];
const mockCustomers = [
    {
        id: 'c1',
        name: 'Adaeze Nwosu',
        initials: 'AN',
        email: 'a.nwosu@fieldnote.co',
        phone: '(415) 555-0132',
        preferredContact: 'SMS',
        preferences: 'Mornings, quiet room',
        homeLocation: 'Harbor Street',
        balance: 0,
        tier: 'Founding',
        memberSince: 'Mar 2019',
        visits: 64,
        upcomingCount: 2,
        missedVisits: 0,
        notes: 'Prefers the quiet room at the back. Citrus allergy — no citrus-based products. Books herself; do not call, text only.',
        hasAllergy: true,
        allergyNote: 'Citrus allergy',
        customerId: 'C1-L1',
        lastVisit: '28 Jul 2026',
        nextAppointment: 'Today 12:00 pm',
        photoUrl: undefined
    },
    {
        id: 'c2',
        name: 'Cleo Fairbanks',
        initials: 'CF',
        email: 'cleodfairbanks@gmail.com',
        phone: '(415) 555-0187',
        preferredContact: 'Email',
        preferences: 'Afternoons',
        homeLocation: 'Harbor Street',
        balance: 0,
        tier: 'Signature',
        memberSince: 'Jun 2020',
        visits: 31,
        upcomingCount: 1,
        missedVisits: 1,
        notes: 'Prefers afternoon appointments. No specific product restrictions.',
        customerId: 'C2-L1',
        lastVisit: '21 Jul 2026',
        nextAppointment: 'Today 9:00 am',
        photoUrl: undefined
    },
    {
        id: 'c3',
        name: 'Tarquin Osei',
        initials: 'TO',
        email: 'tarquinosei@pm.me',
        phone: '(415) 555-0209',
        preferredContact: 'Call',
        preferences: 'No preference',
        homeLocation: 'Harbor Street',
        balance: 0,
        tier: 'Standard',
        memberSince: 'Feb 2022',
        visits: 12,
        upcomingCount: 0,
        missedVisits: 2,
        notes: 'Has missed two appointments this year. Confirm by phone 24h ahead.',
        customerId: 'C3-L1',
        lastVisit: '10 Jul 2026',
        nextAppointment: undefined,
        photoUrl: undefined
    },
    {
        id: 'c4',
        name: 'Marisol Venegas',
        initials: 'MV',
        email: 'm.venegas@studio44.com',
        phone: '(415) 555-0341',
        preferredContact: 'SMS',
        preferences: 'Evenings, aromatherapy',
        homeLocation: 'Harbor Street',
        balance: 40,
        tier: 'Founding',
        memberSince: 'Jan 2019',
        visits: 72,
        upcomingCount: 1,
        missedVisits: 0,
        notes: 'Loves aromatherapy add-ons. Prefers M. Reyes for extended sessions.',
        hasAllergy: false,
        customerId: 'C4-L1',
        lastVisit: '01 Aug 2026',
        nextAppointment: 'Today 2:00 pm',
        photoUrl: undefined
    },
    {
        id: 'c5',
        name: 'Phineas Burke',
        initials: 'PB',
        email: 'p.burke@burkeandco.io',
        phone: '(415) 555-0478',
        preferredContact: 'Email',
        preferences: 'Early mornings',
        homeLocation: 'Harbor Street',
        balance: 0,
        tier: 'Signature',
        memberSince: 'Aug 2021',
        visits: 24,
        upcomingCount: 1,
        missedVisits: 0,
        notes: 'Prefers 8am slots. Responds to email only.',
        customerId: 'C5-L1',
        lastVisit: '28 Jul 2026',
        nextAppointment: 'Today 8:30 am',
        photoUrl: undefined
    },
    {
        id: 'c6',
        name: 'Isla Trentham',
        initials: 'IT',
        email: 'isla.t@lightpathdesign.co',
        phone: '(415) 555-0562',
        preferredContact: 'SMS',
        preferences: 'Mid-morning',
        homeLocation: 'Harbor Street',
        balance: 0,
        tier: 'Standard',
        memberSince: 'Oct 2023',
        visits: 7,
        upcomingCount: 1,
        missedVisits: 0,
        notes: 'New member. Still exploring services.',
        customerId: 'C6-L1',
        lastVisit: '18 Jul 2026',
        nextAppointment: 'Today 10:30 am',
        photoUrl: undefined
    },
    {
        id: 'c7',
        name: 'Dermot Asante',
        initials: 'DA',
        email: 'd.asante@asantelaw.com',
        phone: '(415) 555-0693',
        preferredContact: 'Call',
        preferences: 'Flexible',
        homeLocation: 'Harbor Street',
        balance: 0,
        tier: 'Founding',
        memberSince: 'May 2018',
        visits: 88,
        upcomingCount: 1,
        missedVisits: 1,
        notes: 'Long-standing client. Flexible on timing. Prefers A. Okonjo.',
        customerId: 'C7-L1',
        lastVisit: '04 Aug 2026',
        nextAppointment: 'Today 1:00 pm',
        photoUrl: undefined
    },
    {
        id: 'c8',
        name: 'Saoirse Whitmore',
        initials: 'SW',
        email: 'saoirse.w@whitmore.ie',
        phone: '(415) 555-0714',
        preferredContact: 'Email',
        preferences: 'Quiet, no music',
        homeLocation: 'Harbor Street',
        balance: 0,
        tier: 'Signature',
        memberSince: 'Sep 2020',
        visits: 39,
        upcomingCount: 0,
        missedVisits: 0,
        notes: 'Prefers complete silence during sessions. No background music.',
        customerId: 'C8-L1',
        lastVisit: '25 Jul 2026',
        nextAppointment: undefined,
        photoUrl: undefined
    },
    {
        id: 'c9',
        name: 'Kofi Mensah',
        initials: 'KM',
        email: 'k.mensah@northlightstudio.co',
        phone: '(415) 555-0827',
        preferredContact: 'SMS',
        preferences: 'Weekday mornings',
        homeLocation: 'Harbor Street',
        balance: 20,
        tier: 'Standard',
        memberSince: 'Apr 2024',
        visits: 4,
        upcomingCount: 1,
        missedVisits: 0,
        notes: 'Recently joined. Booked first extended session for today.',
        customerId: 'C9-L1',
        lastVisit: '28 Jul 2026',
        nextAppointment: 'Today 4:00 pm',
        photoUrl: undefined
    },
    {
        id: 'c10',
        name: 'Niamh Calloway',
        initials: 'NC',
        email: 'niamhc@duskperfumery.com',
        phone: '(415) 555-0945',
        preferredContact: 'Email',
        preferences: 'Evenings',
        homeLocation: 'Harbor Street',
        balance: 0,
        tier: 'Signature',
        memberSince: 'Nov 2021',
        visits: 19,
        upcomingCount: 1,
        missedVisits: 0,
        notes: 'Prefers evening slots. Regular standard session client.',
        customerId: 'C10-L1',
        lastVisit: '30 Jul 2026',
        nextAppointment: 'Today 5:00 pm',
        photoUrl: undefined
    }
];
// Today's date for appointments (using a fixed date to match prototype)
const TODAY = '2026-08-06';
const mockSpaAppointments = [
    // 8:00 am - Cleo, Standard session, A. Okonjo
    {
        id: 'a1',
        customerId: 'c2',
        customerName: 'Cleo Fairbanks',
        customerInitials: 'CF',
        customerTier: 'Signature',
        customerPhone: '(415) 555-0187',
        staffId: 'st1',
        staffName: 'A. Okonjo',
        service: 'Standard session',
        duration: 60,
        room: 'Room 1',
        date: TODAY,
        startTime: '09:00',
        status: 'checked_in',
        checkInTime: '08:58'
    },
    // 8:30 am - Phineas, Consultation, J. Park
    {
        id: 'a2',
        customerId: 'c5',
        customerName: 'Phineas Burke',
        customerInitials: 'PB',
        customerTier: 'Signature',
        customerPhone: '(415) 555-0478',
        staffId: 'st4',
        staffName: 'J. Park',
        service: 'Consultation',
        duration: 30,
        room: 'Suite A',
        date: TODAY,
        startTime: '08:30',
        status: 'completed',
        checkInTime: '08:28',
        checkOutTime: '09:02'
    },
    // 10:30 am - Isla, Standard session, M. Reyes
    {
        id: 'a3',
        customerId: 'c6',
        customerName: 'Isla Trentham',
        customerInitials: 'IT',
        customerTier: 'Standard',
        customerPhone: '(415) 555-0562',
        staffId: 'st2',
        staffName: 'M. Reyes',
        service: 'Standard session',
        duration: 60,
        room: 'Room 3',
        date: TODAY,
        startTime: '10:30',
        status: 'scheduled'
    },
    // 12:00 pm - Adaeze, Standard session, A. Okonjo
    {
        id: 'a4',
        customerId: 'c1',
        customerName: 'Adaeze Nwosu',
        customerInitials: 'AN',
        customerTier: 'Founding',
        customerPhone: '(415) 555-0132',
        staffId: 'st1',
        staffName: 'A. Okonjo',
        service: 'Standard session',
        duration: 60,
        room: 'Room 1',
        date: TODAY,
        startTime: '12:00',
        status: 'scheduled'
    },
    // 1:00 pm - Dermot, Extended session, A. Okonjo
    {
        id: 'a5',
        customerId: 'c7',
        customerName: 'Dermot Asante',
        customerInitials: 'DA',
        customerTier: 'Founding',
        customerPhone: '(415) 555-0693',
        staffId: 'st1',
        staffName: 'A. Okonjo',
        service: 'Extended session',
        duration: 90,
        room: 'Room 2',
        date: TODAY,
        startTime: '13:00',
        status: 'scheduled'
    },
    // 2:00 pm - Marisol, Extended session, M. Reyes
    {
        id: 'a6',
        customerId: 'c4',
        customerName: 'Marisol Venegas',
        customerInitials: 'MV',
        customerTier: 'Founding',
        customerPhone: '(415) 555-0341',
        staffId: 'st2',
        staffName: 'M. Reyes',
        service: 'Extended session',
        duration: 90,
        room: 'Room 3',
        date: TODAY,
        startTime: '14:00',
        status: 'scheduled'
    },
    // 3:30 pm - Adaeze, Consultation, J. Park
    {
        id: 'a7',
        customerId: 'c1',
        customerName: 'Adaeze Nwosu',
        customerInitials: 'AN',
        customerTier: 'Founding',
        customerPhone: '(415) 555-0132',
        staffId: 'st4',
        staffName: 'J. Park',
        service: 'Consultation',
        duration: 30,
        room: 'Suite A',
        date: TODAY,
        startTime: '15:30',
        status: 'scheduled'
    },
    // 4:00 pm - Kofi, Extended session, T. Lindqvist
    {
        id: 'a8',
        customerId: 'c9',
        customerName: 'Kofi Mensah',
        customerInitials: 'KM',
        customerTier: 'Standard',
        customerPhone: '(415) 555-0827',
        staffId: 'st3',
        staffName: 'T. Lindqvist',
        service: 'Extended session',
        duration: 90,
        room: 'Room 4',
        date: TODAY,
        startTime: '16:00',
        status: 'scheduled'
    },
    // 5:00 pm - Niamh, Standard session, T. Lindqvist
    {
        id: 'a9',
        customerId: 'c10',
        customerName: 'Niamh Calloway',
        customerInitials: 'NC',
        customerTier: 'Signature',
        customerPhone: '(415) 555-0945',
        staffId: 'st3',
        staffName: 'T. Lindqvist',
        service: 'Standard session',
        duration: 60,
        room: 'Room 4',
        date: TODAY,
        startTime: '17:00',
        status: 'scheduled'
    },
    // No-show example - Tarquin had a slot that he missed
    {
        id: 'a10',
        customerId: 'c3',
        customerName: 'Tarquin Osei',
        customerInitials: 'TO',
        customerTier: 'Standard',
        customerPhone: '(415) 555-0209',
        staffId: 'st2',
        staffName: 'M. Reyes',
        service: 'Standard session',
        duration: 60,
        room: 'Room 3',
        date: TODAY,
        startTime: '08:00',
        status: 'no_show',
        noShowTime: '08:15'
    }
];
const mockVisitHistory = {
    c1: [
        {
            date: '28 Jul 2026',
            service: 'Standard session',
            staff: 'A. Okonjo',
            location: 'Harbor Street',
            outcome: 'Completed'
        },
        {
            date: '14 Jul 2026',
            service: 'Extended session',
            staff: 'A. Okonjo',
            location: 'Harbor Street',
            outcome: 'Completed'
        },
        {
            date: '30 Jun 2026',
            service: 'Standard session',
            staff: 'M. Reyes',
            location: 'Harbor Street',
            outcome: 'Completed'
        },
        {
            date: '16 Jun 2026',
            service: 'Consultation',
            staff: 'J. Park',
            location: 'Harbor Street',
            outcome: 'Completed'
        },
        {
            date: '02 Jun 2026',
            service: 'Standard session',
            staff: 'A. Okonjo',
            location: 'Harbor Street',
            outcome: 'Cancelled'
        },
        {
            date: '19 May 2026',
            service: 'Standard session',
            staff: 'T. Lindqvist',
            location: 'Harbor Street',
            outcome: 'Completed'
        }
    ],
    c2: [
        {
            date: '21 Jul 2026',
            service: 'Standard session',
            staff: 'A. Okonjo',
            location: 'Harbor Street',
            outcome: 'Completed'
        },
        {
            date: '07 Jul 2026',
            service: 'Consultation',
            staff: 'J. Park',
            location: 'Harbor Street',
            outcome: 'Completed'
        },
        {
            date: '23 Jun 2026',
            service: 'Standard session',
            staff: 'M. Reyes',
            location: 'Harbor Street',
            outcome: 'No-show'
        },
        {
            date: '09 Jun 2026',
            service: 'Standard session',
            staff: 'A. Okonjo',
            location: 'Harbor Street',
            outcome: 'Completed'
        }
    ],
    c4: [
        {
            date: '01 Aug 2026',
            service: 'Extended session',
            staff: 'M. Reyes',
            location: 'Harbor Street',
            outcome: 'Completed'
        },
        {
            date: '18 Jul 2026',
            service: 'Standard session',
            staff: 'M. Reyes',
            location: 'Harbor Street',
            outcome: 'Completed'
        },
        {
            date: '04 Jul 2026',
            service: 'Extended session',
            staff: 'M. Reyes',
            location: 'Harbor Street',
            outcome: 'Completed'
        }
    ],
    c7: [
        {
            date: '04 Aug 2026',
            service: 'Extended session',
            staff: 'A. Okonjo',
            location: 'Harbor Street',
            outcome: 'Completed'
        },
        {
            date: '21 Jul 2026',
            service: 'Standard session',
            staff: 'A. Okonjo',
            location: 'Harbor Street',
            outcome: 'Completed'
        },
        {
            date: '07 Jul 2026',
            service: 'Extended session',
            staff: 'A. Okonjo',
            location: 'Harbor Street',
            outcome: 'No-show'
        }
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/axios.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/constants/index.ts [app-client] (ecmascript) <locals>");
;
;
var _process_env_NEXT_PUBLIC_LAMBDA_API_KEY;
const api = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: ("TURBOPACK compile-time value", "https://x8nrv9hcrf.execute-api.ap-south-1.amazonaws.com/dev"),
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': (_process_env_NEXT_PUBLIC_LAMBDA_API_KEY = ("TURBOPACK compile-time value", "entryflow-secret-key-2026!@")) !== null && _process_env_NEXT_PUBLIC_LAMBDA_API_KEY !== void 0 ? _process_env_NEXT_PUBLIC_LAMBDA_API_KEY : ''
    }
});
// Request interceptor
api.interceptors.request.use((config)=>{
    if ("TURBOPACK compile-time truthy", 1) {
        const token = localStorage.getItem(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["STORAGE_KEYS"].AUTH_TOKEN);
        if (token && config.headers) {
            config.headers.Authorization = "Bearer ".concat(token);
        }
    }
    return config;
}, (error)=>{
    return Promise.reject(error);
});
// Response interceptor
api.interceptors.response.use((response)=>response, async (error)=>{
    var _error_response;
    if (((_error_response = error.response) === null || _error_response === void 0 ? void 0 : _error_response.status) === 401) {
        // Token expired or invalid
        if ("TURBOPACK compile-time truthy", 1) {
            localStorage.removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["STORAGE_KEYS"].AUTH_TOKEN);
            localStorage.removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["STORAGE_KEYS"].REFRESH_TOKEN);
            localStorage.removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["STORAGE_KEYS"].USER);
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
});
const __TURBOPACK__default__export__ = api;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/(dashboard)/dashboard/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-check.js [app-client] (ecmascript) <export default as UserCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hotel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Hotel$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/hotel.js [app-client] (ecmascript) <export default as Hotel>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$WelcomeHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/dashboard/WelcomeHeader.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$StatsCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/dashboard/StatsCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$ActivityFeed$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/dashboard/ActivityFeed.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$UpcomingEvents$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/dashboard/UpcomingEvents.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$VenueOccupancy$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/dashboard/VenueOccupancy.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$QuickActions$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/dashboard/QuickActions.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$charts$2f$LineChartComponent$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/charts/LineChartComponent.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$charts$2f$PieChartComponent$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/charts/PieChartComponent.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/constants/mock-data.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/axios.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
;
;
function DashboardPage() {
    _s();
    const [stats, setStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockDashboardStats"]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DashboardPage.useEffect": ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/reports/dashboard-stats').then({
                "DashboardPage.useEffect": (res)=>{
                    console.log('[Dashboard] dashboard-stats:', res.data);
                    setStats(res.data);
                }
            }["DashboardPage.useEffect"]).catch({
                "DashboardPage.useEffect": (err)=>{
                    console.error('[Dashboard] Failed to fetch stats, using mock data:', err);
                }
            }["DashboardPage.useEffect"]).finally({
                "DashboardPage.useEffect": ()=>setLoading(false)
            }["DashboardPage.useEffect"]);
        }
    }["DashboardPage.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$WelcomeHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WelcomeHeader"], {}, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/page.tsx",
                lineNumber: 42,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$StatsCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StatsCard"], {
                        title: "Today's Check-ins",
                        value: loading ? '…' : stats.todayCheckIns,
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCheck$3e$__["UserCheck"],
                        trend: {
                            value: 12,
                            isPositive: true
                        }
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/page.tsx",
                        lineNumber: 46,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$StatsCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StatsCard"], {
                        title: "Total Guests",
                        value: loading ? '…' : stats.totalGuests,
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
                        trend: {
                            value: 8,
                            isPositive: true
                        }
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/page.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$StatsCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StatsCard"], {
                        title: "Pending Guests",
                        value: loading ? '…' : stats.pendingGuests,
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"],
                        trend: {
                            value: -5,
                            isPositive: false
                        }
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/page.tsx",
                        lineNumber: 58,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$StatsCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StatsCard"], {
                        title: "Hospitality Bookings",
                        value: loading ? '…' : stats.hospitalityBookings,
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hotel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Hotel$3e$__["Hotel"],
                        trend: {
                            value: 15,
                            isPositive: true
                        }
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/page.tsx",
                        lineNumber: 64,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/dashboard/page.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$QuickActions$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QuickActions"], {}, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/page.tsx",
                lineNumber: 73,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-6 md:grid-cols-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$charts$2f$LineChartComponent$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LineChartComponent"], {
                        title: "Check-in Trends",
                        description: "Daily check-ins over the past week",
                        data: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockCheckInTrends"],
                        dataKey: "value",
                        xAxisKey: "name"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/page.tsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$charts$2f$PieChartComponent$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PieChartComponent"], {
                        title: "Guest Categories",
                        description: "Distribution of guest types",
                        data: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockGuestCategories"]
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/page.tsx",
                        lineNumber: 84,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/dashboard/page.tsx",
                lineNumber: 76,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-6 lg:grid-cols-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$ActivityFeed$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ActivityFeed"], {
                        activities: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockActivityFeed"]
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/page.tsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$UpcomingEvents$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UpcomingEvents"], {
                                events: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockEvents"]
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/page.tsx",
                                lineNumber: 95,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$VenueOccupancy$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VenueOccupancy"], {
                                venues: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockVenues"].slice(0, 4)
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/page.tsx",
                                lineNumber: 96,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/dashboard/page.tsx",
                        lineNumber: 94,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/dashboard/page.tsx",
                lineNumber: 92,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(dashboard)/dashboard/page.tsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
_s(DashboardPage, "6xzo63z0fQ7encfG32fQcTFyHMM=");
_c = DashboardPage;
var _c;
__turbopack_context__.k.register(_c, "DashboardPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_7b0a4c3c._.js.map