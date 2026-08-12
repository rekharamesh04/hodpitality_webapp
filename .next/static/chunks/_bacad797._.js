(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
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
"[project]/services/guest.service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "guestService",
    ()=>guestService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/axios.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/constants/index.ts [app-client] (ecmascript) <locals>");
;
;
function buildParams(filters) {
    const p = new URLSearchParams();
    if (filters.limit) p.set('limit', String(filters.limit));
    if (filters.cursor) p.set('cursor', filters.cursor);
    if (filters.search) p.set('search', filters.search);
    if (filters.status) p.set('status', filters.status);
    return p;
}
const guestService = {
    async getGuests () {
        let filters = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        const params = buildParams({
            limit: 50,
            ...filters
        });
        const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["API_ENDPOINTS"].GUESTS, "?").concat(params));
        return data;
    },
    async getGuest (id) {
        const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["API_ENDPOINTS"].GUESTS, "/").concat(id));
        return data;
    },
    async createGuest (input) {
        const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["API_ENDPOINTS"].GUESTS, input);
        return data;
    },
    async updateGuest (id, input) {
        const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].put("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["API_ENDPOINTS"].GUESTS, "/").concat(id), input);
        return data;
    },
    async deleteGuest (id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].delete("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["API_ENDPOINTS"].GUESTS, "/").concat(id));
    },
    async bulkDeleteGuests (ids) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].delete("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["API_ENDPOINTS"].GUESTS, "/bulk"), {
            data: {
                ids
            }
        });
    },
    async bulkImportGuests (file) {
        const form = new FormData();
        form.append('file', file);
        const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["API_ENDPOINTS"].GUESTS, "/bulk-import"), form, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return data;
    },
    async exportGuests () {
        const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["API_ENDPOINTS"].GUESTS, "/export"));
        return data;
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/staff.service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "staffService",
    ()=>staffService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/axios.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/constants/index.ts [app-client] (ecmascript) <locals>");
;
;
const staffService = {
    async getStaff () {
        let filters = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        const p = new URLSearchParams();
        var _filters_limit;
        p.set('limit', String((_filters_limit = filters.limit) !== null && _filters_limit !== void 0 ? _filters_limit : 50));
        if (filters.cursor) p.set('cursor', filters.cursor);
        if (filters.search) p.set('search', filters.search);
        if (filters.status) p.set('status', filters.status);
        const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["API_ENDPOINTS"].STAFF, "?").concat(p));
        return data;
    },
    async getStaffMember (id) {
        const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["API_ENDPOINTS"].STAFF, "/").concat(id));
        return data;
    },
    async createStaff (input) {
        const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["API_ENDPOINTS"].STAFF, input);
        return data;
    },
    async updateStaff (id, input) {
        const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].put("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["API_ENDPOINTS"].STAFF, "/").concat(id), input);
        return data;
    },
    async deleteStaff (id) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].delete("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["API_ENDPOINTS"].STAFF, "/").concat(id));
    },
    async updateSchedule (id, schedule) {
        const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].put("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["API_ENDPOINTS"].STAFF, "/").concat(id, "/schedule"), schedule);
        return data;
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/dialogs/NewAppointmentDialog.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>NewAppointmentDialog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$guest$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/guest.service.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$staff$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/staff.service.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
// Half-hour slots from 8:00 to 17:00
const TIME_SLOTS = Array.from({
    length: 19
}, (_, i)=>{
    const totalMin = 8 * 60 + i * 30;
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return "".concat(String(h).padStart(2, '0'), ":").concat(String(m).padStart(2, '0'));
});
// Busy slots from the server will be empty by default (server-side logic handles conflicts)
const MOCK_BUSY = {};
function NewAppointmentDialog(param) {
    let { open, onClose, onBook, defaultDate, preselectedCustomerId } = param;
    _s();
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [selectedCustomerId, setSelectedCustomerId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(preselectedCustomerId !== null && preselectedCustomerId !== void 0 ? preselectedCustomerId : '');
    const [selectedServiceId, setSelectedServiceId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [selectedStaffId, setSelectedStaffId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [selectedTime, setSelectedTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [customers, setCustomers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [staffList, setStaffList] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NewAppointmentDialog.useEffect": ()=>{
            if (!open) return;
            __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$guest$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["guestService"].getGuests({
                limit: 100
            }).then({
                "NewAppointmentDialog.useEffect": (res)=>{
                    var _ref;
                    setCustomers((_ref = res.data) !== null && _ref !== void 0 ? _ref : []);
                }
            }["NewAppointmentDialog.useEffect"]).catch({
                "NewAppointmentDialog.useEffect": ()=>{}
            }["NewAppointmentDialog.useEffect"]);
            __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$staff$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["staffService"].getStaff({
                limit: 50
            }).then({
                "NewAppointmentDialog.useEffect": (res)=>{
                    var _res_data;
                    const mapped = ((_res_data = res.data) !== null && _res_data !== void 0 ? _res_data : []).map({
                        "NewAppointmentDialog.useEffect.mapped": (s)=>{
                            var _rooms;
                            return {
                                id: s.id,
                                shortName: s.name.split(' ')[0],
                                rooms: (_rooms = s.rooms) !== null && _rooms !== void 0 ? _rooms : ''
                            };
                        }
                    }["NewAppointmentDialog.useEffect.mapped"]);
                    setStaffList(mapped);
                }
            }["NewAppointmentDialog.useEffect"]).catch({
                "NewAppointmentDialog.useEffect": ()=>{}
            }["NewAppointmentDialog.useEffect"]);
        }
    }["NewAppointmentDialog.useEffect"], [
        open
    ]);
    // Static service list — no API endpoint defined for spa services
    const spaServices = [];
    function reset() {
        setStep(1);
        setSelectedCustomerId(preselectedCustomerId !== null && preselectedCustomerId !== void 0 ? preselectedCustomerId : '');
        setSelectedServiceId('');
        setSelectedStaffId('');
        setSelectedTime('');
    }
    function handleClose() {
        reset();
        onClose();
    }
    function handleBook() {
        const customer = customers.find((c)=>c.id === selectedCustomerId);
        const service = spaServices.find((s)=>s.id === selectedServiceId);
        const staff = staffList.find((s)=>s.id === selectedStaffId);
        var _customer_id, _customer_name, _customer_initials, _customer_tier, _customer_phone, _staff_id, _staff_shortName, _service_name, _service_duration, _service_room;
        const appt = {
            customerId: (_customer_id = customer === null || customer === void 0 ? void 0 : customer.id) !== null && _customer_id !== void 0 ? _customer_id : selectedCustomerId,
            customerName: (_customer_name = customer === null || customer === void 0 ? void 0 : customer.name) !== null && _customer_name !== void 0 ? _customer_name : '',
            customerInitials: (_customer_initials = customer === null || customer === void 0 ? void 0 : customer.initials) !== null && _customer_initials !== void 0 ? _customer_initials : '',
            customerTier: (_customer_tier = customer === null || customer === void 0 ? void 0 : customer.tier) !== null && _customer_tier !== void 0 ? _customer_tier : 'Standard',
            customerPhone: (_customer_phone = customer === null || customer === void 0 ? void 0 : customer.phone) !== null && _customer_phone !== void 0 ? _customer_phone : '',
            staffId: (_staff_id = staff === null || staff === void 0 ? void 0 : staff.id) !== null && _staff_id !== void 0 ? _staff_id : selectedStaffId,
            staffName: (_staff_shortName = staff === null || staff === void 0 ? void 0 : staff.shortName) !== null && _staff_shortName !== void 0 ? _staff_shortName : '',
            service: (_service_name = service === null || service === void 0 ? void 0 : service.name) !== null && _service_name !== void 0 ? _service_name : selectedServiceId,
            duration: (_service_duration = service === null || service === void 0 ? void 0 : service.duration) !== null && _service_duration !== void 0 ? _service_duration : 60,
            room: (_service_room = service === null || service === void 0 ? void 0 : service.room) !== null && _service_room !== void 0 ? _service_room : '',
            date: defaultDate !== null && defaultDate !== void 0 ? defaultDate : new Date().toISOString().split('T')[0],
            startTime: selectedTime,
            status: 'scheduled'
        };
        onBook(appt);
        handleClose();
    }
    const canProceedStep1 = !!selectedCustomerId && !!selectedServiceId;
    const canProceedStep2 = !!selectedStaffId && !!selectedTime;
    const selectedCustomer = customers.find((c)=>c.id === selectedCustomerId);
    const selectedService = spaServices.find((s)=>s.id === selectedServiceId);
    const selectedStaff = staffList.find((s)=>s.id === selectedStaffId);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Dialog"], {
        open: open,
        onOpenChange: (v)=>{
            if (!v) handleClose();
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogContent"], {
            className: "max-w-md",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogHeader"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogTitle"], {
                            children: "New appointment"
                        }, void 0, false, {
                            fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                            lineNumber: 115,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-muted-foreground",
                            children: [
                                "Step ",
                                step,
                                " of 3"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                            lineNumber: 116,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                    lineNumber: 114,
                    columnNumber: 9
                }, this),
                step === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Step1, {
                    customers: customers,
                    spaServices: spaServices,
                    selectedCustomerId: selectedCustomerId,
                    onSelectCustomer: setSelectedCustomerId,
                    selectedServiceId: selectedServiceId,
                    onSelectService: setSelectedServiceId
                }, void 0, false, {
                    fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                    lineNumber: 120,
                    columnNumber: 11
                }, this),
                step === 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Step2, {
                    staffList: staffList,
                    selectedStaffId: selectedStaffId,
                    onSelectStaff: (id)=>{
                        setSelectedStaffId(id);
                        setSelectedTime('');
                    },
                    selectedTime: selectedTime,
                    onSelectTime: setSelectedTime
                }, void 0, false, {
                    fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                    lineNumber: 131,
                    columnNumber: 11
                }, this),
                step === 3 && selectedCustomer && selectedService && selectedStaff && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Step3, {
                    customer: selectedCustomer,
                    service: selectedService,
                    staff: selectedStaff,
                    time: selectedTime,
                    date: defaultDate
                }, void 0, false, {
                    fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                    lineNumber: 141,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogFooter"], {
                    className: "flex justify-between gap-2",
                    children: [
                        step > 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "outline",
                            onClick: ()=>setStep((s)=>s - 1),
                            children: "← Back"
                        }, void 0, false, {
                            fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                            lineNumber: 152,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "outline",
                            onClick: handleClose,
                            children: "Close"
                        }, void 0, false, {
                            fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                            lineNumber: 156,
                            columnNumber: 13
                        }, this),
                        step < 3 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: ()=>setStep((s)=>s + 1),
                            disabled: step === 1 ? !canProceedStep1 : !canProceedStep2,
                            children: "Continue"
                        }, void 0, false, {
                            fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                            lineNumber: 161,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: handleBook,
                            children: "Book appointment"
                        }, void 0, false, {
                            fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                            lineNumber: 168,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                    lineNumber: 150,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
            lineNumber: 113,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
        lineNumber: 112,
        columnNumber: 5
    }, this);
}
_s(NewAppointmentDialog, "tvZeJNMpD6EdhTkS8dlrtpCBSOM=");
_c = NewAppointmentDialog;
// ─── Step 1: Customer + Service ──────────────────────────────────────────────
function Step1(param) {
    let { customers, spaServices, selectedCustomerId, onSelectCustomer, selectedServiceId, onSelectService } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4 py-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-muted-foreground",
                children: "Who is coming in, and what for."
            }, void 0, false, {
                fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                lineNumber: 195,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-sm font-medium",
                        children: "Customer"
                    }, void 0, false, {
                        fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                        lineNumber: 198,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        className: "w-full rounded-md border px-3 py-2 text-sm bg-background",
                        value: selectedCustomerId,
                        onChange: (e)=>onSelectCustomer(e.target.value),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                children: "Select a customer…"
                            }, void 0, false, {
                                fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                                lineNumber: 204,
                                columnNumber: 11
                            }, this),
                            customers.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: c.id,
                                    children: c.name
                                }, c.id, false, {
                                    fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                                    lineNumber: 206,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                        lineNumber: 199,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                lineNumber: 197,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-sm font-medium",
                        children: "Service"
                    }, void 0, false, {
                        fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                        lineNumber: 214,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 gap-2",
                        children: [
                            spaServices.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center justify-between rounded-md border px-3 py-2.5 text-left transition-colors', selectedServiceId === s.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'),
                                    onClick: ()=>onSelectService(s.id),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm font-medium",
                                            children: s.name
                                        }, void 0, false, {
                                            fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                                            lineNumber: 228,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs text-muted-foreground",
                                            children: [
                                                s.duration,
                                                " min · ",
                                                s.room
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                                            lineNumber: 229,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, s.id, true, {
                                    fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                                    lineNumber: 217,
                                    columnNumber: 13
                                }, this)),
                            spaServices.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-muted-foreground py-2",
                                children: "No services available"
                            }, void 0, false, {
                                fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                                lineNumber: 235,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                        lineNumber: 215,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                lineNumber: 213,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
        lineNumber: 194,
        columnNumber: 5
    }, this);
}
_c1 = Step1;
// ─── Step 2: Staff + Time ─────────────────────────────────────────────────────
function Step2(param) {
    let { staffList, selectedStaffId, onSelectStaff, selectedTime, onSelectTime } = param;
    var _MOCK_BUSY_selectedStaffId;
    const busySlots = selectedStaffId ? (_MOCK_BUSY_selectedStaffId = MOCK_BUSY[selectedStaffId]) !== null && _MOCK_BUSY_selectedStaffId !== void 0 ? _MOCK_BUSY_selectedStaffId : [] : [];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4 py-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-muted-foreground",
                children: "Choose a staff member, then an open time."
            }, void 0, false, {
                fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                lineNumber: 262,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-sm font-medium",
                        children: "Staff member"
                    }, void 0, false, {
                        fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                        lineNumber: 265,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-2",
                        children: staffList.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('rounded-full border px-3 py-1 text-sm transition-colors', selectedStaffId === s.id ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted'),
                                onClick: ()=>onSelectStaff(s.id),
                                children: s.shortName
                            }, s.id, false, {
                                fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                                lineNumber: 268,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                        lineNumber: 266,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                lineNumber: 264,
                columnNumber: 7
            }, this),
            selectedStaffId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-sm font-medium",
                        children: "Available times · Thursday"
                    }, void 0, false, {
                        fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                        lineNumber: 287,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-4 gap-2",
                        children: TIME_SLOTS.map((t)=>{
                            const busy = busySlots.includes(t);
                            const selected = selectedTime === t;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                disabled: busy,
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('rounded-md border py-1.5 text-sm transition-colors', busy ? 'opacity-40 cursor-not-allowed bg-muted text-muted-foreground' : selected ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted'),
                                onClick: ()=>!busy && onSelectTime(t),
                                children: formatSlotTime(t)
                            }, t, false, {
                                fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                                lineNumber: 293,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                        lineNumber: 288,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-muted-foreground",
                        children: "Greyed times are already booked for this staff member."
                    }, void 0, false, {
                        fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                        lineNumber: 312,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                lineNumber: 286,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
        lineNumber: 261,
        columnNumber: 5
    }, this);
}
_c2 = Step2;
// ─── Step 3: Confirm ──────────────────────────────────────────────────────────
function Step3(param) {
    let { customer, service, staff, time, date } = param;
    var _service_duration;
    const endMin = timeToMinutes(time) + ((_service_duration = service === null || service === void 0 ? void 0 : service.duration) !== null && _service_duration !== void 0 ? _service_duration : 60);
    const dateLabel = date ? new Date(date).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    }) : 'Today';
    var _service_name, _service_duration1, _staff_shortName, _service_room;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4 py-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-muted-foreground",
                children: "Review and confirm the appointment details."
            }, void 0, false, {
                fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                lineNumber: 341,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-lg border p-4 space-y-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary",
                                children: customer === null || customer === void 0 ? void 0 : customer.initials
                            }, void 0, false, {
                                fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                                lineNumber: 344,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-semibold",
                                        children: customer === null || customer === void 0 ? void 0 : customer.name
                                    }, void 0, false, {
                                        fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                                        lineNumber: 348,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        variant: "outline",
                                        className: "text-xs",
                                        children: customer === null || customer === void 0 ? void 0 : customer.tier
                                    }, void 0, false, {
                                        fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                                        lineNumber: 349,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                                lineNumber: 347,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                        lineNumber: 343,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {}, void 0, false, {
                        fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                        lineNumber: 352,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ConfirmRow, {
                        label: "Service",
                        value: "".concat((_service_name = service === null || service === void 0 ? void 0 : service.name) !== null && _service_name !== void 0 ? _service_name : '', " · ").concat((_service_duration1 = service === null || service === void 0 ? void 0 : service.duration) !== null && _service_duration1 !== void 0 ? _service_duration1 : 0, " min")
                    }, void 0, false, {
                        fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                        lineNumber: 353,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ConfirmRow, {
                        label: "Staff",
                        value: (_staff_shortName = staff === null || staff === void 0 ? void 0 : staff.shortName) !== null && _staff_shortName !== void 0 ? _staff_shortName : ''
                    }, void 0, false, {
                        fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                        lineNumber: 354,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ConfirmRow, {
                        label: "Room",
                        value: (_service_room = service === null || service === void 0 ? void 0 : service.room) !== null && _service_room !== void 0 ? _service_room : ''
                    }, void 0, false, {
                        fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                        lineNumber: 355,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ConfirmRow, {
                        label: "Date",
                        value: dateLabel
                    }, void 0, false, {
                        fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                        lineNumber: 356,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ConfirmRow, {
                        label: "Time",
                        value: "".concat(formatSlotTime(time), " – ").concat(minutesToTime(endMin))
                    }, void 0, false, {
                        fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                        lineNumber: 357,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                lineNumber: 342,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
        lineNumber: 340,
        columnNumber: 5
    }, this);
}
_c3 = Step3;
function ConfirmRow(param) {
    let { label, value } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex justify-between text-sm",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-muted-foreground",
                children: label
            }, void 0, false, {
                fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                lineNumber: 369,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "font-medium",
                children: value
            }, void 0, false, {
                fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
                lineNumber: 370,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/dialogs/NewAppointmentDialog.tsx",
        lineNumber: 368,
        columnNumber: 5
    }, this);
}
_c4 = ConfirmRow;
function formatSlotTime(t) {
    const [h, m] = t.split(':').map(Number);
    const ampm = h < 12 ? 'am' : 'pm';
    const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return "".concat(dh, ":").concat(String(m).padStart(2, '0')).concat(ampm === 'am' ? '' : 'pm').replace(':00', ':00').replace('am', '');
}
function timeToMinutes(t) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
}
function minutesToTime(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const ampm = h < 12 ? 'am' : 'pm';
    const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return "".concat(dh, ":").concat(String(m).padStart(2, '0'), " ").concat(ampm);
}
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "NewAppointmentDialog");
__turbopack_context__.k.register(_c1, "Step1");
__turbopack_context__.k.register(_c2, "Step2");
__turbopack_context__.k.register(_c3, "Step3");
__turbopack_context__.k.register(_c4, "ConfirmRow");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/appointment.service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "appointmentService",
    ()=>appointmentService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/axios.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/constants/index.ts [app-client] (ecmascript) <locals>");
;
;
const appointmentService = {
    async getAppointments () {
        let filters = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        const p = new URLSearchParams();
        var _filters_limit;
        p.set('limit', String((_filters_limit = filters.limit) !== null && _filters_limit !== void 0 ? _filters_limit : 50));
        if (filters.cursor) p.set('cursor', filters.cursor);
        if (filters.search) p.set('search', filters.search);
        if (filters.status) p.set('status', filters.status);
        const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["API_ENDPOINTS"].APPOINTMENTS, "?").concat(p));
        return data;
    },
    async createAppointment (input) {
        const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["API_ENDPOINTS"].APPOINTMENTS, input);
        return data;
    },
    async updateAppointmentStatus (id, status) {
        const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].put("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["API_ENDPOINTS"].APPOINTMENTS, "/").concat(id, "/status"), {
            status
        });
        return data;
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/(dashboard)/calendar/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CalendarPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dialogs$2f$NewAppointmentDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/dialogs/NewAppointmentDialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$appointment$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/appointment.service.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$staff$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/staff.service.ts [app-client] (ecmascript)");
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
const REFERENCE_DATE = new Date('2026-08-06');
const HOUR_START = 8;
const HOUR_END = 18;
const SLOT_HEIGHT = 64;
const STATUS_STYLES = {
    scheduled: {
        bg: 'bg-blue-100 border-blue-400',
        text: 'text-blue-800',
        label: 'Scheduled'
    },
    checked_in: {
        bg: 'bg-green-100 border-green-400',
        text: 'text-green-800',
        label: 'Checked in'
    },
    completed: {
        bg: 'bg-gray-100 border-gray-400',
        text: 'text-gray-600',
        label: 'Completed'
    },
    cancelled: {
        bg: 'bg-red-50 border-red-300',
        text: 'text-red-600',
        label: 'Cancelled'
    },
    no_show: {
        bg: 'bg-orange-50 border-orange-300',
        text: 'text-orange-700',
        label: 'No-show'
    }
};
// Rooms derived from loaded appointments
const FALLBACK_ROOMS = [];
function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}
function formatDate(date) {
    return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
}
function toISODate(date) {
    return date.toISOString().split('T')[0];
}
function timeToDecimal(time) {
    const [h, m] = time.split(':').map(Number);
    return h + m / 60;
}
function AppointmentBlock(param) {
    let { appt, onClick } = param;
    const style = STATUS_STYLES[appt.status];
    const top = (timeToDecimal(appt.startTime) - HOUR_START) * SLOT_HEIGHT;
    const height = appt.duration / 60 * SLOT_HEIGHT;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute left-1 right-1 rounded border-l-2 ".concat(style.bg, " ").concat(style.text, " px-2 py-1 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"),
        style: {
            top: "".concat(top, "px"),
            height: "".concat(Math.max(height, 28), "px")
        },
        onClick: ()=>onClick(appt),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs font-semibold truncate leading-tight",
                children: appt.customerName
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                lineNumber: 57,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs opacity-75 truncate leading-tight",
                children: appt.service
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this),
            height >= 40 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs opacity-60 truncate",
                children: appt.staffName
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                lineNumber: 59,
                columnNumber: 24
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
_c = AppointmentBlock;
function CalendarPage() {
    _s();
    const [currentDate, setCurrentDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(REFERENCE_DATE);
    const [selectedRoom, setSelectedRoom] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('All');
    const [selectedAppt, setSelectedAppt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [newApptOpen, setNewApptOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [appointments, setAppointments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [calendarStaff, setCalendarStaff] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CalendarPage.useEffect": ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$appointment$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["appointmentService"].getAppointments({
                limit: 200
            }).then({
                "CalendarPage.useEffect": (res)=>{
                    var _ref;
                    setAppointments((_ref = res.data) !== null && _ref !== void 0 ? _ref : []);
                }
            }["CalendarPage.useEffect"]).catch({
                "CalendarPage.useEffect": ()=>{}
            }["CalendarPage.useEffect"]);
            __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$staff$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["staffService"].getStaff({
                limit: 50
            }).then({
                "CalendarPage.useEffect": (res)=>{
                    var _res_data;
                    const mapped = ((_res_data = res.data) !== null && _res_data !== void 0 ? _res_data : []).map({
                        "CalendarPage.useEffect.mapped": (s)=>{
                            var _rooms;
                            return {
                                id: s.id,
                                shortName: s.name.split(' ')[0],
                                rooms: (_rooms = s.rooms) !== null && _rooms !== void 0 ? _rooms : ''
                            };
                        }
                    }["CalendarPage.useEffect.mapped"]);
                    setCalendarStaff(mapped);
                }
            }["CalendarPage.useEffect"]).catch({
                "CalendarPage.useEffect": ()=>{}
            }["CalendarPage.useEffect"]);
        }
    }["CalendarPage.useEffect"], []);
    const ALL_ROOMS = Array.from(new Set(appointments.map((a)=>a.room).filter(Boolean)));
    const dateKey = toISODate(currentDate);
    const dayAppointments = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CalendarPage.useMemo[dayAppointments]": ()=>appointments.filter({
                "CalendarPage.useMemo[dayAppointments]": (a)=>a.date === dateKey
            }["CalendarPage.useMemo[dayAppointments]"])
    }["CalendarPage.useMemo[dayAppointments]"], [
        appointments,
        dateKey
    ]);
    // Appointments filtered by room (or all)
    const visibleAppointments = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CalendarPage.useMemo[visibleAppointments]": ()=>selectedRoom === 'All' ? dayAppointments : dayAppointments.filter({
                "CalendarPage.useMemo[visibleAppointments]": (a)=>a.room === selectedRoom
            }["CalendarPage.useMemo[visibleAppointments]"])
    }["CalendarPage.useMemo[visibleAppointments]"], [
        dayAppointments,
        selectedRoom
    ]);
    const onSiteCount = dayAppointments.filter((a)=>a.status === 'checked_in').length;
    const goToday = ()=>setCurrentDate(REFERENCE_DATE);
    const goPrev = ()=>setCurrentDate((d)=>addDays(d, -1));
    const goNext = ()=>setCurrentDate((d)=>addDays(d, 1));
    function handleStatusChange(id, newStatus) {
        const now = new Date().toTimeString().slice(0, 5);
        setAppointments((prev)=>prev.map((a)=>a.id === id ? {
                    ...a,
                    status: newStatus,
                    checkInTime: newStatus === 'checked_in' ? now : a.checkInTime,
                    checkOutTime: newStatus === 'completed' ? now : a.checkOutTime,
                    cancelledTime: newStatus === 'cancelled' ? now : a.cancelledTime,
                    noShowTime: newStatus === 'no_show' ? now : a.noShowTime
                } : a));
        setSelectedAppt(null);
    }
    function handleAddAppointment(appt) {
        setAppointments((prev)=>[
                ...prev,
                {
                    ...appt,
                    id: "a".concat(Date.now())
                }
            ]);
    }
    const totalHours = HOUR_END - HOUR_START;
    const hours = Array.from({
        length: totalHours
    }, (_, i)=>HOUR_START + i);
    const gridHeight = totalHours * SLOT_HEIGHT;
    // Staff assigned to the selected room (for column header)
    const roomStaff = selectedRoom === 'All' ? null : calendarStaff.find((s)=>s.rooms.includes(selectedRoom.replace('Room ', '')));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-xl font-bold truncate sm:text-2xl",
                                children: formatDate(currentDate)
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                lineNumber: 144,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-muted-foreground",
                                children: [
                                    "Harbor Street · ",
                                    visibleAppointments.length,
                                    " appointment",
                                    visibleAppointments.length !== 1 ? 's' : '',
                                    " · ",
                                    onSiteCount,
                                    " on site"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                lineNumber: 145,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                        lineNumber: 143,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: "outline",
                                        size: "icon",
                                        onClick: goPrev,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                            lineNumber: 152,
                                            columnNumber: 68
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                        lineNumber: 152,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: "outline",
                                        size: "sm",
                                        onClick: goToday,
                                        children: "Today"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                        lineNumber: 153,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: "outline",
                                        size: "icon",
                                        onClick: goNext,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                            lineNumber: 154,
                                            columnNumber: 68
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                        lineNumber: 154,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                lineNumber: 151,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: selectedRoom,
                                onChange: (e)=>setSelectedRoom(e.target.value),
                                className: "h-8 rounded-md border bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "All",
                                        children: "All rooms"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                        lineNumber: 163,
                                        columnNumber: 13
                                    }, this),
                                    ALL_ROOMS.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: r,
                                            children: r
                                        }, r, false, {
                                            fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                            lineNumber: 165,
                                            columnNumber: 15
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                lineNumber: 158,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                size: "sm",
                                onClick: ()=>setNewApptOpen(true),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                        className: "mr-2 h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                        lineNumber: 170,
                                        columnNumber: 13
                                    }, this),
                                    "New appointment"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                lineNumber: 169,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                        lineNumber: 149,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                lineNumber: 142,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap gap-x-4 gap-y-2",
                children: Object.entries(STATUS_STYLES).map((param)=>{
                    let [key, s] = param;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "w-3 h-3 rounded-sm border ".concat(s.bg)
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                lineNumber: 180,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs text-muted-foreground",
                                children: s.label
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                lineNumber: 181,
                                columnNumber: 13
                            }, this)
                        ]
                    }, key, true, {
                        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                        lineNumber: 179,
                        columnNumber: 11
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                lineNumber: 177,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "md:hidden space-y-3",
                children: [
                    visibleAppointments.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-center text-sm text-muted-foreground py-10",
                        children: "No appointments."
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                        lineNumber: 189,
                        columnNumber: 11
                    }, this),
                    [
                        ...visibleAppointments
                    ].sort((a, b)=>a.startTime.localeCompare(b.startTime)).map((appt)=>{
                        const style = STATUS_STYLES[appt.status];
                        const [h, m] = appt.startTime.split(':').map(Number);
                        const ampm = h < 12 ? 'am' : 'pm';
                        const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-3 rounded-lg border-l-4 border p-3 cursor-pointer ".concat(style.bg),
                            onClick: ()=>setSelectedAppt(appt),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-14 shrink-0 text-right",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-semibold ".concat(style.text),
                                        children: [
                                            dh,
                                            ":",
                                            String(m).padStart(2, '0'),
                                            ampm
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                        lineNumber: 205,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                    lineNumber: 204,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "min-w-0 flex-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-semibold truncate ".concat(style.text),
                                            children: appt.customerName
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                            lineNumber: 208,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-muted-foreground truncate",
                                            children: [
                                                appt.service,
                                                " · ",
                                                appt.staffName,
                                                " · ",
                                                appt.room
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                            lineNumber: 209,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                    lineNumber: 207,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "shrink-0 self-center px-2 py-0.5 rounded-full text-xs font-medium ".concat(style.bg, " ").concat(style.text),
                                    children: style.label
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                    lineNumber: 211,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, appt.id, true, {
                            fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                            lineNumber: 199,
                            columnNumber: 15
                        }, this);
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                lineNumber: 187,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hidden md:block flex-1 overflow-auto border rounded-lg bg-background",
                children: selectedRoom === 'All' ? /* All rooms — one column per room */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex",
                    style: {
                        minWidth: "".concat(16 * 4 + ALL_ROOMS.length * 160, "px")
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-16 shrink-0 border-r",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-10 border-b"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                    lineNumber: 225,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative",
                                    style: {
                                        height: "".concat(gridHeight, "px")
                                    },
                                    children: hours.map((h)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute left-0 right-0 flex items-start justify-end pr-2",
                                            style: {
                                                top: "".concat((h - HOUR_START) * SLOT_HEIGHT, "px"),
                                                height: "".concat(SLOT_HEIGHT, "px")
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-muted-foreground -translate-y-2",
                                                children: h < 12 ? "".concat(h, "am") : h === 12 ? '12pm' : "".concat(h - 12, "pm")
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                                lineNumber: 230,
                                                columnNumber: 21
                                            }, this)
                                        }, h, false, {
                                            fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                            lineNumber: 228,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                    lineNumber: 226,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                            lineNumber: 224,
                            columnNumber: 13
                        }, this),
                        ALL_ROOMS.map((room)=>{
                            const staff = calendarStaff.find((s)=>s.rooms.includes(room.replace('Room ', '')));
                            const roomAppts = dayAppointments.filter((a)=>a.room === room);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 border-r last:border-r-0 min-w-[160px]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-10 border-b flex flex-col items-center justify-center px-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs font-semibold",
                                                children: room
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                                lineNumber: 243,
                                                columnNumber: 21
                                            }, this),
                                            staff && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-muted-foreground",
                                                children: staff.shortName
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                                lineNumber: 244,
                                                columnNumber: 31
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                        lineNumber: 242,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative",
                                        style: {
                                            height: "".concat(gridHeight, "px")
                                        },
                                        children: [
                                            hours.map((h)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "absolute left-0 right-0 border-t border-dashed border-gray-100",
                                                    style: {
                                                        top: "".concat((h - HOUR_START) * SLOT_HEIGHT, "px")
                                                    }
                                                }, h, false, {
                                                    fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                                    lineNumber: 248,
                                                    columnNumber: 23
                                                }, this)),
                                            roomAppts.map((appt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AppointmentBlock, {
                                                    appt: appt,
                                                    onClick: setSelectedAppt
                                                }, appt.id, false, {
                                                    fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                                    lineNumber: 252,
                                                    columnNumber: 23
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                        lineNumber: 246,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, room, true, {
                                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                lineNumber: 241,
                                columnNumber: 17
                            }, this);
                        })
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                    lineNumber: 223,
                    columnNumber: 11
                }, this) : /* Single room selected */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex",
                    style: {
                        minWidth: '400px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-16 shrink-0 border-r",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-10 border-b"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                    lineNumber: 263,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative",
                                    style: {
                                        height: "".concat(gridHeight, "px")
                                    },
                                    children: hours.map((h)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute left-0 right-0 flex items-start justify-end pr-2",
                                            style: {
                                                top: "".concat((h - HOUR_START) * SLOT_HEIGHT, "px"),
                                                height: "".concat(SLOT_HEIGHT, "px")
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-muted-foreground -translate-y-2",
                                                children: h < 12 ? "".concat(h, "am") : h === 12 ? '12pm' : "".concat(h - 12, "pm")
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                                lineNumber: 268,
                                                columnNumber: 21
                                            }, this)
                                        }, h, false, {
                                            fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                            lineNumber: 266,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                    lineNumber: 264,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                            lineNumber: 262,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-10 border-b flex flex-col items-center justify-center px-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs font-semibold",
                                            children: selectedRoom
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                            lineNumber: 277,
                                            columnNumber: 17
                                        }, this),
                                        roomStaff && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs text-muted-foreground",
                                            children: roomStaff.shortName
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                            lineNumber: 278,
                                            columnNumber: 31
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                    lineNumber: 276,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative",
                                    style: {
                                        height: "".concat(gridHeight, "px")
                                    },
                                    children: [
                                        hours.map((h)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute left-0 right-0 border-t border-dashed border-gray-100",
                                                style: {
                                                    top: "".concat((h - HOUR_START) * SLOT_HEIGHT, "px")
                                                }
                                            }, h, false, {
                                                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                                lineNumber: 282,
                                                columnNumber: 19
                                            }, this)),
                                        visibleAppointments.map((appt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AppointmentBlock, {
                                                appt: appt,
                                                onClick: setSelectedAppt
                                            }, appt.id, false, {
                                                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                                lineNumber: 286,
                                                columnNumber: 19
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                    lineNumber: 280,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                            lineNumber: 275,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                    lineNumber: 261,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                lineNumber: 220,
                columnNumber: 7
            }, this),
            selectedAppt && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AppointmentDetailPanel, {
                appt: selectedAppt,
                onClose: ()=>setSelectedAppt(null),
                onStatusChange: handleStatusChange
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                lineNumber: 295,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dialogs$2f$NewAppointmentDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                open: newApptOpen,
                onClose: ()=>setNewApptOpen(false),
                onBook: handleAddAppointment,
                defaultDate: dateKey
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                lineNumber: 302,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
        lineNumber: 140,
        columnNumber: 5
    }, this);
}
_s(CalendarPage, "gvLXAvBZS87ULhDS2tp2WXXk0sE=");
_c1 = CalendarPage;
function AppointmentDetailPanel(param) {
    let { appt, onClose, onStatusChange } = param;
    const style = STATUS_STYLES[appt.status];
    const [h, m] = appt.startTime.split(':').map(Number);
    const endMinutes = h * 60 + m + appt.duration;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    const fmtTime = (hh, mm)=>{
        const ampm = hh < 12 ? 'am' : 'pm';
        const displayH = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
        return "".concat(displayH, ":").concat(String(mm).padStart(2, '0'), " ").concat(ampm);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-y-0 right-0 w-80 bg-background border-l shadow-xl z-50 flex flex-col",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between px-4 py-3 border-b",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "font-semibold",
                        children: "Appointment"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                        lineNumber: 335,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "ghost",
                        size: "sm",
                        onClick: onClose,
                        children: "✕"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                        lineNumber: 336,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                lineNumber: 334,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-auto p-4 space-y-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary",
                                children: appt.customerInitials
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                lineNumber: 341,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-medium",
                                        children: appt.customerName
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                        lineNumber: 345,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-muted-foreground",
                                        children: appt.customerPhone
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                        lineNumber: 346,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                lineNumber: 344,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                variant: "outline",
                                className: "ml-auto text-xs",
                                children: appt.customerTier
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                lineNumber: 348,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                        lineNumber: 340,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2 text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Row, {
                                label: "Service",
                                value: appt.service
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                lineNumber: 353,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Row, {
                                label: "Staff",
                                value: appt.staffName
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                lineNumber: 354,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Row, {
                                label: "Room",
                                value: appt.room
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                lineNumber: 355,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Row, {
                                label: "Time",
                                value: "".concat(fmtTime(h, m), " – ").concat(fmtTime(endH, endM))
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                lineNumber: 356,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Row, {
                                label: "Duration",
                                value: "".concat(appt.duration, " min")
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                lineNumber: 357,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-muted-foreground",
                                        children: "Status"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                        lineNumber: 359,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "px-2 py-0.5 rounded-full text-xs font-medium ".concat(style.bg, " ").concat(style.text),
                                        children: style.label
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                        lineNumber: 360,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                lineNumber: 358,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                        lineNumber: 352,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2 pt-2",
                        children: [
                            appt.status === 'scheduled' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        className: "w-full",
                                        size: "sm",
                                        onClick: ()=>onStatusChange(appt.id, 'checked_in'),
                                        children: "Check in"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                        lineNumber: 370,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: "outline",
                                        className: "w-full",
                                        size: "sm",
                                        onClick: ()=>onStatusChange(appt.id, 'cancelled'),
                                        children: "Cancel"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                        lineNumber: 377,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: "ghost",
                                        className: "w-full text-orange-600",
                                        size: "sm",
                                        onClick: ()=>onStatusChange(appt.id, 'no_show'),
                                        children: "Mark no-show"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                        lineNumber: 385,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true),
                            appt.status === 'checked_in' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                className: "w-full",
                                size: "sm",
                                onClick: ()=>onStatusChange(appt.id, 'completed'),
                                children: "Complete"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                lineNumber: 396,
                                columnNumber: 13
                            }, this),
                            (appt.status === 'cancelled' || appt.status === 'no_show') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                variant: "outline",
                                className: "w-full",
                                size: "sm",
                                onClick: ()=>onStatusChange(appt.id, 'scheduled'),
                                children: "Undo"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                                lineNumber: 405,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                        lineNumber: 367,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                lineNumber: 338,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
        lineNumber: 333,
        columnNumber: 5
    }, this);
}
_c2 = AppointmentDetailPanel;
function Row(param) {
    let { label, value } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex justify-between",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-muted-foreground",
                children: label
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                lineNumber: 423,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "font-medium",
                children: value
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/calendar/page.tsx",
                lineNumber: 424,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(dashboard)/calendar/page.tsx",
        lineNumber: 422,
        columnNumber: 5
    }, this);
}
_c3 = Row;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "AppointmentBlock");
__turbopack_context__.k.register(_c1, "CalendarPage");
__turbopack_context__.k.register(_c2, "AppointmentDetailPanel");
__turbopack_context__.k.register(_c3, "Row");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_bacad797._.js.map