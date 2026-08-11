(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn,
    "debounce",
    ()=>debounce,
    "exportToCSV",
    ()=>exportToCSV,
    "formatCurrency",
    ()=>formatCurrency,
    "formatDate",
    ()=>formatDate,
    "formatNumber",
    ()=>formatNumber,
    "generateId",
    ()=>generateId,
    "generateQRCode",
    ()=>generateQRCode,
    "getAvatarUrl",
    ()=>getAvatarUrl,
    "getInitials",
    ()=>getInitials,
    "getRelativeTime",
    ()=>getRelativeTime,
    "getStatusColor",
    ()=>getStatusColor,
    "getStatusColorDark",
    ()=>getStatusColorDark,
    "isValidEmail",
    ()=>isValidEmail,
    "isValidPhone",
    ()=>isValidPhone,
    "sleep",
    ()=>sleep,
    "truncate",
    ()=>truncate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn() {
    for(var _len = arguments.length, inputs = new Array(_len), _key = 0; _key < _len; _key++){
        inputs[_key] = arguments[_key];
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
function formatDate(date) {
    let format = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'MMM dd, yyyy';
    const d = typeof date === 'string' ? new Date(date) : date;
    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
    ];
    const monthsFull = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];
    const month = months[d.getMonth()];
    const monthFull = monthsFull[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return format.replace('MMMM', monthFull).replace('MMM', month).replace('dd', day.toString().padStart(2, '0')).replace('yyyy', year.toString()).replace('HH', hours).replace('mm', minutes);
}
function formatCurrency(amount) {
    let currency = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'USD';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(amount);
}
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}
function getInitials(name) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}
function truncate(str) {
    let length = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 50;
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
}
function debounce(func, wait) {
    let timeout;
    return function() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        clearTimeout(timeout);
        timeout = setTimeout(()=>func(...args), wait);
    };
}
function getStatusColor(status) {
    const statusMap = {
        active: 'text-green-600 bg-green-50 border-green-200',
        inactive: 'text-gray-600 bg-gray-50 border-gray-200',
        pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        completed: 'text-blue-600 bg-blue-50 border-blue-200',
        cancelled: 'text-red-600 bg-red-50 border-red-200',
        confirmed: 'text-green-600 bg-green-50 border-green-200',
        checked_in: 'text-blue-600 bg-blue-50 border-blue-200',
        checked_out: 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return statusMap[status.toLowerCase()] || statusMap.inactive;
}
function getStatusColorDark(status) {
    const statusMap = {
        active: 'text-green-400 bg-green-950/30 border-green-800',
        inactive: 'text-gray-400 bg-gray-900/30 border-gray-700',
        pending: 'text-yellow-400 bg-yellow-950/30 border-yellow-800',
        completed: 'text-blue-400 bg-blue-950/30 border-blue-800',
        cancelled: 'text-red-400 bg-red-950/30 border-red-800',
        confirmed: 'text-green-400 bg-green-950/30 border-green-800',
        checked_in: 'text-blue-400 bg-blue-950/30 border-blue-800',
        checked_out: 'text-gray-400 bg-gray-900/30 border-gray-700'
    };
    return statusMap[status.toLowerCase()] || statusMap.inactive;
}
function generateQRCode(data) {
    // In production, use a proper QR code library
    return "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=".concat(encodeURIComponent(data));
}
function exportToCSV(data, filename) {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csv = [
        headers.join(','),
        ...data.map((row)=>headers.map((header)=>{
                const value = row[header];
                return typeof value === 'string' && value.includes(',') ? '"'.concat(value, '"') : value;
            }).join(','))
    ].join('\n');
    const blob = new Blob([
        csv
    ], {
        type: 'text/csv'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "".concat(filename, ".csv");
    a.click();
    window.URL.revokeObjectURL(url);
}
function getRelativeTime(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return "".concat(diffMin, "m ago");
    if (diffHour < 24) return "".concat(diffHour, "h ago");
    if (diffDay < 7) return "".concat(diffDay, "d ago");
    return formatDate(d);
}
function sleep(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms));
}
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
function isValidPhone(phone) {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}
function generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
function getAvatarUrl(name, email) {
    if (email) {
        // Gravatar fallback
        return "https://ui-avatars.com/api/?name=".concat(encodeURIComponent(name), "&background=2563EB&color=fff&size=200");
    }
    return "https://ui-avatars.com/api/?name=".concat(encodeURIComponent(name), "&background=2563EB&color=fff&size=200");
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] cursor-pointer", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground shadow-[var(--shadow-primary)] hover:bg-primary/90 hover:shadow-[0_6px_20px_-2px_rgb(37_99_235_/_0.45)]",
            destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
            outline: "border border-input bg-card shadow-sm hover:bg-accent hover:text-accent-foreground",
            secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline",
            success: "bg-success text-white shadow-sm hover:bg-success/90",
            warning: "bg-warning text-white shadow-sm hover:bg-warning/90"
        },
        size: {
            default: "h-10 px-4 py-2 rounded-md",
            sm: "h-8 rounded-md px-3 text-xs",
            lg: "h-12 rounded-md px-8 text-base",
            xl: "h-14 rounded-xl px-10 text-base",
            icon: "h-10 w-10 rounded-md",
            "icon-sm": "h-8 w-8 rounded-md"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
const Button = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = (param, ref)=>{
    let { className, variant, size, asChild = false, loading, children, disabled, ...props } = param;
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : "button";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ref: ref,
        disabled: disabled || loading,
        ...props,
        children: [
            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                className: "animate-spin -ml-0.5 size-4",
                xmlns: "http://www.w3.org/2000/svg",
                fill: "none",
                viewBox: "0 0 24 24",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        className: "opacity-25",
                        cx: "12",
                        cy: "12",
                        r: "10",
                        stroke: "currentColor",
                        strokeWidth: "4"
                    }, void 0, false, {
                        fileName: "[project]/components/ui/button.tsx",
                        lineNumber: 66,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        className: "opacity-75",
                        fill: "currentColor",
                        d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    }, void 0, false, {
                        fileName: "[project]/components/ui/button.tsx",
                        lineNumber: 71,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/button.tsx",
                lineNumber: 60,
                columnNumber: 11
            }, ("TURBOPACK compile-time value", void 0)),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/button.tsx",
        lineNumber: 53,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Button;
Button.displayName = "Button";
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Button$React.forwardRef");
__turbopack_context__.k.register(_c1, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/input.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Input",
    ()=>Input
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
const Input = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = (param, ref)=>{
    let { className, type, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: type,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground", "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium", "placeholder:text-muted-foreground", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", "disabled:cursor-not-allowed disabled:opacity-50", "transition-shadow duration-200", className),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/input.tsx",
        lineNumber: 9,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Input;
Input.displayName = "Input";
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Input$React.forwardRef");
__turbopack_context__.k.register(_c1, "Input");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/label.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Label",
    ()=>Label
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-label/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
;
const labelVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
const Label = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = (param, ref)=>{
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(labelVariants(), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/label.tsx",
        lineNumber: 15,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Label;
Label.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"].displayName;
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Label$React.forwardRef");
__turbopack_context__.k.register(_c1, "Label");
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
"[project]/constants/navigation.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FLAT_NAV",
    ()=>FLAT_NAV,
    "NAV_SECTIONS",
    ()=>NAV_SECTIONS
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-dashboard.js [app-client] (ecmascript) <export default as LayoutDashboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hotel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Hotel$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/hotel.js [app-client] (ecmascript) <export default as Hotel>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.js [app-client] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-days.js [app-client] (ecmascript) <export default as CalendarDays>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$cog$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCog$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-cog.js [app-client] (ecmascript) <export default as UserCog>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$no$2d$axes$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chart-no-axes-column.js [app-client] (ecmascript) <export default as BarChart2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bell.js [app-client] (ecmascript) <export default as Bell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
;
const NAV_SECTIONS = [
    {
        label: "Overview",
        items: [
            {
                label: "Dashboard",
                href: "/dashboard",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"]
            }
        ]
    },
    {
        label: "Operations",
        items: [
            {
                label: "Hospitality",
                href: "/hospitality",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hotel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Hotel$3e$__["Hotel"],
                roles: [
                    'admin',
                    'super_admin'
                ]
            },
            {
                label: "Customers",
                href: "/guests",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"]
            },
            {
                label: "Calendar",
                href: "/calendar",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__["CalendarDays"]
            },
            {
                label: "Check-ins",
                href: "/check-ins",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"]
            }
        ]
    },
    {
        label: "Venue & Events",
        items: [
            {
                label: "Venues",
                href: "/venues",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"],
                roles: [
                    'admin',
                    'super_admin'
                ]
            },
            {
                label: "Events",
                href: "/events",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"]
            },
            {
                label: "Staff",
                href: "/staff",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$cog$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCog$3e$__["UserCog"],
                roles: [
                    'admin',
                    'super_admin'
                ]
            }
        ]
    },
    {
        label: "Insights",
        items: [
            {
                label: "Reports",
                href: "/reports",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$no$2d$axes$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart2$3e$__["BarChart2"]
            },
            {
                label: "Analytics",
                href: "/analytics",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"],
                roles: [
                    'admin',
                    'super_admin'
                ]
            }
        ]
    },
    {
        label: "System",
        items: [
            {
                label: "Notifications",
                href: "/notifications",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"],
                badge: 5
            },
            {
                label: "Settings",
                href: "/settings",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"]
            }
        ]
    }
];
const FLAT_NAV = NAV_SECTIONS.flatMap(_c = (s)=>s.items);
_c1 = FLAT_NAV;
var _c, _c1;
__turbopack_context__.k.register(_c, "FLAT_NAV$NAV_SECTIONS.flatMap");
__turbopack_context__.k.register(_c1, "FLAT_NAV");
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
"[project]/constants/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

// Brand Colors
__turbopack_context__.s([
    "ANIMATION",
    ()=>ANIMATION,
    "API_ENDPOINTS",
    ()=>API_ENDPOINTS,
    "BRAND_COLORS",
    ()=>BRAND_COLORS,
    "CHART_COLORS",
    ()=>CHART_COLORS,
    "DATE_FORMATS",
    ()=>DATE_FORMATS,
    "PAGINATION",
    ()=>PAGINATION,
    "QUERY_KEYS",
    ()=>QUERY_KEYS,
    "STATUS_TYPES",
    ()=>STATUS_TYPES,
    "STORAGE_KEYS",
    ()=>STORAGE_KEYS,
    "TOAST_DURATION",
    ()=>TOAST_DURATION,
    "USER_ROLES",
    ()=>USER_ROLES
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$navigation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/constants/navigation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/constants/mock-data.ts [app-client] (ecmascript)");
const BRAND_COLORS = {
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    primaryLight: '#DBEAFE',
    secondary: '#0F172A',
    accent: '#06B6D4',
    success: '#22C55E',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6'
};
const STATUS_TYPES = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    CONFIRMED: 'confirmed',
    CHECKED_IN: 'checked_in',
    CHECKED_OUT: 'checked_out'
};
const USER_ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    MANAGER: 'manager',
    STAFF: 'staff',
    VIEWER: 'viewer'
};
const DATE_FORMATS = {
    DISPLAY: 'MMM dd, yyyy',
    DISPLAY_LONG: 'MMMM dd, yyyy',
    DISPLAY_TIME: 'MMM dd, yyyy HH:mm',
    API: 'yyyy-MM-dd',
    TIME: 'HH:mm'
};
const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [
        10,
        25,
        50,
        100
    ]
};
const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        VERIFY_OTP: '/auth/verify-otp',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password'
    },
    DASHBOARD: '/dashboard',
    HOSPITALITY: '/hospitality',
    GUESTS: '/guests',
    CHECKINS: '/checkins',
    REGISTRATIONS: '/registrations',
    VENUES: '/venues',
    EVENTS: '/events',
    STAFF: '/staff',
    REPORTS: '/reports',
    ANALYTICS: '/analytics',
    NOTIFICATIONS: '/notifications',
    SETTINGS: '/settings'
};
const QUERY_KEYS = {
    DASHBOARD: [
        'dashboard'
    ],
    HOSPITALITY: [
        'hospitality'
    ],
    GUESTS: [
        'guests'
    ],
    GUEST_DETAIL: (id)=>[
            'guests',
            id
        ],
    CHECKINS: [
        'checkins'
    ],
    REGISTRATIONS: [
        'registrations'
    ],
    VENUES: [
        'venues'
    ],
    EVENTS: [
        'events'
    ],
    STAFF: [
        'staff'
    ],
    REPORTS: [
        'reports'
    ],
    ANALYTICS: [
        'analytics'
    ],
    NOTIFICATIONS: [
        'notifications'
    ],
    SETTINGS: [
        'settings'
    ],
    USER: [
        'user'
    ]
};
const STORAGE_KEYS = {
    AUTH_TOKEN: 'entryflow_auth_token',
    REFRESH_TOKEN: 'entryflow_refresh_token',
    USER: 'entryflow_user',
    THEME: 'entryflow_theme',
    SIDEBAR_STATE: 'entryflow_sidebar_collapsed'
};
const CHART_COLORS = {
    PRIMARY: '#2563EB',
    SECONDARY: '#06B6D4',
    SUCCESS: '#22C55E',
    WARNING: '#F59E0B',
    DANGER: '#EF4444',
    INFO: '#3B82F6',
    PURPLE: '#A855F7',
    PINK: '#EC4899'
};
const TOAST_DURATION = 3000;
const ANIMATION = {
    FAST: 0.15,
    NORMAL: 0.25,
    SLOW: 0.35
};
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/store/auth-store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAuthStore",
    ()=>useAuthStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/constants/index.ts [app-client] (ecmascript) <locals>");
;
;
;
const useAuthStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set)=>({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
        setUser: (user)=>set({
                user,
                isAuthenticated: !!user
            }),
        setToken: (token)=>set({
                token
            }),
        login: (user, token)=>set({
                user,
                token,
                isAuthenticated: true,
                isLoading: false
            }),
        logout: ()=>{
            // Clear localStorage and cookies
            if ("TURBOPACK compile-time truthy", 1) {
                localStorage.removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["STORAGE_KEYS"].AUTH_TOKEN);
                localStorage.removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["STORAGE_KEYS"].REFRESH_TOKEN);
                // Clear auth cookie
                document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            }
            set({
                user: null,
                token: null,
                isAuthenticated: false
            });
        },
        setLoading: (loading)=>set({
                isLoading: loading
            })
    }), {
    name: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["STORAGE_KEYS"].USER,
    partialize: (state)=>({
            user: state.user,
            token: state.token,
            isAuthenticated: state.isAuthenticated
        }),
    // Set isLoading to false once persisted state is restored from localStorage
    onRehydrateStorage: ()=>(state)=>{
            state === null || state === void 0 ? void 0 : state.setLoading(false);
        }
}));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/store/ui-store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useUIStore",
    ()=>useUIStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/constants/index.ts [app-client] (ecmascript) <locals>");
;
;
;
const useUIStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set)=>({
        sidebarCollapsed: false,
        sidebarMobileOpen: false,
        commandPaletteOpen: false,
        toggleSidebar: ()=>set((state)=>({
                    sidebarCollapsed: !state.sidebarCollapsed
                })),
        setSidebarCollapsed: (collapsed)=>set({
                sidebarCollapsed: collapsed
            }),
        toggleMobileSidebar: ()=>set((state)=>({
                    sidebarMobileOpen: !state.sidebarMobileOpen
                })),
        closeMobileSidebar: ()=>set({
                sidebarMobileOpen: false
            }),
        openCommandPalette: ()=>set({
                commandPaletteOpen: true
            }),
        closeCommandPalette: ()=>set({
                commandPaletteOpen: false
            }),
        toggleCommandPalette: ()=>set((state)=>({
                    commandPaletteOpen: !state.commandPaletteOpen
                }))
    }), {
    name: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["STORAGE_KEYS"].SIDEBAR_STATE,
    partialize: (state)=>({
            sidebarCollapsed: state.sidebarCollapsed
        })
}));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/store/notification-store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useNotificationStore",
    ()=>useNotificationStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
;
const useNotificationStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set)=>({
        notifications: [],
        unreadCount: 0,
        setNotifications: (notifications)=>set({
                notifications,
                unreadCount: notifications.filter((n)=>!n.read).length
            }),
        addNotification: (notification)=>set((state)=>({
                    notifications: [
                        notification,
                        ...state.notifications
                    ],
                    unreadCount: notification.read ? state.unreadCount : state.unreadCount + 1
                })),
        markAsRead: (id)=>set((state)=>{
                const notifications = state.notifications.map((n)=>n.id === id ? {
                        ...n,
                        read: true
                    } : n);
                return {
                    notifications,
                    unreadCount: notifications.filter((n)=>!n.read).length
                };
            }),
        markAllAsRead: ()=>set((state)=>({
                    notifications: state.notifications.map((n)=>({
                            ...n,
                            read: true
                        })),
                    unreadCount: 0
                })),
        removeNotification: (id)=>set((state)=>{
                const notifications = state.notifications.filter((n)=>n.id !== id);
                return {
                    notifications,
                    unreadCount: notifications.filter((n)=>!n.read).length
                };
            }),
        clearAll: ()=>set({
                notifications: [],
                unreadCount: 0
            })
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/store/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$auth$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/auth-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$ui$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/ui-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notification$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/notification-store.ts [app-client] (ecmascript)");
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/constants/users.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HARDCODED_USERS",
    ()=>HARDCODED_USERS,
    "findUser",
    ()=>findUser
]);
const HARDCODED_USERS = [
    // ── Admins ──────────────────────────────────────────────────────────────────
    {
        id: 'admin-1',
        name: 'Sarah Mitchell',
        email: 'sarah@entryflow.com',
        password: 'admin123',
        role: 'admin'
    },
    {
        id: 'admin-2',
        name: 'James Cooper',
        email: 'james@entryflow.com',
        password: 'admin123',
        role: 'admin'
    },
    {
        id: 'admin-3',
        name: 'Priya Sharma',
        email: 'priya@entryflow.com',
        password: 'admin123',
        role: 'admin'
    },
    // ── Resellers ────────────────────────────────────────────────────────────────
    {
        id: 'reseller-1',
        name: 'Alex Fernandez',
        email: 'alex@reseller.com',
        password: 'reseller123',
        role: 'reseller'
    },
    {
        id: 'reseller-2',
        name: 'Nina Walsh',
        email: 'nina@reseller.com',
        password: 'reseller123',
        role: 'reseller'
    }
];
function findUser(email, password) {
    var _HARDCODED_USERS_find;
    return (_HARDCODED_USERS_find = HARDCODED_USERS.find((u)=>u.email.toLowerCase() === email.toLowerCase() && u.password === password)) !== null && _HARDCODED_USERS_find !== void 0 ? _HARDCODED_USERS_find : null;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/(auth)/login/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LoginPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-hook-form/dist/index.esm.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$hookform$2f$resolvers$2f$zod$2f$dist$2f$zod$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@hookform/resolvers/zod/dist/zod.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/types.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/label.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/store/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$auth$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/auth-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$users$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/constants/users.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
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
;
;
;
const loginSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["object"]({
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["string"]().email('Invalid email address'),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$types$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["string"]().min(6, 'Password must be at least 6 characters')
});
function LoginPage() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { login } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$auth$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthStore"])();
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const { register, handleSubmit, formState: { errors } } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useForm"])({
        resolver: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$hookform$2f$resolvers$2f$zod$2f$dist$2f$zod$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["zodResolver"])(loginSchema)
    });
    const onSubmit = async (data)=>{
        setIsLoading(true);
        try {
            await new Promise((resolve)=>setTimeout(resolve, 800));
            const matched = (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$users$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findUser"])(data.email, data.password);
            if (!matched) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error('Invalid email or password.');
                return;
            }
            const mockToken = "mock-jwt-".concat(matched.id);
            const user = {
                id: matched.id,
                name: matched.name,
                email: matched.email,
                role: matched.role,
                avatar: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            login(user, mockToken);
            localStorage.setItem('auth_token', mockToken);
            // Set cookie for middleware
            document.cookie = "auth_token=".concat(mockToken, "; path=/; max-age=").concat(7 * 24 * 60 * 60); // 7 days
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Login successful!');
            router.push('/dashboard');
            // Force page refresh to ensure middleware picks up the cookie
            setTimeout(()=>{
                window.location.href = '/dashboard';
            }, 100);
        } catch (error) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error('Login failed. Please try again.');
        } finally{
            setIsLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex min-h-screen items-center justify-center p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            initial: {
                opacity: 0,
                y: 20
            },
            animate: {
                opacity: 1,
                y: 0
            },
            transition: {
                duration: 0.4
            },
            className: "w-full max-w-md",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                        className: "text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-4 flex justify-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex h-12 w-12 items-center justify-center rounded-xl bg-primary",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-2xl font-bold text-white",
                                        children: "E"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(auth)/login/page.tsx",
                                        lineNumber: 93,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/(auth)/login/page.tsx",
                                    lineNumber: 92,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/(auth)/login/page.tsx",
                                lineNumber: 91,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                className: "text-2xl",
                                children: "Welcome back"
                            }, void 0, false, {
                                fileName: "[project]/app/(auth)/login/page.tsx",
                                lineNumber: 96,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardDescription"], {
                                children: "Sign in to your EntryFlow Admin account"
                            }, void 0, false, {
                                fileName: "[project]/app/(auth)/login/page.tsx",
                                lineNumber: 97,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(auth)/login/page.tsx",
                        lineNumber: 90,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                onSubmit: handleSubmit(onSubmit),
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                htmlFor: "email",
                                                children: "Email"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(auth)/login/page.tsx",
                                                lineNumber: 102,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                id: "email",
                                                type: "email",
                                                placeholder: "admin@entryflow.com",
                                                ...register('email'),
                                                disabled: isLoading
                                            }, void 0, false, {
                                                fileName: "[project]/app/(auth)/login/page.tsx",
                                                lineNumber: 103,
                                                columnNumber: 17
                                            }, this),
                                            errors.email && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-danger",
                                                children: errors.email.message
                                            }, void 0, false, {
                                                fileName: "[project]/app/(auth)/login/page.tsx",
                                                lineNumber: 111,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(auth)/login/page.tsx",
                                        lineNumber: 101,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                        htmlFor: "password",
                                                        children: "Password"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(auth)/login/page.tsx",
                                                        lineNumber: 117,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        href: "/forgot-password",
                                                        className: "text-sm text-primary hover:underline",
                                                        children: "Forgot password?"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(auth)/login/page.tsx",
                                                        lineNumber: 118,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/(auth)/login/page.tsx",
                                                lineNumber: 116,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                id: "password",
                                                type: "password",
                                                placeholder: "••••••••",
                                                ...register('password'),
                                                disabled: isLoading
                                            }, void 0, false, {
                                                fileName: "[project]/app/(auth)/login/page.tsx",
                                                lineNumber: 125,
                                                columnNumber: 17
                                            }, this),
                                            errors.password && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-danger",
                                                children: errors.password.message
                                            }, void 0, false, {
                                                fileName: "[project]/app/(auth)/login/page.tsx",
                                                lineNumber: 133,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(auth)/login/page.tsx",
                                        lineNumber: 115,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        type: "submit",
                                        className: "w-full",
                                        disabled: isLoading,
                                        children: [
                                            isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                className: "mr-2 h-4 w-4 animate-spin"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(auth)/login/page.tsx",
                                                lineNumber: 138,
                                                columnNumber: 31
                                            }, this),
                                            "Sign in"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(auth)/login/page.tsx",
                                        lineNumber: 137,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(auth)/login/page.tsx",
                                lineNumber: 100,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-5 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground space-y-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-semibold text-foreground mb-1",
                                        children: "Test credentials"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(auth)/login/page.tsx",
                                        lineNumber: 144,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-medium text-foreground",
                                                children: "Admins"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(auth)/login/page.tsx",
                                                lineNumber: 145,
                                                columnNumber: 18
                                            }, this),
                                            " — sarah / james / priya @entryflow.com · ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                children: "admin123"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(auth)/login/page.tsx",
                                                lineNumber: 145,
                                                columnNumber: 119
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(auth)/login/page.tsx",
                                        lineNumber: 145,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-medium text-foreground",
                                                children: "Resellers"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(auth)/login/page.tsx",
                                                lineNumber: 146,
                                                columnNumber: 18
                                            }, this),
                                            " — alex / nina @reseller.com · ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                children: "reseller123"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(auth)/login/page.tsx",
                                                lineNumber: 146,
                                                columnNumber: 111
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(auth)/login/page.tsx",
                                        lineNumber: 146,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(auth)/login/page.tsx",
                                lineNumber: 143,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(auth)/login/page.tsx",
                        lineNumber: 99,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(auth)/login/page.tsx",
                lineNumber: 89,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/(auth)/login/page.tsx",
            lineNumber: 83,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/(auth)/login/page.tsx",
        lineNumber: 82,
        columnNumber: 5
    }, this);
}
_s(LoginPage, "N0PhJ4Eq8+99QG/oqFH+oicNs4c=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$auth$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useForm"]
    ];
});
_c = LoginPage;
var _c;
__turbopack_context__.k.register(_c, "LoginPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_01f4d341._.js.map