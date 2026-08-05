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

     function lockStudyPlanButtons() {
        // إذا كان لديه حق الوصول، لا نفعل شيئاً
        if (hasStudyPlanAccess()) return;

        // ===== 1. قفل أزرار الأقسام الرئيسية (Hören 1, Lesen 1, ...) بتصميم PRO مقفل =====
        document.querySelectorAll('#teileList .item, #teileList .teil-item, #teileList button').forEach(btn => {
            if (btn.dataset.studyPlanLocked) return;
            btn.dataset.studyPlanLocked = 'true';

            // تحويل الزر إلى بطاقة مقفلة بنفس تصميم الامتحانات المقفلة
            btn.style.cssText = `
                background: rgba(255, 255, 255, 0.75) !important;
                border: 1px solid #e2e8f0 !important;
                color: #6b7280 !important;
                cursor: pointer !important;
                transition: all 0.25s ease !important;
                position: relative !important;
                padding: 10px 16px !important;
                border-radius: 14px !important;
                font-weight: 600 !important;
                font-size: 15px !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 8px !important;
                min-height: 42px !important;
                width: auto !important;
                background: rgba(255,255,255,0.75) !important;
                box-shadow: 0 1px 3px rgba(0,0,0,0.04) !important;
            `;

            // إضافة أيقونة القفل و Badge PRO إذا لم تكن موجودة
            if (!btn.querySelector('.lock-icon')) {
                const lockSpan = document.createElement('span');
                lockSpan.className = 'lock-icon';
                lockSpan.innerHTML = '🔒';
                lockSpan.style.cssText = 'font-size:14px; margin-left:4px;';
                btn.prepend(lockSpan);
            }
            if (!btn.querySelector('.premium-badge-small')) {
                const badge = document.createElement('span');
                badge.className = 'premium-badge-small';
                badge.textContent = 'PRO';
                badge.style.cssText = `
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: white;
                    font-size: 9px;
                    font-weight: 700;
                    padding: 2px 8px;
                    border-radius: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-right: 6px;
                    white-space: nowrap;
                `;
                btn.appendChild(badge);
            }

            // تأثيرات Hover (مطابقة للامتحانات المقفلة)
            btn.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'rgba(255,255,255,0.95)';
                this.style.transform = 'translateX(5px)';
                this.style.borderColor = '#60a5fa';
                this.style.color = '#4b5563';
                const badge = this.querySelector('.premium-badge-small');
                if (badge) badge.style.transform = 'scale(1.02)';
            });
            btn.addEventListener('mouseleave', function() {
                this.style.backgroundColor = 'rgba(255,255,255,0.75)';
                this.style.transform = 'translateX(0)';
                this.style.borderColor = '#e2e8f0';
                this.style.color = '#6b7280';
                const badge = this.querySelector('.premium-badge-small');
                if (badge) badge.style.transform = 'scale(1)';
            });

            // منع أي إجراء آخر وفتح واتساب فقط
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                openWhatsAppSubscribe();
                return false;
            }, true); // استخدام true للقبض في مرحلة الالتقاط
        });

        // ===== 2. قفل أزرار الأقسام داخل الخطة (planner-section-btn) =====
        document.querySelectorAll('.planner-section-btn').forEach(btn => {
            if (btn.dataset.studyPlanLocked) return;
            btn.dataset.studyPlanLocked = 'true';

            // تطبيق تصميم القفل على هذه الأزرار أيضاً
            btn.style.cssText = `
                background: rgba(255, 255, 255, 0.75) !important;
                border: 1px solid #e2e8f0 !important;
                color: #6b7280 !important;
                cursor: pointer !important;
                transition: all 0.25s ease !important;
                padding: 8px 16px !important;
                border-radius: 14px !important;
                font-weight: 600 !important;
                position: relative !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 6px !important;
                min-height: 36px !important;
            `;

            // إضافة أيقونة القفل و Badge PRO
            if (!btn.querySelector('.lock-icon')) {
                const lockSpan = document.createElement('span');
                lockSpan.className = 'lock-icon';
                lockSpan.innerHTML = '🔒';
                lockSpan.style.cssText = 'font-size:12px;';
                btn.prepend(lockSpan);
            }
            if (!btn.querySelector('.premium-badge-small')) {
                const badge = document.createElement('span');
                badge.className = 'premium-badge-small';
                badge.textContent = 'PRO';
                badge.style.cssText = `
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: white;
                    font-size: 8px;
                    font-weight: 700;
                    padding: 2px 6px;
                    border-radius: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                    margin-right: 4px;
                    white-space: nowrap;
                `;
                btn.appendChild(badge);
            }

            btn.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'rgba(255,255,255,0.95)';
                this.style.transform = 'translateX(4px)';
                this.style.borderColor = '#60a5fa';
                this.style.color = '#4b5563';
            });
            btn.addEventListener('mouseleave', function() {
                this.style.backgroundColor = 'rgba(255,255,255,0.75)';
                this.style.transform = 'translateX(0)';
                this.style.borderColor = '#e2e8f0';
                this.style.color = '#6b7280';
            });

            const originalClick = btn.onclick;
            btn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                openWhatsAppSubscribe();
                return false;
            };
        });

        // ===== 3. قفل زر "فحص" في جميع صفحات الخطة =====
        document.querySelectorAll('.planner-check-btn, #plannerSetupBtn, #customCheckBtn, .planner-check-btn, .planner-section-btn[data-skill]').forEach(btn => {
            if (btn.dataset.studyPlanLocked) return;
            btn.dataset.studyPlanLocked = 'true';

            // تصميم زر فحص مقفل (مثل زر التالي المقفل في الامتحانات)
            btn.style.cssText = `
                background: rgba(255, 255, 255, 0.75) !important;
                border: 1px solid #e2e8f0 !important;
                color: #6b7280 !important;
                cursor: pointer !important;
                transition: all 0.25s ease !important;
                padding: 10px 20px !important;
                border-radius: 14px !important;
                font-weight: 600 !important;
                position: relative !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 8px !important;
                min-height: 42px !important;
                width: 100% !important;
                font-size: 0.85rem !important;
            `;

            if (!btn.querySelector('.lock-icon')) {
                const lockSpan = document.createElement('span');
                lockSpan.className = 'lock-icon';
                lockSpan.innerHTML = '🔒';
                lockSpan.style.cssText = 'font-size:14px;';
                btn.prepend(lockSpan);
            }
            if (!btn.querySelector('.premium-badge-small')) {
                const badge = document.createElement('span');
                badge.className = 'premium-badge-small';
                badge.textContent = 'PRO';
                badge.style.cssText = `
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: white;
                    font-size: 9px;
                    font-weight: 700;
                    padding: 2px 8px;
                    border-radius: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-right: 6px;
                    white-space: nowrap;
                `;
                btn.appendChild(badge);
            }

            btn.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'rgba(255,255,255,0.95)';
                this.style.transform = 'translateX(5px)';
                this.style.borderColor = '#60a5fa';
                this.style.color = '#4b5563';
            });
            btn.addEventListener('mouseleave', function() {
                this.style.backgroundColor = 'rgba(255,255,255,0.75)';
                this.style.transform = 'translateX(0)';
                this.style.borderColor = '#e2e8f0';
                this.style.color = '#6b7280';
            });

            const originalClick = btn.onclick;
            btn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                openWhatsAppSubscribe();
                return false;
            };
        });

        // ===== 4. قفل زر "فحص" داخل أدوات التحكم (customCheckBtn) بشكل خاص =====
        const customCheckBtn = document.getElementById('customCheckBtn');
        if (customCheckBtn && !customCheckBtn.dataset.studyPlanLocked) {
            customCheckBtn.dataset.studyPlanLocked = 'true';
            // نفس التصميم أعلاه مع تعزيزه
            customCheckBtn.style.cssText = `
                background: rgba(255, 255, 255, 0.75) !important;
                border: 1px solid #e2e8f0 !important;
                color: #6b7280 !important;
                cursor: pointer !important;
                transition: all 0.25s ease !important;
                padding: 12px 24px !important;
                border-radius: 14px !important;
                font-weight: 600 !important;
                position: relative !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 8px !important;
                min-height: 44px !important;
                width: 100% !important;
                font-size: 0.9rem !important;
            `;
            if (!customCheckBtn.querySelector('.lock-icon')) {
                const lockSpan = document.createElement('span');
                lockSpan.className = 'lock-icon';
                lockSpan.innerHTML = '🔒';
                lockSpan.style.cssText = 'font-size:16px;';
                customCheckBtn.prepend(lockSpan);
            }
            if (!customCheckBtn.querySelector('.premium-badge-small')) {
                const badge = document.createElement('span');
                badge.className = 'premium-badge-small';
                badge.textContent = 'PRO';
                badge.style.cssText = `
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: white;
                    font-size: 10px;
                    font-weight: 700;
                    padding: 2px 10px;
                    border-radius: 14px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-right: 8px;
                    white-space: nowrap;
                `;
                customCheckBtn.appendChild(badge);
            }
            customCheckBtn.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'rgba(255,255,255,0.95)';
                this.style.transform = 'translateX(5px)';
                this.style.borderColor = '#60a5fa';
                this.style.color = '#4b5563';
            });
            customCheckBtn.addEventListener('mouseleave', function() {
                this.style.backgroundColor = 'rgba(255,255,255,0.75)';
                this.style.transform = 'translateX(0)';
                this.style.borderColor = '#e2e8f0';
                this.style.color = '#6b7280';
            });
            const originalClick = customCheckBtn.onclick;
            customCheckBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                openWhatsAppSubscribe();
                return false;
            };
        }

        // ===== 5. قفل بطاقات الامتحانات داخل الخطة (exam-card) =====
        document.querySelectorAll('.exam-card').forEach(card => {
            if (card.dataset.studyPlanLocked) return;
            card.dataset.studyPlanLocked = 'true';
            card.style.cssText = `
                background: rgba(255, 255, 255, 0.75) !important;
                border: 1px solid #e2e8f0 !important;
                cursor: pointer !important;
                transition: all 0.25s ease !important;
                padding: 10px 14px !important;
                border-radius: 14px !important;
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                gap: 8px !important;
                opacity: 1 !important;
            `;
            // إضافة أيقونة قفل صغيرة إذا لم تكن موجودة
            if (!card.querySelector('.lock-icon-small')) {
                const lockSpan = document.createElement('span');
                lockSpan.className = 'lock-icon-small';
                lockSpan.innerHTML = '🔒';
                lockSpan.style.cssText = 'font-size:12px; margin-left:4px; color:#94a3b8;';
                const title = card.querySelector('span:first-child');
                if (title) title.appendChild(lockSpan);
            }
            card.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'rgba(255,255,255,0.95)';
                this.style.transform = 'translateX(4px)';
                this.style.borderColor = '#60a5fa';
            });
            card.addEventListener('mouseleave', function() {
                this.style.backgroundColor = 'rgba(255,255,255,0.75)';
                this.style.transform = 'translateX(0)';
                this.style.borderColor = '#e2e8f0';
            });
            const originalClick = card.onclick;
            card.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                openWhatsAppSubscribe();
                return false;
            };
        });

        // ===== 6. قفل أي زر تنفيذي داخل الخطة =====
        document.querySelectorAll('.planner-card button, .planner-card .exam-card').forEach(el => {
            if (el.dataset.studyPlanLocked) return;
            const isNonExec = el.id === 'plannerSettingsBtn' || el.id === 'plannerInfoBtn';
            if (isNonExec) return;
            el.dataset.studyPlanLocked = 'true';
            el.style.cursor = 'pointer';
            el.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                openWhatsAppSubscribe();
                return false;
            });
        });

        // ===== 7. حماية إضافية: إزالة أي استدعاءات للدوال عند الضغط =====
        // نمنع أي click على هذه العناصر من تنفيذ أي كود آخر باستخدام capture
        document.querySelectorAll('.teile-row .item, .teile-row .teil-item, .planner-section-btn, #customCheckBtn, .exam-card').forEach(el => {
            if (el.dataset.studyPlanLockedCapture) return;
            el.dataset.studyPlanLockedCapture = 'true';
            el.addEventListener('click', function(e) {
                // نتحقق إذا كان الزر مقفلاً (يحتوي على lock-icon)
                if (this.querySelector('.lock-icon') || this.querySelector('.lock-icon-small') || this.classList.contains('planner-section-btn')) {
                    e.preventDefault();
                    e.stopPropagation();
                    openWhatsAppSubscribe();
                    return false;
                }
            }, true); // استخدام true للقبض قبل أي مستمع آخر
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
