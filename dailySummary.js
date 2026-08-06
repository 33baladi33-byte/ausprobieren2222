// ============================================
// dailySummary.js - ملخص أداء الأمس
// نظام خفيف ومستقل يعرض إحصائيات امتحانات الأمس
// ============================================

(function() {
    'use strict';

    // ===== مفاتيح التخزين =====
    const STORAGE_LAST_DATE = 'dailySummary_lastDate';
    const STORAGE_HIDDEN = 'dailySummary_hidden';

    // ===== عناصر DOM =====
    let overlay = null;
    let modal = null;

    // ===== دوال مساعدة لقراءة نتائج الأمس =====
    function getYesterdayDate() {
        const now = new Date();
        now.setDate(now.getDate() - 1);
        return now.toISOString().slice(0, 10); // YYYY-MM-DD
    }

    function getTodayDate() {
        return new Date().toISOString().slice(0, 10);
    }

    // استرجاع جميع نتائج الامتحانات من localStorage
    function getAllExamResults() {
        const results = {};
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('exam_result_')) {
                    const value = localStorage.getItem(key);
                    if (value !== null) {
                        const score = parseFloat(value);
                        if (!isNaN(score)) {
                            results[key] = score;
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('⚠️ فشل قراءة نتائج الامتحانات:', e);
        }
        return results;
    }

    // استرجاع تاريخ آخر مراجعة لكل امتحان
    function getLastReviewDate(examKey) {
        const reviewKey = examKey.replace('exam_result_', 'exam_last_review_');
        return localStorage.getItem(reviewKey) || null;
    }

    // تصفية نتائج الأمس فقط
    function getYesterdayResults() {
        const allResults = getAllExamResults();
        const yesterday = getYesterdayDate();
        const filtered = {};

        for (const [key, score] of Object.entries(allResults)) {
            const reviewDate = getLastReviewDate(key);
            if (reviewDate === yesterday) {
                filtered[key] = score;
            }
        }

        return filtered;
    }

    // ===== تصنيف النتائج =====
    function classifyScores(scores) {
        const categories = {
            red: { label: '🔴 0–10', range: [0, 10], exams: [] },
            orange: { label: '🟠 11–17', range: [11, 17], exams: [] },
            blue: { label: '🔵 18–22', range: [18, 22], exams: [] },
            green: { label: '🟢 23–25', range: [23, 25], exams: [] }
        };

        for (const [key, score] of Object.entries(scores)) {
            // استخراج رقم الامتحان من المفتاح (exam_result_hoeren1_5 → 5)
            const match = key.match(/exam_result_[^_]+_(\d+)/);
            if (match) {
                const examId = parseInt(match[1]);
                if (score >= 0 && score <= 10) categories.red.exams.push(examId);
                else if (score >= 11 && score <= 17) categories.orange.exams.push(examId);
                else if (score >= 18 && score <= 22) categories.blue.exams.push(examId);
                else if (score >= 23 && score <= 25) categories.green.exams.push(examId);
            }
        }

        return categories;
    }

    // ===== توليد المخطط =====
    function renderChart(categories, container) {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 200;
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.maxWidth = '400px';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const padding = { top: 20, bottom: 30, left: 30, right: 20 };
        const chartW = w - padding.left - padding.right;
        const chartH = h - padding.top - padding.bottom;

        // نقاط المحور السيني (0, 5, 10, 15, 20, 25)
        const xLabels = [0, 5, 10, 15, 20, 25];
        // عدد الامتحانات في كل نقطة (نجمع من التصنيفات)
        const counts = xLabels.map(label => {
            let total = 0;
            if (label <= 10) total += categories.red.exams.length;
            if (label >= 11 && label <= 17) total += categories.orange.exams.length;
            if (label >= 18 && label <= 22) total += categories.blue.exams.length;
            if (label >= 23 && label <= 25) total += categories.green.exams.length;
            // نحتاج إلى توزيع دقيق حسب النقاط، لكننا سنبسطها بجعل القيمة لكل نقطة هي عدد الامتحانات في نطاقها
            // سنستخدم طريقة مختلفة: لكل امتحان نحدد أقرب نقطة على المحور.
            // بدلاً من ذلك، سنعرض نقاطاً فعلية لكل امتحان (نقاط مبعثرة) أو خطاً يمر عبر القيم.
            // لكن المطلوب هو مخطط سهمي بسيط. سنقوم بحساب عدد الامتحانات لكل نقطة على المحور.
            // سنعيد كتابة الحساب بطريقة أكثر دقة.
            // سنقوم بجمع الامتحانات حسب النقاط المحددة.
            return 0; // سيتم إعادة حسابه لاحقاً
        });

        // حساب دقيق: لكل امتحان، نحدد أقرب نقطة على المحور
        const pointCounts = {};
        xLabels.forEach(x => pointCounts[x] = 0);

        // جمع كل الامتحانات من جميع التصنيفات
        const allExams = [...categories.red.exams, ...categories.orange.exams, ...categories.blue.exams, ...categories.green.exams];
        // نحتاج إلى معرفة درجة كل امتحان مرة أخرى، لذا سنستخدم كائن scores
        const allResults = getYesterdayResults();
        const examScores = {};
        for (const [key, score] of Object.entries(allResults)) {
            const match = key.match(/exam_result_[^_]+_(\d+)/);
            if (match) {
                const id = parseInt(match[1]);
                examScores[id] = score;
            }
        }

        for (const id of allExams) {
            const score = examScores[id];
            if (score !== undefined) {
                // نجد أقرب نقطة على المحور
                let closest = xLabels[0];
                let minDist = Infinity;
                for (const x of xLabels) {
                    const dist = Math.abs(score - x);
                    if (dist < minDist) {
                        minDist = dist;
                        closest = x;
                    }
                }
                pointCounts[closest] = (pointCounts[closest] || 0) + 1;
            }
        }

        const maxCount = Math.max(1, ...Object.values(pointCounts));
        const yMax = maxCount + 1; // مسافة إضافية

        // رسم الشبكة
        ctx.clearRect(0, 0, w, h);

        // خلفية
        ctx.fillStyle = '#f9fafb';
        ctx.fillRect(0, 0, w, h);

        // رسم المحاور
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, h - padding.bottom);
        ctx.lineTo(w - padding.right, h - padding.bottom);
        ctx.stroke();

        // نقاط البيانات
        const points = xLabels.map(x => ({
            x: x,
            y: pointCounts[x] || 0
        }));

        // رسم الخط
        ctx.beginPath();
        ctx.strokeStyle = '#2c3e66';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        points.forEach((p, i) => {
            const px = padding.left + (p.x / 25) * chartW;
            const py = padding.top + chartH - (p.y / yMax) * chartH;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        });
        ctx.stroke();

        // رسم النقاط
        points.forEach((p) => {
            const px = padding.left + (p.x / 25) * chartW;
            const py = padding.top + chartH - (p.y / yMax) * chartH;
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#2c3e66';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });

        // تسميات المحور السيني
        ctx.fillStyle = '#475569';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        xLabels.forEach(x => {
            const px = padding.left + (x / 25) * chartW;
            ctx.fillText(x, px, h - padding.bottom + 15);
        });

        // تسمية المحور الصادي (القيم القصوى فقط)
        ctx.textAlign = 'right';
        ctx.fillText(yMax, padding.left - 5, padding.top + 5);
        ctx.fillText(0, padding.left - 5, h - padding.bottom + 5);

        // عنوان
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('عدد الامتحانات حسب الدرجة', w/2, padding.top - 2);
    }

    // ===== عرض قائمة الامتحانات المصنفة =====
    function renderExamList(categories, container) {
        const listDiv = document.createElement('div');
        listDiv.style.cssText = `
            margin-top: 16px;
            font-size: 13px;
            line-height: 1.8;
            text-align: right;
            direction: rtl;
            border-top: 1px solid #eef2f6;
            padding-top: 12px;
        `;

        const categoryOrder = [
            { key: 'red', label: '🔴 0–10' },
            { key: 'orange', label: '🟠 11–17' },
            { key: 'blue', label: '🔵 18–22' },
            { key: 'green', label: '🟢 23–25' }
        ];

        for (const cat of categoryOrder) {
            const exams = categories[cat.key].exams;
            if (exams.length === 0) continue;
            const span = document.createElement('div');
            span.innerHTML = `<strong>${cat.label}</strong> Exam ${exams.join(', ')}`;
            span.style.marginBottom = '4px';
            listDiv.appendChild(span);
        }

        container.appendChild(listDiv);
    }

    // ===== إنشاء النافذة المنبثقة =====
    function createModal() {
        // حذف أي نافذة قديمة
        const old = document.getElementById('dailySummaryModal');
        if (old) old.remove();

        overlay = document.createElement('div');
        overlay.id = 'dailySummaryModal';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.45);
            backdrop-filter: blur(6px);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.25s ease;
        `;

        modal = document.createElement('div');
        modal.style.cssText = `
            background: #ffffff;
            border-radius: 24px;
            padding: 28px 24px 24px;
            max-width: 460px;
            width: 92%;
            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
            border: 1px solid #eef2f6;
            max-height: 90vh;
            overflow-y: auto;
            direction: rtl;
            text-align: center;
            animation: scaleIn 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        `;

        // بيانات الأمس
        const results = getYesterdayResults();
        const hasData = Object.keys(results).length > 0;

        let contentHTML = `
            <div style="font-size: 28px; margin-bottom: 6px;">✌🏽</div>
            <h3 style="margin: 0 0 4px 0; font-size: 1.2rem; color: #1e293b; font-weight: 700;">
                معركة ممتعة يا بطل!
            </h3>
        `;

        if (!hasData) {
            contentHTML += `
                <p style="color: #94a3b8; font-size: 0.95rem; margin: 16px 0 8px 0; line-height: 1.6;">
                    غداً ستتمكن من رؤية إحصائيات هذا اليوم.
                </p>
                <button id="dailySummaryCloseBtn" style="
                    margin-top: 16px;
                    background: #eef2f6;
                    border: none;
                    padding: 10px 28px;
                    border-radius: 40px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: #1e293b;
                    cursor: pointer;
                    transition: all 0.2s;
                ">حسناً</button>
            `;
        } else {
            const categories = classifyScores(results);
            contentHTML += `
                <p style="color: #64748b; font-size: 0.85rem; margin: 4px 0 14px 0;">
                    أداؤك أمس (${getYesterdayDate()})
                </p>
                <div id="dailySummaryChart" style="margin: 6px 0 8px 0;"></div>
                <div id="dailySummaryExamList"></div>
                <button id="dailySummaryCloseBtn" style="
                    margin-top: 16px;
                    background: #eef2f6;
                    border: none;
                    padding: 10px 28px;
                    border-radius: 40px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: #1e293b;
                    cursor: pointer;
                    transition: all 0.2s;
                ">حسناً</button>
            `;
        }

        modal.innerHTML = contentHTML;
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // رسم المخطط إذا وجدت بيانات
        if (hasData) {
            const chartContainer = document.getElementById('dailySummaryChart');
            const categories = classifyScores(results);
            renderChart(categories, chartContainer);
            const listContainer = document.getElementById('dailySummaryExamList');
            renderExamList(categories, listContainer);
        }

        // ربط زر الإغلاق
        const closeBtn = document.getElementById('dailySummaryCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        // إغلاق عند النقر خارج النافذة
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeModal();
        });

        // إغلاق عند الضغط على ESC
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    function closeModal() {
        if (overlay) {
            overlay.remove();
            overlay = null;
            modal = null;
        }
        // تخزين التاريخ الحالي حتى لا تظهر النافذة مرة أخرى اليوم
        localStorage.setItem(STORAGE_LAST_DATE, getTodayDate());
    }

    // ===== التحقق مما إذا كانت النافذة يجب أن تظهر =====
    function shouldShowModal() {
        const today = getTodayDate();
        const lastDate = localStorage.getItem(STORAGE_LAST_DATE);
        // إذا لم يظهر اليوم، نظهرها
        if (lastDate !== today) {
            return true;
        }
        return false;
    }

    // ===== تهيئة النظام =====
    function init() {
        if (!shouldShowModal()) return;

        // تأخير بسيط حتى يتم تحميل الصفحة بالكامل
        setTimeout(() => {
            createModal();
        }, 800);
    }

    // ===== بدء التشغيل عند تحميل الصفحة =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ===== إضافة أنماط للتحريك (في حال عدم وجودها) =====
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.92); }
            to { opacity: 1; transform: scale(1); }
        }
    `;
    document.head.appendChild(style);

    console.log('✅ dailySummary.js تم تحميله بنجاح');

})();
