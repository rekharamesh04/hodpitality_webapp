module.exports = [
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/http2 [external] (http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http2", () => require("http2"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[project]/lib/axios.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/constants/index.ts [app-ssr] (ecmascript) <locals>");
;
;
const api = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: ("TURBOPACK compile-time value", "https://x8nrv9hcrf.execute-api.ap-south-1.amazonaws.com/dev"),
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': ("TURBOPACK compile-time value", "entryflow-secret-key-2026!@") ?? ''
    }
});
// Request interceptor
api.interceptors.request.use((config)=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return config;
}, (error)=>{
    return Promise.reject(error);
});
// Response interceptor
api.interceptors.response.use((response)=>response, async (error)=>{
    if (error.response?.status === 401) {
        // Token expired or invalid
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }
    return Promise.reject(error);
});
const __TURBOPACK__default__export__ = api;
}),
"[project]/app/(dashboard)/apiresponse/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ApiResponsePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/axios.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.js [app-ssr] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.js [app-ssr] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-ssr] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-ssr] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-ssr] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-ssr] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-ssr] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/activity.js [app-ssr] (ecmascript) <export default as Activity>");
'use client';
;
;
;
;
// ─── Endpoint Registry ───────────────────────────────────────────────────────
const ENDPOINT_GROUPS = [
    {
        title: '1. Authentication & Profile',
        color: 'blue',
        endpoints: [
            {
                id: 'auth-me',
                method: 'GET',
                path: '/auth/me'
            },
            {
                id: 'auth-login',
                method: 'POST',
                path: '/auth/login',
                body: {
                    email: 'admin@entryflow.com',
                    password: 'admin123'
                }
            },
            {
                id: 'settings-profile-get',
                method: 'GET',
                path: '/settings/profile'
            },
            {
                id: 'auth-forgot',
                method: 'POST',
                path: '/auth/forgot-password',
                body: {
                    email: 'admin@entryflow.com'
                }
            },
            {
                id: 'auth-verify',
                method: 'POST',
                path: '/auth/verify-otp',
                body: {
                    email: 'admin@entryflow.com',
                    otp: '123456'
                }
            },
            {
                id: 'auth-logout',
                method: 'POST',
                path: '/auth/logout',
                skipInBulk: true
            }
        ]
    },
    {
        title: '2. Settings',
        color: 'gray',
        endpoints: [
            {
                id: 'settings-profile-put',
                method: 'PUT',
                path: '/settings/profile',
                body: {
                    name: 'Admin User'
                }
            },
            {
                id: 'settings-org',
                method: 'PUT',
                path: '/settings/organisation',
                body: {
                    name: 'EntryFlow Corp'
                }
            },
            {
                id: 'settings-notif',
                method: 'PUT',
                path: '/settings/notifications',
                body: {
                    email: true,
                    push: true,
                    sms: false
                }
            },
            {
                id: 'settings-pass',
                method: 'PUT',
                path: '/settings/password',
                body: {
                    currentPassword: 'admin123',
                    newPassword: 'admin123'
                },
                skipInBulk: true
            }
        ]
    },
    {
        title: '3. Multi-Tenant (Resellers)',
        color: 'purple',
        endpoints: [
            {
                id: 'resellers-list',
                method: 'GET',
                path: '/resellers?limit=10'
            },
            {
                id: 'resellers-create',
                method: 'POST',
                path: '/resellers',
                body: {
                    name: 'Test Reseller',
                    email: 'reseller@test.com'
                }
            },
            {
                id: 'resellers-get',
                method: 'GET',
                path: '/resellers/1'
            },
            {
                id: 'resellers-update',
                method: 'PUT',
                path: '/resellers/1',
                body: {
                    name: 'Updated Reseller'
                }
            },
            {
                id: 'resellers-delete',
                method: 'DELETE',
                path: '/resellers/1',
                skipInBulk: true
            }
        ]
    },
    {
        title: '4. Multi-Tenant (Companies)',
        color: 'indigo',
        endpoints: [
            {
                id: 'companies-list',
                method: 'GET',
                path: '/companies?limit=10'
            },
            {
                id: 'companies-create',
                method: 'POST',
                path: '/companies',
                body: {
                    name: 'Test Company',
                    email: 'company@test.com'
                }
            },
            {
                id: 'companies-get',
                method: 'GET',
                path: '/companies/1'
            },
            {
                id: 'companies-update',
                method: 'PUT',
                path: '/companies/1',
                body: {
                    name: 'Updated Company'
                }
            },
            {
                id: 'companies-delete',
                method: 'DELETE',
                path: '/companies/1',
                skipInBulk: true
            }
        ]
    },
    {
        title: '5. Guests (CRM)',
        color: 'green',
        endpoints: [
            {
                id: 'guests-list',
                method: 'GET',
                path: '/guests?limit=10'
            },
            {
                id: 'guests-create',
                method: 'POST',
                path: '/guests',
                body: {
                    name: 'Test Guest',
                    email: 'test@guest.com',
                    phone: '+1234567890'
                }
            },
            {
                id: 'guests-get',
                method: 'GET',
                path: '/guests/1'
            },
            {
                id: 'guests-update',
                method: 'PUT',
                path: '/guests/1',
                body: {
                    name: 'Updated Guest'
                }
            },
            {
                id: 'guests-export',
                method: 'GET',
                path: '/guests/export'
            },
            {
                id: 'guests-delete',
                method: 'DELETE',
                path: '/guests/1',
                skipInBulk: true
            },
            {
                id: 'guests-bulk-delete',
                method: 'DELETE',
                path: '/guests/bulk',
                body: {
                    ids: []
                },
                skipInBulk: true
            }
        ]
    },
    {
        title: '6. Check-Ins',
        color: 'cyan',
        endpoints: [
            {
                id: 'checkins-list',
                method: 'GET',
                path: '/check-ins?limit=10'
            },
            {
                id: 'checkins-stats',
                method: 'GET',
                path: '/check-ins/stats'
            },
            {
                id: 'checkins-create',
                method: 'POST',
                path: '/check-ins',
                body: {
                    guestId: '1',
                    method: 'manual'
                }
            },
            {
                id: 'checkins-quick',
                method: 'POST',
                path: '/check-ins/quick',
                body: {
                    guestId: '1'
                }
            },
            {
                id: 'checkins-qr',
                method: 'POST',
                path: '/check-ins/qr',
                body: {
                    qrCode: 'QRDEMO123'
                }
            },
            {
                id: 'checkins-facial',
                method: 'POST',
                path: '/check-ins/facial-recognition',
                body: {
                    imageData: 'base64encodeddata'
                }
            },
            {
                id: 'checkins-badge',
                method: 'POST',
                path: '/check-ins/1/badge'
            }
        ]
    },
    {
        title: '7. Events',
        color: 'yellow',
        endpoints: [
            {
                id: 'events-list',
                method: 'GET',
                path: '/events?limit=10'
            },
            {
                id: 'events-upcoming',
                method: 'GET',
                path: '/events/upcoming'
            },
            {
                id: 'events-create',
                method: 'POST',
                path: '/events',
                body: {
                    title: 'Test Event',
                    startDate: new Date().toISOString()
                }
            },
            {
                id: 'events-get',
                method: 'GET',
                path: '/events/1'
            },
            {
                id: 'events-attendees',
                method: 'GET',
                path: '/events/1/attendees'
            },
            {
                id: 'events-update',
                method: 'PUT',
                path: '/events/1',
                body: {
                    title: 'Updated Event'
                }
            },
            {
                id: 'events-delete',
                method: 'DELETE',
                path: '/events/1',
                skipInBulk: true
            }
        ]
    },
    {
        title: '8. Venues',
        color: 'orange',
        endpoints: [
            {
                id: 'venues-list',
                method: 'GET',
                path: '/venues?limit=10'
            },
            {
                id: 'venues-create',
                method: 'POST',
                path: '/venues',
                body: {
                    name: 'Test Hall',
                    capacity: 100
                }
            },
            {
                id: 'venues-get',
                method: 'GET',
                path: '/venues/1'
            },
            {
                id: 'venues-update',
                method: 'PUT',
                path: '/venues/1',
                body: {
                    name: 'Updated Hall'
                }
            },
            {
                id: 'venues-occupancy',
                method: 'PUT',
                path: '/venues/1/occupancy',
                body: {
                    currentOccupancy: 42
                }
            },
            {
                id: 'venues-delete',
                method: 'DELETE',
                path: '/venues/1',
                skipInBulk: true
            }
        ]
    },
    {
        title: '9. Staff & Appointments',
        color: 'pink',
        endpoints: [
            {
                id: 'staff-list',
                method: 'GET',
                path: '/staff?limit=10'
            },
            {
                id: 'staff-create',
                method: 'POST',
                path: '/staff',
                body: {
                    name: 'Test Staff',
                    email: 'staff@test.com'
                }
            },
            {
                id: 'staff-get',
                method: 'GET',
                path: '/staff/1'
            },
            {
                id: 'staff-update',
                method: 'PUT',
                path: '/staff/1',
                body: {
                    name: 'Updated Staff'
                }
            },
            {
                id: 'staff-schedule',
                method: 'PUT',
                path: '/staff/1/schedule',
                body: {
                    mon: '09:00-17:00'
                }
            },
            {
                id: 'staff-delete',
                method: 'DELETE',
                path: '/staff/1',
                skipInBulk: true
            },
            {
                id: 'appts-list',
                method: 'GET',
                path: '/appointments?limit=10'
            },
            {
                id: 'appts-create',
                method: 'POST',
                path: '/appointments',
                body: {
                    guestId: '1',
                    staffId: '1',
                    title: 'Consultation'
                }
            },
            {
                id: 'appts-status',
                method: 'PUT',
                path: '/appointments/1/status',
                body: {
                    status: 'completed'
                }
            }
        ]
    },
    {
        title: '10. Calendar',
        color: 'teal',
        endpoints: [
            {
                id: 'calendar-events',
                method: 'GET',
                path: '/calendar/events'
            },
            {
                id: 'calendar-grid',
                method: 'GET',
                path: '/calendar'
            }
        ]
    },
    {
        title: '11. Reports & Analytics',
        color: 'violet',
        endpoints: [
            {
                id: 'reports-stats',
                method: 'GET',
                path: '/reports/dashboard-stats'
            },
            {
                id: 'reports-daily',
                method: 'GET',
                path: '/reports/daily?days=7'
            },
            {
                id: 'reports-guest-arrivals',
                method: 'GET',
                path: '/reports/guest-arrivals'
            },
            {
                id: 'reports-monthly-events',
                method: 'GET',
                path: '/reports/monthly-events'
            },
            {
                id: 'reports-revenue',
                method: 'GET',
                path: '/reports/revenue-trend'
            },
            {
                id: 'reports-export',
                method: 'POST',
                path: '/reports/export',
                body: {
                    type: 'daily',
                    format: 'pdf'
                }
            },
            {
                id: 'dashboard-activity',
                method: 'GET',
                path: '/dashboard/activity'
            },
            {
                id: 'dashboard-charts',
                method: 'GET',
                path: '/dashboard/charts/checkins'
            }
        ]
    },
    {
        title: '12. Notifications',
        color: 'red',
        endpoints: [
            {
                id: 'notif-list',
                method: 'GET',
                path: '/notifications?limit=10'
            },
            {
                id: 'notif-read',
                method: 'PUT',
                path: '/notifications/1/read'
            },
            {
                id: 'notif-read-all',
                method: 'PUT',
                path: '/notifications/read-all'
            },
            {
                id: 'notif-delete-all',
                method: 'DELETE',
                path: '/notifications/all',
                skipInBulk: true
            }
        ]
    },
    {
        title: '13. Uploads',
        color: 'slate',
        endpoints: [
            {
                id: 'upload-presign',
                method: 'POST',
                path: '/uploads/presigned-url',
                body: {
                    fileName: 'test.jpg',
                    contentType: 'image/jpeg'
                }
            }
        ]
    }
];
// ─── Helpers ─────────────────────────────────────────────────────────────────
const COLOR_MAP = {
    blue: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
    gray: 'bg-gray-50 border-gray-200 dark:bg-gray-900/30 dark:border-gray-700',
    purple: 'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800',
    indigo: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800',
    green: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800',
    cyan: 'bg-cyan-50 border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-800',
    yellow: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800',
    orange: 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800',
    pink: 'bg-pink-50 border-pink-200 dark:bg-pink-950/30 dark:border-pink-800',
    teal: 'bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:border-teal-800',
    violet: 'bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-800',
    red: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',
    slate: 'bg-slate-50 border-slate-200 dark:bg-slate-900/30 dark:border-slate-700'
};
const BADGE_MAP = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    pink: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
    teal: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
};
const METHOD_COLOR = {
    GET: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    POST: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    PUT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
};
function truncateJson(obj, maxLen = 120) {
    try {
        const s = JSON.stringify(obj);
        return s.length > maxLen ? s.slice(0, maxLen) + '…' : s;
    } catch  {
        return String(obj);
    }
}
async function runEndpoint(ep) {
    const t0 = performance.now();
    try {
        let resp;
        switch(ep.method){
            case 'GET':
                resp = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].get(ep.path);
                break;
            case 'POST':
                resp = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].post(ep.path, ep.body ?? {});
                break;
            case 'PUT':
                resp = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].put(ep.path, ep.body ?? {});
                break;
            case 'DELETE':
                resp = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].delete(ep.path, ep.body ? {
                    data: ep.body
                } : undefined);
                break;
        }
        return {
            status: 'success',
            httpCode: resp.status,
            ms: Math.round(performance.now() - t0),
            preview: truncateJson(resp.data)
        };
    } catch (err) {
        const httpCode = err?.response?.status;
        const preview = err?.response?.data ? truncateJson(err.response.data) : err?.message;
        return {
            status: 'error',
            httpCode,
            ms: Math.round(performance.now() - t0),
            error: preview ?? 'Network error'
        };
    }
}
// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusChip({ result }) {
    if (!result || result.status === 'idle') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-xs text-muted-foreground font-medium",
            children: "Idle"
        }, void 0, false, {
            fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
            lineNumber: 315,
            columnNumber: 12
        }, this);
    }
    if (result.status === 'loading') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                    className: "w-3.5 h-3.5 animate-spin"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                    lineNumber: 320,
                    columnNumber: 9
                }, this),
                " Testing…"
            ]
        }, void 0, true, {
            fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
            lineNumber: 319,
            columnNumber: 7
        }, this);
    }
    if (result.status === 'skipped') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-xs text-muted-foreground font-medium italic",
            children: "Skipped"
        }, void 0, false, {
            fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
            lineNumber: 325,
            columnNumber: 12
        }, this);
    }
    if (result.status === 'success') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                    className: "w-3.5 h-3.5"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                    lineNumber: 330,
                    columnNumber: 9
                }, this),
                result.httpCode ?? '2xx',
                " · ",
                result.ms,
                "ms"
            ]
        }, void 0, true, {
            fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
            lineNumber: 329,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "flex items-center gap-1 text-xs text-red-500 font-semibold",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                className: "w-3.5 h-3.5"
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                lineNumber: 337,
                columnNumber: 7
            }, this),
            result.httpCode ?? 'ERR',
            " · ",
            result.ms,
            "ms"
        ]
    }, void 0, true, {
        fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
        lineNumber: 336,
        columnNumber: 5
    }, this);
}
function ResponsePreview({ result }) {
    if (!result || result.status === 'idle' || result.status === 'loading' || result.status === 'skipped') return null;
    const text = result.status === 'success' ? result.preview : result.error;
    const color = result.status === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
        colSpan: 5,
        className: "px-4 pb-3 pt-0",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
            className: `text-[11px] rounded-md px-3 py-2 font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed ${color}`,
            children: text
        }, void 0, false, {
            fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
            lineNumber: 351,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
        lineNumber: 350,
        columnNumber: 5
    }, this);
}
function ApiResponsePage() {
    const allIds = ENDPOINT_GROUPS.flatMap((g)=>g.endpoints.map((e)=>e.id));
    const [results, setResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>Object.fromEntries(allIds.map((id)=>[
                id,
                {
                    status: 'idle'
                }
            ])));
    const [expanded, setExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>Object.fromEntries(ENDPOINT_GROUPS.map((g)=>[
                g.title,
                true
            ])));
    const [runningAll, setRunningAll] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const abortRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const setResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id, r)=>{
        setResults((prev)=>({
                ...prev,
                [id]: r
            }));
    }, []);
    const testOne = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (ep)=>{
        setResult(ep.id, {
            status: 'loading'
        });
        const r = await runEndpoint(ep);
        setResult(ep.id, r);
    }, [
        setResult
    ]);
    const testAll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        abortRef.current = false;
        setRunningAll(true);
        // Reset all
        setResults(Object.fromEntries(allIds.map((id)=>[
                id,
                {
                    status: 'idle'
                }
            ])));
        for (const group of ENDPOINT_GROUPS){
            for (const ep of group.endpoints){
                if (abortRef.current) break;
                if (ep.skipInBulk) {
                    setResult(ep.id, {
                        status: 'skipped'
                    });
                    continue;
                }
                setResult(ep.id, {
                    status: 'loading'
                });
                const r = await runEndpoint(ep);
                setResult(ep.id, r);
                // small gap between calls to avoid rate-limiting
                await new Promise((res)=>setTimeout(res, 120));
            }
        }
        setRunningAll(false);
    }, [
        allIds,
        setResult
    ]);
    const stop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        abortRef.current = true;
        setRunningAll(false);
    }, []);
    const reset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setResults(Object.fromEntries(allIds.map((id)=>[
                id,
                {
                    status: 'idle'
                }
            ])));
    }, [
        allIds
    ]);
    // Summary counters
    const total = allIds.length;
    const success = Object.values(results).filter((r)=>r.status === 'success').length;
    const failed = Object.values(results).filter((r)=>r.status === 'error').length;
    const skipped = Object.values(results).filter((r)=>r.status === 'skipped').length;
    const tested = success + failed + skipped;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-background",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur-sm shadow-sm",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-7xl mx-auto px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-2 rounded-lg bg-primary/10",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                        className: "w-5 h-5 text-primary"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                        lineNumber: 425,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                    lineNumber: 424,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            className: "text-lg font-bold text-foreground",
                                            children: "API Health Monitor"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                            lineNumber: 428,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-muted-foreground",
                                            children: ("TURBOPACK compile-time value", "https://x8nrv9hcrf.execute-api.ap-south-1.amazonaws.com/dev") ?? 'base URL not set'
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                            lineNumber: 429,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                    lineNumber: 427,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                            lineNumber: 423,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 flex-wrap",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium",
                                    children: [
                                        total,
                                        " endpoints"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                    lineNumber: 437,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold",
                                    children: [
                                        "✓ ",
                                        success
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                    lineNumber: 440,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 font-semibold",
                                    children: [
                                        "✗ ",
                                        failed
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                    lineNumber: 443,
                                    columnNumber: 13
                                }, this),
                                skipped > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium",
                                    children: [
                                        "— ",
                                        skipped,
                                        " skipped"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                    lineNumber: 447,
                                    columnNumber: 15
                                }, this),
                                tested > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-28 h-2 rounded-full bg-muted overflow-hidden",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-full rounded-full bg-emerald-500 transition-all duration-300",
                                        style: {
                                            width: `${success / Math.max(tested - skipped, 1) * 100}%`
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                        lineNumber: 455,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                    lineNumber: 454,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                            lineNumber: 436,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: reset,
                                    disabled: runningAll,
                                    className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-border bg-background hover:bg-muted transition-colors disabled:opacity-40",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                            className: "w-3.5 h-3.5"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                            lineNumber: 470,
                                            columnNumber: 15
                                        }, this),
                                        " Reset"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                    lineNumber: 465,
                                    columnNumber: 13
                                }, this),
                                runningAll ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: stop,
                                    className: "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                            className: "w-3.5 h-3.5"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                            lineNumber: 477,
                                            columnNumber: 17
                                        }, this),
                                        " Stop"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                    lineNumber: 473,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: testAll,
                                    className: "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-colors",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                            className: "w-3.5 h-3.5"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                            lineNumber: 484,
                                            columnNumber: 17
                                        }, this),
                                        " Test All"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                    lineNumber: 480,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                            lineNumber: 464,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                    lineNumber: 422,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                lineNumber: 421,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-7xl mx-auto px-6 py-8 space-y-6",
                children: [
                    ENDPOINT_GROUPS.map((group)=>{
                        const isOpen = expanded[group.title] ?? true;
                        const groupIds = group.endpoints.map((e)=>e.id);
                        const gSuccess = groupIds.filter((id)=>results[id]?.status === 'success').length;
                        const gError = groupIds.filter((id)=>results[id]?.status === 'error').length;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `rounded-xl border shadow-sm overflow-hidden ${COLOR_MAP[group.color]}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setExpanded((p)=>({
                                                ...p,
                                                [group.title]: !isOpen
                                            })),
                                    className: "w-full flex items-center justify-between px-5 py-3.5 hover:brightness-95 transition-all",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-3",
                                            children: [
                                                isOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                    className: "w-4 h-4 text-muted-foreground"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                    lineNumber: 511,
                                                    columnNumber: 23
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                    className: "w-4 h-4 text-muted-foreground"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                    lineNumber: 512,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-semibold text-sm text-foreground",
                                                    children: group.title
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                    lineNumber: 514,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `text-[11px] font-semibold px-2 py-0.5 rounded-full ${BADGE_MAP[group.color]}`,
                                                    children: [
                                                        group.endpoints.length,
                                                        " endpoints"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                    lineNumber: 515,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                            lineNumber: 509,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                gSuccess > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs font-semibold text-emerald-600 dark:text-emerald-400",
                                                    children: [
                                                        "✓ ",
                                                        gSuccess
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                    lineNumber: 521,
                                                    columnNumber: 21
                                                }, this),
                                                gError > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs font-semibold text-red-500",
                                                    children: [
                                                        "✗ ",
                                                        gError
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                    lineNumber: 524,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                            lineNumber: 519,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                    lineNumber: 505,
                                    columnNumber: 15
                                }, this),
                                isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "overflow-x-auto border-t border-inherit",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                        className: "w-full text-sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    className: "bg-black/5 dark:bg-white/5 text-xs text-muted-foreground uppercase tracking-wide",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "text-left px-4 py-2.5 font-semibold w-16",
                                                            children: "Method"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                            lineNumber: 535,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "text-left px-4 py-2.5 font-semibold",
                                                            children: "Endpoint"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                            lineNumber: 536,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "text-left px-4 py-2.5 font-semibold w-44",
                                                            children: "Status"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                            lineNumber: 537,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "text-left px-4 py-2.5 font-semibold w-16",
                                                            children: "Skip"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                            lineNumber: 538,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "text-right px-4 py-2.5 font-semibold w-20",
                                                            children: "Action"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                            lineNumber: 539,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                    lineNumber: 534,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                lineNumber: 533,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                className: "divide-y divide-black/5 dark:divide-white/5",
                                                children: group.endpoints.map((ep)=>{
                                                    const res = results[ep.id];
                                                    const isLoading = res?.status === 'loading';
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                className: `group transition-colors ${res?.status === 'success' ? 'bg-emerald-50/60 dark:bg-emerald-950/20' : res?.status === 'error' ? 'bg-red-50/60 dark:bg-red-950/20' : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'}`,
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "px-4 py-3",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: `text-[11px] font-bold px-2 py-0.5 rounded font-mono ${METHOD_COLOR[ep.method]}`,
                                                                            children: ep.method
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                                            lineNumber: 559,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                                        lineNumber: 558,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "px-4 py-3",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex flex-col",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "font-mono text-xs text-foreground font-medium",
                                                                                    children: ep.path
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                                                    lineNumber: 565,
                                                                                    columnNumber: 35
                                                                                }, this),
                                                                                ep.note && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-[10px] text-muted-foreground mt-0.5",
                                                                                    children: ep.note
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                                                    lineNumber: 566,
                                                                                    columnNumber: 47
                                                                                }, this),
                                                                                ep.body && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-[10px] text-muted-foreground mt-0.5 font-mono opacity-60",
                                                                                    children: [
                                                                                        "body: ",
                                                                                        truncateJson(ep.body, 60)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                                                    lineNumber: 568,
                                                                                    columnNumber: 37
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                                            lineNumber: 564,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                                        lineNumber: 563,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "px-4 py-3",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusChip, {
                                                                            result: res
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                                            lineNumber: 575,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                                        lineNumber: 574,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "px-4 py-3",
                                                                        children: ep.skipInBulk && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded",
                                                                            children: "bulk skip"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                                            lineNumber: 579,
                                                                            columnNumber: 35
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                                        lineNumber: 577,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "px-4 py-3 text-right",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            onClick: ()=>testOne(ep),
                                                                            disabled: isLoading || runningAll,
                                                                            className: "inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md border border-border bg-background hover:bg-muted disabled:opacity-40 transition-colors",
                                                                            children: [
                                                                                isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                                                    className: "w-3 h-3 animate-spin"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                                                    lineNumber: 591,
                                                                                    columnNumber: 39
                                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                                                                    className: "w-3 h-3"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                                                    lineNumber: 592,
                                                                                    columnNumber: 39
                                                                                }, this),
                                                                                "Test"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                                            lineNumber: 585,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                                        lineNumber: 584,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                                lineNumber: 549,
                                                                columnNumber: 29
                                                            }, this),
                                                            (res?.status === 'success' || res?.status === 'error') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                className: res.status === 'success' ? 'bg-emerald-50/60 dark:bg-emerald-950/20' : 'bg-red-50/60 dark:bg-red-950/20',
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ResponsePreview, {
                                                                    result: res
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                                    lineNumber: 605,
                                                                    columnNumber: 33
                                                                }, this)
                                                            }, `${ep.id}-preview`, false, {
                                                                fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                                lineNumber: 600,
                                                                columnNumber: 31
                                                            }, this)
                                                        ]
                                                    }, ep.id, true, {
                                                        fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                        lineNumber: 548,
                                                        columnNumber: 27
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                                lineNumber: 542,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                        lineNumber: 532,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                    lineNumber: 531,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, group.title, true, {
                            fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                            lineNumber: 500,
                            columnNumber: 13
                        }, this);
                    }),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-center text-xs text-muted-foreground pb-8",
                        children: [
                            "Destructive endpoints (DELETE, password change, logout) are marked ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-semibold",
                                children: "bulk skip"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                                lineNumber: 621,
                                columnNumber: 78
                            }, this),
                            ' and won\'t run during "Test All". Use individual Test buttons to run them manually.'
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                        lineNumber: 620,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
                lineNumber: 492,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(dashboard)/apiresponse/page.tsx",
        lineNumber: 419,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0c786012._.js.map