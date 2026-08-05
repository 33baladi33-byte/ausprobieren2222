// ============================================
// studyPlanAccess.js - نظام الخطة اليومية المستقلة
// (طبقة منفصلة لا تؤثر على أي نظام آخر)
// ============================================

(function() {
    "use strict";

    // رقم واتساب للاشتراك في الخطة اليومية
    const WHATSAPP_NUMBER = '0665881925';

    // دالة فتح واتساب للاشتراك
    function openWhatsAppSubscribe() {
        const message = 'السلام عليكم، أريد الاشتراك في الخطة اليومية (Study Plan)';
        const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    }

    // دالة للتحقق مما إذا كان المستخدم لديه حق الوصول إلى الخطة
    function hasStudyPlanAccess() {
        return window.userStudyPlan === true;
    }

    // دالة قفل الأزرار التنفيذية في الخطة
    function lockStudyPlanButtons() {
        // إذا كان لديه حق الوصول، لا نفعل شيئاً
        if (hasStudyPlanAccess()) return;

        // 1. قفل أزرار الأقسام (Hören 1, Lesen 1, ...)
        document.querySelectorAll('.planner-section-btn').forEach(btn => {
            // نتجنب ربط الزر أكثر من مرة
            if (btn.dataset.studyPlanLocked) return;
            btn.dataset.studyPlanLocked = 'true';

            const originalClick = btn.onclick;
            btn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                openWhatsAppSubscribe();
                return false;
            };
        });

        // 2. قفل زر "فحص"
        document.querySelectorAll('.planner-check-btn, #plannerSetupBtn, #customCheckBtn, .planner-section-btn').forEach(btn => {
            if (btn.dataset.studyPlanLocked) return;
            btn.dataset.studyPlanLocked = 'true';

            const originalClick = btn.onclick;
            btn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                openWhatsAppSubscribe();
                return false;
            };
        });

        // 3. قفل بطاقات الامتحانات داخل الخطة (exam-card)
        document.querySelectorAll('.exam-card').forEach(card => {
            if (card.dataset.studyPlanLocked) return;
            card.dataset.studyPlanLocked = 'true';

            const originalClick = card.onclick;
            card.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                openWhatsAppSubscribe();
                return false;
            };
        });

        // 4. قفل أي زر داخل الخطة يحمل class 'planner-section-btn'
        document.querySelectorAll('.planner-card button, .planner-card .exam-card').forEach(el => {
            if (el.dataset.studyPlanLocked) return;
            el.dataset.studyPlanLocked = 'true';

            el.addEventListener('click', function(e) {
                // نتجنب قفل الأزرار غير التنفيذية مثل الإعدادات والمعلومات
                const isNonExec = this.id === 'plannerSettingsBtn' || this.id === 'plannerInfoBtn';
                if (isNonExec) return;

                e.preventDefault();
                e.stopPropagation();
                openWhatsAppSubscribe();
                return false;
            });
        });
    }

    // دالة إعادة تطبيق القفل عند تغيير المحتوى (مثل عند فتح الخطة)
    function applyStudyPlanLock() {
        // ننتظر قليلاً حتى يتم تحميل المحتوى
        setTimeout(lockStudyPlanButtons, 50);
    }

    // مراقبة التغييرات في DOM لإعادة تطبيق القفل
    function setupObserver() {
        const observer = new MutationObserver(function(mutations) {
            // نتحقق مما إذا كان المحتوى قد تغير في حاوية الخطة
            const container = document.getElementById('studyPlannerContainer');
            if (container && container.innerHTML) {
                // إذا تغير المحتوى، نطبق القفل
                applyStudyPlanLock();
            }
        });

        // نراقب التغييرات في حاوية الخطة
        const container = document.getElementById('studyPlannerContainer');
        if (container) {
            observer.observe(container, { childList: true, subtree: true });
        }
    }

    // تصدير الدوال للاستخدام العالمي
    window.openWhatsAppSubscribe = openWhatsAppSubscribe;
    window.hasStudyPlanAccess = hasStudyPlanAccess;
    window.applyStudyPlanLock = applyStudyPlanLock;
    window.lockStudyPlanButtons = lockStudyPlanButtons;

    // بدء التشغيل بعد تحميل الصفحة
    document.addEventListener('DOMContentLoaded', function() {
        setupObserver();
        // تطبيق القفل بعد تحميل الصفحة
        setTimeout(applyStudyPlanLock, 200);
    });

    // عند فتح الخطة، نطبق القفل
    const plannerBtn = document.getElementById('studyPlannerBtn');
    if (plannerBtn) {
        const originalClick = plannerBtn.onclick;
        plannerBtn.addEventListener('click', function() {
            setTimeout(applyStudyPlanLock, 150);
        });
    }

    console.log('✅ studyPlanAccess.js تم تحميله بنجاح (طبقة مستقلة)');
})();
