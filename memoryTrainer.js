class MemoryTrainer{constructor(){this.questions=[],this.allQuestions=[],this.sharedOptions=[],this.trainingQueue=[],this.wrongQuestions=[],this.currentIndex=0,this.isActive=!1,this.isReviewMode=!1,this.isFromList=!1,this.examType="hoeren",this.currentCorrectText="",this.currentCorrectIndex=-1,this.currentOptions=[],this.currentQuestionIndex=0,this.currentExamId=1,this.currentQuestionObj=null,this.attempts=0,this.correctAttempts=0,this.totalQuestions=0,this.overlay=null,this.card=null,this.timer=null,this.isAnswered=!1,this.isCardReady=!1,this.TOTAL_OPTIONS=3,this.WRONG_OPTIONS=2,this.LEVELS_KEY="memory_levels",this.MAX_LEVEL=5,this.currentSkill="hoeren1",this.currentExamId=1,this._sharedOptionsCache={}}async getUserStatus(){try{return typeof window.getUserStatusGlobal=="function"?await window.getUserStatusGlobal():typeof window.getUserStatusForExam=="function"?await window.getUserStatusForExam():"free"}catch(t){return console.warn("⚠️ فشل جلب حالة المستخدم:",t),"free"}}async start(t="single"){console.log(`🧠 بدء Memory Trainer V4 (المهارة: ${this.currentSkill}, الوضع: ${t})...`);let e=null;if(this.isFromList=!1,this.sharedOptions=[],t==="list"){const s=`_${this.currentSkill}_combinedData`;if(window[s])e=window[s],this.isFromList=!0,console.log(`📚 تدريب من قائمة ${this.currentSkill} (المرحلة ${e.currentStage||1})`),e.sharedOptions&&(this.sharedOptions=e.sharedOptions),this.examType=e.examType||"hoeren",this.currentSkill==="lesen1"||this.currentSkill==="lesen3"?this.examType="matching":this.currentSkill==="lesen2"?this.examType="multiple":this.currentSkill==="sprach1"?this.examType="sprach1":this.currentSkill==="sprach2"&&(this.examType="sprach2");else if(typeof window.loadStageExams=="function"){window.loadStageExams(this.currentSkill).then(()=>{window[s]?this.start(t):this.showNotAvailable(`لم يتم تحميل بيانات ${this.currentSkill} بعد`)});return}else{this.showNotAvailable(`لم يتم تحميل بيانات ${this.currentSkill} بعد`);return}}else if(e=window.currentExamData||window._currentExamData,e)this.currentSkill=window.currentSkill||"hoeren1",this.currentExamId=window.currentExamId||1,console.log(`📖 تدريب من امتحان فردي: ${this.currentSkill} exam${this.currentExamId}`),e.sharedOptions&&(this.sharedOptions=e.sharedOptions),this.examType=e.type||"hoeren",this.currentSkill==="lesen1"||this.currentSkill==="lesen3"?this.examType="matching":this.currentSkill==="lesen2"?this.examType="multiple":this.currentSkill==="sprach1"?this.examType="sprach1":this.currentSkill==="sprach2"&&(this.examType="sprach2");else{this.showNotAvailable("لا توجد بيانات امتحان");return}if(!e){this.showNotAvailable("لا توجد بيانات امتحان");return}let i=[];if(this.isFromList)i=e.allQuestions||[],this.currentSkill==="lesen1"||this.currentSkill==="lesen2"||this.currentSkill==="lesen3"||this.currentSkill==="sprach1"||this.currentSkill==="sprach2"?this.questions=i:this.questions=i.filter(s=>s.correct===!0);else{let s=[];this.currentSkill==="sprach1"||this.currentSkill==="sprach2"?(e.options&&Array.isArray(e.options)?s=e.options:e.questions&&Array.isArray(e.questions)?s=e.questions:s=[],s=s.filter(r=>r.memoryHighlight)):this.currentSkill==="lesen3"&&e.items?(s=e.items,e.situations&&!this.sharedOptions.length&&(this.sharedOptions=e.situations)):s=e.questions||[],i=s.map((r,n)=>{let o="",a="",l="",c=0;return(this.currentSkill==="sprach1"||this.currentSkill==="sprach2")&&r.memoryHighlight&&(o=r.memoryHighlight.before||"",l=r.memoryHighlight.connector||"",a=r.memoryHighlight.after||"",c=0),{text:r.text||"",correct:r.correct,options:r.options||[],examId:this.currentExamId,questionIndex:n,originalQuestion:r,memoryHighlight:r.memoryHighlight||null,id:r.id,before:o,connector:l,after:a,color:c}}),this.currentSkill==="lesen1"||this.currentSkill==="lesen2"||this.currentSkill==="lesen3"||this.currentSkill==="sprach1"||this.currentSkill==="sprach2"?this.questions=i:this.questions=i.filter(r=>r.correct===!0)}if(this.isFromList&&(this.currentSkill==="lesen1"||this.currentSkill==="lesen3")){const s=[...new Set(i.map(r=>r.examId))];for(const r of s)if(!this._sharedOptionsCache[r])try{const n=await window.loadExamFromFile(this.currentSkill,r);n&&n.sharedOptions?(this._sharedOptionsCache[r]=n.sharedOptions,console.log(`✅ تم تحميل sharedOptions للامتحان ${r} (${n.sharedOptions.length} عنوان)`)):(this._sharedOptionsCache[r]=[],console.warn(`⚠️ لا يوجد sharedOptions للامتحان ${r}`))}catch(n){this._sharedOptionsCache[r]=[],console.warn(`⚠️ فشل تحميل الامتحان ${r}`,n)}i=i.map(r=>(r.sharedOptions=this._sharedOptionsCache[r.examId]||[],r)),this.questions=i,i.length>0&&i[0].sharedOptions&&(this.sharedOptions=i[0].sharedOptions)}if(this.allQuestions=i,(this.currentSkill==="lesen1"||this.currentSkill==="lesen3")&&this.sharedOptions.length===0&&i.length>0&&console.warn(`⚠️ لم يتم العثور على sharedOptions لـ ${this.currentSkill}، قد لا تعمل الخيارات بشكل صحيح.`),this.questions.length===0){this.showNotAvailable("لا توجد إجابات صحيحة في هذا الامتحان");return}if(this.currentSkill==="lesen3"&&this.sharedOptions.length>0){const s=this.questions.length;this.questions=this.questions.filter(n=>n.correct!==null&&n.correct!==void 0&&typeof n.correct=="number"&&n.correct>=0&&n.correct<this.sharedOptions.length);const r=this.questions.length;r<s&&console.log(`🔍 Lesen 3: تم استبعاد ${s-r} فقرة غير صالحة (correct == null أو خارج النطاق)، بقي ${r} فقرة للتدريب`)}if(this.buildTrainingQueue(),this.trainingQueue.length===0){this.showNotAvailable("لا توجد جمل للتدريب");return}this.isActive=!0,this.isReviewMode=!1,this.currentIndex=0,this.attempts=0,this.correctAttempts=0,this.wrongQuestions=[],this.totalQuestions=this.trainingQueue.length,this.isCardReady=!1,this.createOverlay(),this.createCardStructure(),this.isFromList?this.showIntroCardList():this.showIntroCardSingle()}createOverlay(){this.overlay&&this.overlay.remove(),this.overlay=document.createElement("div"),this.overlay.className="memory-trainer-overlay",this.overlay.addEventListener("click",t=>{if(t.target===this.overlay){if(this.currentIndex>=this.trainingQueue.length&&this.isActive){this.wrongQuestions.length>0?this.showPhaseComplete():this.showResults();return}this.close()}}),document.body.appendChild(this.overlay)}createCardStructure(){this.overlay||(console.warn("⚠️ createCardStructure: overlay غير موجود، يتم إنشاؤه تلقائياً"),this.createOverlay());const t=this.overlay.querySelector(".memory-trainer-card-container");t&&t.remove(),this.card=document.createElement("div"),this.card.className="memory-trainer-card-container",this.card.style.cssText=`
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: memorySlideUp 0.15s ease;
        `,this.overlay.appendChild(this.card),this.isCardReady=!0}updateCard(t){(!this.isCardReady||!this.card)&&this.createCardStructure(),this.card.innerHTML=t}buildTrainingQueue(){const t=this.questions.map(r=>r),e=Math.ceil(t.length/2),i=this.shuffleArray([...t]),s=[];for(let r=0;r<Math.min(e,i.length);r++)s.push(i[r]);this.trainingQueue=this.shuffleArray([...t,...s]),console.log(`📊 قائمة التدريب: ${this.trainingQueue.length} جملة (${this.isFromList?"مرحلة":"امتحان فردي"})`)}buildSentenceId(t,e,i){return window.buildSentenceId?window.buildSentenceId(t,e,i):`${t}_exam${e}_${i}`}getSentenceLevel(t){const e=JSON.parse(localStorage.getItem(this.LEVELS_KEY)||"{}");return e[t]!==void 0?e[t]:0}setSentenceLevel(t,e){const i=JSON.parse(localStorage.getItem(this.LEVELS_KEY)||"{}");let s=Math.max(0,Math.min(this.MAX_LEVEL,e));i[t]=s,localStorage.setItem(this.LEVELS_KEY,JSON.stringify(i))}increaseLevel(t){const e=this.getSentenceLevel(t);if(e<this.MAX_LEVEL){const i=e+1;this.setSentenceLevel(t,i),console.log(`⬆️ زيادة مستوى ${t} -> ${i}`)}}decreaseLevel(t){const e=this.getSentenceLevel(t);if(e>0){const i=e-1;this.setSentenceLevel(t,i),console.log(`⬇️ إنقاص مستوى ${t} -> ${i}`)}}getExamProgress(t,e){if(window.getExamProgress)return window.getExamProgress(t,e);const i=`${t}_exam${e}_`,s=JSON.parse(localStorage.getItem(this.LEVELS_KEY)||"{}");let r=0,n=0;for(const o in s)o.startsWith(i)&&(r+=s[o],n++);return n===0?0:Math.min(100,Math.round(r/(n*this.MAX_LEVEL)*100))}getOverallProgressForSkill(t){return window.getOverallProgress?window.getOverallProgress.length===1?window.getOverallProgress(t):window.getOverallProgress():0}getStageProgressForSkill(t){return window.getStageProgress?window.getStageProgress(t):0}generateOptions(t,e){const i=[t];let s=0;if(this.examType==="matching"&&this.sharedOptions&&this.sharedOptions.length>0){const o=e.correct,a=this.sharedOptions[o],l=this.sharedOptions.filter((h,x)=>x!==o),d=this.shuffleArray([...l]).slice(0,2),p=[a,...d];for(;p.length<3;){const h=this.sharedOptions[Math.floor(Math.random()*this.sharedOptions.length)];p.includes(h)||p.push(h)}return this.shuffleArray(p)}const r=this.allQuestions.filter(o=>o.text!==t).map(o=>o.text);let n=this.shuffleArray([...r]);for(let o=0;o<n.length&&s<this.WRONG_OPTIONS;o++){const a=n[o];!i.includes(a)&&a.trim()!==""&&(i.push(a),s++)}for(;i.length<this.TOTAL_OPTIONS;)console.warn("⚠️ لم يتم العثور على جمل خاطئة كافية، نضيف جملة وهمية مؤقتة"),i.push(`جملة ${i.length+1}`);return this.shuffleArray(i)}showIntroCardSingle(){const t=this.getExamProgress(this.currentSkill,this.currentExamId);let e=`امتحان ${this.currentExamId}`;this.examType==="matching"?this.currentSkill==="lesen3"?e=`امتحان ${this.currentExamId} (Lesen 3)`:e=`امتحان ${this.currentExamId} (Lesen 1)`:this.examType==="multiple"?e=`امتحان ${this.currentExamId} (Lesen 2)`:this.examType==="sprach1"?e=`امتحان ${this.currentExamId} (Sprachbausteine 1)`:this.examType==="sprach2"&&(e=`امتحان ${this.currentExamId} (Sprachbausteine 2)`),this.updateCard(`
            <div class="memory-trainer-intro">
                <div class="memory-trainer-icon">🧩</div>
                <h2>استدعاء ذكي</h2>
                <p style="font-size:14px;color:#334155;margin:6px 0 2px 0;">تدريب ${e}.</p>
                <p style="font-size:13px;color:#64748B;margin:2px 0 14px 0;">${this.examType==="multiple"?"سترى السؤال مرة واحدة، ثم سنطلب منك اختيار الجواب الصحيح.":this.examType==="sprach1"||this.examType==="sprach2"?"سترى الجملة مع الفراغ، ثم سنطلب منك اختيار الكلمة المناسبة.":"سترى النص مرة واحدة، ثم سنطلب منك اختيار العنوان المناسب."}</p>
                <div style="margin:4px 0 14px 0;background:#FFFFFF;border:1px solid #E8EEF5;border-radius:6px;padding:4px 10px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="flex:1;height:5px;background:#e9eef5;border-radius:6px;overflow:hidden;">
                            <div style="width:${t}%;height:100%;background:linear-gradient(90deg,#1565C0,#38bdf8);border-radius:6px;"></div>
                        </div>
                        <span style="font-size:12px;font-weight:600;color:#1565C0;">${t}%</span>
                    </div>
                </div>
                <button class="memory-trainer-btn primary" onclick="window.memoryTrainer.showMemoryCard()">ابدأ</button>
            </div>
        `)}showIntroCardList(){this.getUserStatus().then(t=>{const e=t==="premium",i=this.getOverallProgressForSkill(this.currentSkill),s=this.trainingQueue.length;let r=1,n=1;window.getCurrentStage&&window.getTotalStages&&(r=window.getCurrentStage(this.currentSkill),n=window.getTotalStages(this.currentSkill));let o=this.currentSkill;this.examType==="matching"?this.currentSkill==="lesen3"?o="Lesen 3":o="Lesen 1":this.examType==="multiple"?o="Lesen 2":this.examType==="sprach1"?o="Sprachbausteine 1":this.examType==="sprach2"&&(o="Sprachbausteine 2");let a="";e?a='<button class="memory-trainer-btn primary" onclick="window.memoryTrainer.showMemoryCard()">ابدأ التدريب</button>':a=`
                    <button class="memory-trainer-btn locked" onclick="window.location.href='subscribe.html'" style="
                        padding: 8px 20px;
                        border: none;
                        border-radius: 10px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.15s ease;
                        margin-top: 12px;
                        background: #64748B;
                        color: #cbd5e1;
                        box-shadow: none;
                        display: inline-block;
                        width: auto;
                        opacity: 0.7;
                    "
                    onmouseover="this.style.opacity='0.9'"
                    onmouseout="this.style.opacity='0.7'"
                    >
                        🔒 متاح للحساب الكامل
                    </button>
                `,this.updateCard(`
                <div class="memory-trainer-intro">
                    <h2>استدعاء متقدم 🧩</h2>
                    <p style="font-size:14px;color:#334155;margin:4px 0 2px 0;">هاد الميزة غدي تخليك تتدرب على جميع أسئلة امتحانات المرحلة ${r} من ${o}.</p>
                    <p style="font-size:13px;color:#64748B;margin:2px 0 12px 0;">كلما تدربت أكثر، أصبح النظام أكثر ذكاءً في اختيار الأسئلة.</p>
                    <div style="margin:10px 0 14px 0;background:#FFFFFF;border:1px solid #E8EEF5;border-radius:6px;padding:6px 10px;text-align:left;">
                        <div style="display:flex;align-items:center;gap:10px;">
                            <div style="flex:1;height:5px;background:#e9eef5;border-radius:6px;overflow:hidden;">
                                <div style="width:${i}%;height:100%;background:linear-gradient(90deg,#1565C0,#38bdf8);border-radius:6px;"></div>
                            </div>
                            <span style="font-size:13px;font-weight:600;color:#1565C0;min-width:40px;text-align:right;">${i}%</span>
                        </div>
                    </div>
                    <p style="font-size:12px;color:#94A3B8;margin:4px 0 4px 0;">${s} نص للتدريب</p>
                    <p style="font-size:11px;color:#94A3B8;margin:0 0 12px 0;">المرحلة ${r} / ${n}</p>
                    ${a}
                </div>
            `)}).catch(()=>{this.updateCard(`
                <div class="memory-trainer-intro">
                    <h2>استدعاء متقدم 🧩</h2>
                    <p style="font-size:14px;color:#334155;margin:4px 0 2px 0;">هاد الميزة غدي تخليك تتدرب على جميع أسئلة امتحانات المرحلة.</p>
                    <p style="font-size:13px;color:#64748B;margin:2px 0 12px 0;">كلما تدربت أكثر، أصبح النظام أكثر ذكاءً في اختيار الأسئلة.</p>
                    <div style="margin:10px 0 14px 0;background:#FFFFFF;border:1px solid #E8EEF5;border-radius:6px;padding:6px 10px;text-align:left;">
                        <div style="display:flex;align-items:center;gap:10px;">
                            <div style="flex:1;height:5px;background:#e9eef5;border-radius:6px;overflow:hidden;">
                                <div style="width:0%;height:100%;background:linear-gradient(90deg,#1565C0,#38bdf8);border-radius:6px;"></div>
                            </div>
                            <span style="font-size:13px;font-weight:600;color:#1565C0;min-width:40px;text-align:right;">0%</span>
                        </div>
                    </div>
                    <p style="font-size:12px;color:#94A3B8;margin:4px 0 4px 0;">جاري التحميل...</p>
                    <button class="memory-trainer-btn locked" onclick="window.location.href='subscribe.html'" style="padding:8px 20px;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;margin-top:12px;background:#64748B;color:#cbd5e1;opacity:0.7;">🔒 متاح للحساب الكامل</button>
                </div>
            `)})}showMemoryCard(){if(this.clearTimer(),this.isAnswered=!1,this.currentIndex>=this.trainingQueue.length){this.showPhaseComplete();return}const t=this.trainingQueue[this.currentIndex],e=t.text;this.currentCorrectText=e,this.currentExamId=t.examId,this.currentQuestionIndex=t.questionIndex,this.currentQuestionObj=t,this.currentCorrectIndex=t.correct;let i="",s="";if(this.examType==="matching"){const r=this.currentQuestionObj.sharedOptions||this.sharedOptions,n=this.currentQuestionObj.correct,o=r[n]||"",a=o.match(/^[a-zA-Z][\.\)]\s*/)?o.match(/^[a-zA-Z][\.\)]\s*/)[0]:"",l=o.replace(/^[a-zA-Z][\.\)]\s*/,"");i=`
                <div class="memory-trainer-card" style="
                    background: #FFFFFF;
                    border: 1px solid #E8EEF5;
                    border-radius: 12px;
                    padding: 20px 24px;
                    max-width: 440px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
                    position: relative;
                ">
                    <div class="memory-trainer-header" style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 10px;
                        padding-bottom: 8px;
                        border-bottom: 1px solid #F1F5F9;
                    ">
                        <span class="memory-trainer-progress" style="
                            font-size: 12px;
                            color: #94A3B8;
                            font-weight: 500;
                        ">
                            ${this.currentIndex+1}/${this.trainingQueue.length}
                        </span>
                        <span class="memory-trainer-focus" style="
                            font-size: 13px;
                            font-weight: 600;
                            color: #2D6A4F;
                        ">
                            🍃 خذ وقتك
                        </span>
                    </div>

                    <div class="memory-trainer-content">
                        <p class="memory-trainer-hint" style="
                            font-size: 14px;
                            color: #4A7C59;
                            margin-bottom: 8px;
                            text-align: center;
                        ">
                           🌿 اقرأ الفقرة جيداً، سأطلب منك اختيار الحالة المناسبة.
                        </p>

                        <!-- صندوق القراءة الخاص بـ Lesen 1 و Lesen 3 -->
                        <div class="memory-reading-box" style="
                            width: 100%;
                            height: 160px;
                            overflow-y: auto;
                            padding: 12px 16px;
                            background: #F8FAFC;
                            border: 1px solid #EDF2F7;
                            border-radius: 10px;
                            text-align: left;
                            direction: rtl;
                            font-size: 15px;
                            line-height: 1.8;
                            font-weight: 400;
                            color: #1a202c;
                            box-sizing: border-box;
                            margin: 8px 0 12px 0;
                        ">
                            ${e}
                        </div>

                        <!-- العنوان كسطر عادي -->
                        <div style="
                            text-align: right;
                            font-size: 15px;
                            font-weight: 500;
                            color: #1a5a1a;
                            padding: 2px 4px;
                            direction: rtl;
                            margin-top: 0;
                        ">
                            ✅ ${a}${l}
                        </div>
                    </div>

                    <button class="memory-trainer-btn primary" onclick="window.memoryTrainer.readyToRecall()" style="
                        padding: 8px 20px;
                        border: none;
                        border-radius: 10px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.15s ease;
                        margin-top: 10px;
                        background: #1565C0;
                        color: white;
                        box-shadow: 0 2px 6px rgba(21, 101, 192, 0.15);
                        display: inline-block;
                        width: auto;
                    ">
                        أنا جاهز
                    </button>
                </div>
            `}else if(this.examType==="multiple"){const r=this.currentQuestionObj.questionIndex!==void 0?this.currentQuestionObj.questionIndex+1:this.currentIndex+1;let o=this.currentQuestionObj.options&&this.currentQuestionObj.options.length>0?this.currentQuestionObj.options[this.currentQuestionObj.correct]:"";/^[a-zA-Z][\.\)]\s*/.test(o)&&(o=o.replace(/^[a-zA-Z][\.\)]\s*/,""));const a=`${r}:${e}:

         a. ${o}`;i=`
                <div class="memory-trainer-card" style="
                    background: #FFFFFF;
                    border: 1px solid #E8EEF5;
                    border-radius: 12px;
                    padding: 20px 24px;
                    max-width: 440px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
                    position: relative;
                ">
                    <div class="memory-trainer-header" style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 10px;
                        padding-bottom: 8px;
                        border-bottom: 1px solid #F1F5F9;
                    ">
                        <span class="memory-trainer-progress" style="
                            font-size: 12px;
                            color: #94A3B8;
                            font-weight: 500;
                        ">
                            ${this.currentIndex+1}/${this.trainingQueue.length}
                        </span>
                        <span class="memory-trainer-focus" style="
                            font-size: 13px;
                            font-weight: 600;
                            color: #2D6A4F;
                        ">
                            🍃 خذ وقتك
                        </span>
                    </div>

                    <div class="memory-trainer-content">
                        <p class="memory-trainer-hint" style="
                            font-size: 14px;
                            color: #4A7C59;
                            margin-bottom: 8px;
                            text-align: center;
                        ">
                            🌿 اقرأ السؤال جيداً، سأطلب منك اختيار الجواب الصحيح.
                        </p>

                       <div style="
    text-align: left;
    font-size: 16px;
    font-weight: 500;
    color: #1a5a1a;
    padding: 6px 12px;
    padding-left: 30px;
    margin-top: 0;
    background: transparent;
    border-radius: 6px;
">
    ✅ ${o}
</div>
                    </div>

                    <button class="memory-trainer-btn primary" onclick="window.memoryTrainer.readyToRecall()" style="
                        padding: 8px 20px;
                        border: none;
                        border-radius: 10px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.15s ease;
                        margin-top: 10px;
                        background: #1565C0;
                        color: white;
                        box-shadow: 0 2px 6px rgba(21, 101, 192, 0.15);
                        display: inline-block;
                        width: auto;
                    ">
                        أنا جاهز
                    </button>
                </div>
            `}else if(this.examType==="sprach1"){const r=this.currentQuestionObj,n=r.memoryHighlight||{},o=r.id||this.currentQuestionIndex+1,a=n.before||"",l=n.connector||"",c=n.after||"";i=`
                <div class="memory-trainer-card" style="
                    background: #FFFFFF;
                    border: 1px solid #E8EEF5;
                    border-radius: 12px;
                    padding: 20px 24px;
                    max-width: 440px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
                    position: relative;
                    transition: background 0.3s ease;
                ">
                    <div class="memory-trainer-header" style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 10px;
                        padding-bottom: 8px;
                        border-bottom: 1px solid rgba(0,0,0,0.06);
                    ">
                        <span class="memory-trainer-progress" style="
                            font-size: 12px;
                            color: #94A3B8;
                            font-weight: 500;
                        ">
                            ${this.currentIndex+1}/${this.trainingQueue.length}
                        </span>
                        <span class="memory-trainer-focus" style="
                            font-size: 13px;
                            font-weight: 600;
                            color: #2D6A4F;
                        ">
                            🍃 خذ وقتك
                        </span>
                    </div>

                    <div class="memory-trainer-content">
                        <p class="memory-trainer-hint" style="
                            font-size: 14px;
                            color: #4A7C59;
                            margin-bottom: 12px;
                            text-align: center;
                        ">
                            🌿 اختر الكلمة المناسبة للفراغ.
                        </p>

                      <!-- صندوق القراءة الخاص بـ Sprachbausteine 1 -->
<div class="memory-reading-box" style="
    width: 100%;
    height: 80px;
    overflow-y: auto;
    padding: 12px 16px;
    background: #F8FAFC;
    border: 1px solid #EDF2F7;
    border-radius: 10px;
    text-align: left;
    direction: rtl;
    font-size: 17px;
    line-height: 1.8;
    font-weight: 400;
    color: #1a202c;
    box-sizing: border-box;
    margin: 8px 0 12px 0;
">
    ${a} <span style="font-weight:700;color:#1565C0;background:#E3F2FD;padding:0 6px;border-radius:4px;">[${o}]</span> ${c}
</div>

                        <!-- الإجابة الصحيحة -->
<div style="
    text-align: left;
    font-size: 16px;
    font-weight: 500;
    color: #1a5a1a;
    padding: 6px 12px;
    padding-left: 20px;
    margin-top: 0;
    background: transparent;
    border-radius: 6px;
">
    ✅ ${l}
</div>
                    </div>

                    <button class="memory-trainer-btn primary" onclick="window.memoryTrainer.readyToRecall()" style="
                        padding: 8px 20px;
                        border: none;
                        border-radius: 10px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.15s ease;
                        margin-top: 12px;
                        background: #1565C0;
                        color: white;
                        box-shadow: 0 2px 6px rgba(21, 101, 192, 0.15);
                        display: inline-block;
                        width: auto;
                    ">
                        أنا جاهز
                    </button>
                </div>
            `}else if(this.examType==="sprach2"){const r=this.currentQuestionObj,n=r.memoryHighlight||{},o=r.id||this.currentQuestionIndex+1,a=n.before||"",l=n.connector||"",c=n.after||"";i=`
                <div class="memory-trainer-card" style="
                    background: #FFFFFF;
                    border: 1px solid #E8EEF5;
                    border-radius: 12px;
                    padding: 20px 24px;
                    max-width: 440px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
                    position: relative;
                    transition: background 0.3s ease;
                ">
                    <div class="memory-trainer-header" style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 10px;
                        padding-bottom: 8px;
                        border-bottom: 1px solid rgba(0,0,0,0.06);
                    ">
                        <span class="memory-trainer-progress" style="
                            font-size: 12px;
                            color: #94A3B8;
                            font-weight: 500;
                        ">
                            ${this.currentIndex+1}/${this.trainingQueue.length}
                        </span>
                        <span class="memory-trainer-focus" style="
                            font-size: 13px;
                            font-weight: 600;
                            color: #2D6A4F;
                        ">
                            🍃 خذ وقتك
                        </span>
                    </div>

                    <div class="memory-trainer-content">
                        <p class="memory-trainer-hint" style="
                            font-size: 14px;
                            color: #4A7C59;
                            margin-bottom: 12px;
                            text-align: center;
                        ">
                            🌿 اختر الكلمة المناسبة للفراغ.
                        </p>

                        <!-- صندوق القراءة الخاص بـ Sprachbausteine 2 -->
                        <div class="memory-reading-box" style="
                            width: 100%;
                            height: 80px;
                            overflow-y: auto;
                            padding: 12px 16px;
                            background: #F8FAFC;
                            border: 1px solid #EDF2F7;
                            border-radius: 10px;
                            text-align: left;
                            direction: rtl;
                            font-size: 17px;
                            line-height: 1.8;
                            font-weight: 400;
                            color: #1a202c;
                            box-sizing: border-box;
                            margin: 8px 0 12px 0;
                        ">
                            ${a} <span style="font-weight:700;color:#1565C0;background:#E3F2FD;padding:0 6px;border-radius:4px;">[${o}]</span> ${c}
                        </div>

                        <!-- الإجابة الصحيحة -->
                        <div style="
                            text-align: left;
                            font-size: 16px;
                            font-weight: 500;
                            color: #1a5a1a;
                            padding: 6px 12px;
                            padding-left: 20px;
                            margin-top: 0;
                            background: transparent;
                            border-radius: 6px;
                        ">
                            ✅ ${l}
                        </div>
                    </div>

                    <button class="memory-trainer-btn primary" onclick="window.memoryTrainer.readyToRecall()" style="
                        padding: 8px 20px;
                        border: none;
                        border-radius: 10px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.15s ease;
                        margin-top: 12px;
                        background: #1565C0;
                        color: white;
                        box-shadow: 0 2px 6px rgba(21, 101, 192, 0.15);
                        display: inline-block;
                        width: auto;
                    ">
                        أنا جاهز
                    </button>
                </div>
            `}else i=`
                <div class="memory-trainer-card">
                    <div class="memory-trainer-header">
                        <span class="memory-trainer-progress">${this.currentIndex+1}/${this.trainingQueue.length}</span>
                        <span class="memory-trainer-focus">🍃 خذ وقتك</span>
                    </div>
                    <div class="memory-trainer-content">
                        <p class="memory-trainer-hint">🌿 سأطلب منك هذه الجملة بعد قليل.</p>
                        <div class="memory-trainer-answer">
                            <span>${e}</span>
                        </div>
                    </div>
                    <button class="memory-trainer-btn primary" onclick="window.memoryTrainer.readyToRecall()">أنا جاهز</button>
                </div>
            `;this.updateCard(i)}readyToRecall(){if(this.clearTimer(),this.examType==="matching"){const s=this.currentQuestionObj.sharedOptions||this.sharedOptions,r=this.currentQuestionObj.correct,n=s[r],o=s.filter((a,l)=>l!==r).sort(()=>Math.random()-.5).slice(0,2);for(;o.length<2;){const a=s[Math.floor(Math.random()*s.length)];!o.includes(a)&&a!==n&&o.push(a)}this.currentOptions=this.shuffleArray([n,...o])}else if(this.examType==="multiple")this.currentOptions=this.currentQuestionObj.options||[],this.currentOptions.length===0&&(console.warn("⚠️ لا توجد خيارات في السؤال، نستخدم generateOptions كحل احتياطي"),this.currentOptions=this.generateOptions(this.currentCorrectText,this.currentQuestionObj));else if(this.examType==="sprach1")this.currentOptions=this.currentQuestionObj.options||[],this.currentOptions.length===0&&(console.warn("⚠️ لا توجد خيارات في السؤال، نستخدم generateOptions كحل احتياطي"),this.currentOptions=this.generateOptions(this.currentCorrectText,this.currentQuestionObj));else if(this.examType==="sprach2"){const s=this.currentQuestionObj.options||[],r=this.currentQuestionObj.connector||this.currentQuestionObj.correct,n=s.filter(o=>o!==r).sort(()=>Math.random()-.5).slice(0,2);this.currentOptions=this.shuffleArray([r,...n])}else this.currentOptions=this.generateOptions(this.currentCorrectText,this.currentQuestionObj);let t="",e="",i="";if(this.examType==="matching")t=this.currentSkill==="lesen3"?"اختر الحالة المناسبة للفقرة التي قرأتها:":"اختر العنوان المناسب للنص الذي قرأته:";else if(this.examType==="multiple")t="ما الاختيار الصحيح؟",e=`
                <div style="font-size:17px; font-weight:500; text-align:left; padding:12px 0; color:#1a202c; margin-bottom:16px;">
                    ${this.currentQuestionObj.questionIndex!==void 0?this.currentQuestionObj.questionIndex+1:this.currentIndex+1}. ${this.currentCorrectText}:
                </div>
            `;else if(this.examType==="sprach1"){t="اختر الكلمة الصحيحة:";const s=this.currentQuestionObj,r=s.memoryHighlight||{},n=s.id||this.currentQuestionIndex+1,o=r.before||"",a=r.after||"";e=`
                <div style="
                    font-size: 18px;
                    font-weight: 500;
                    text-align: left;
                    padding: 16px 12px;
                    color: #1a202c;
                    margin: 4px 0 16px 0;
                    line-height: 1.8;
                    background: rgba(255,255,255,0.5);
                    border-radius: 8px;
                ">
                    ${o} <span style="font-weight:700;color:#1565C0;background:#E3F2FD;padding:0 6px;border-radius:4px;">[${n}]</span> ${a}
                </div>
            `}else if(this.examType==="sprach2"){t="اختر الكلمة الصحيحة:";const s=this.currentQuestionObj,r=s.memoryHighlight||{},n=s.id||this.currentQuestionIndex+1,o=r.before||"",a=r.after||"";e=`
                <div style="
                    font-size: 18px;
                    font-weight: 500;
                    text-align: left;
                    padding: 16px 12px;
                    color: #1a202c;
                    margin: 4px 0 16px 0;
                    line-height: 1.8;
                    background: rgba(255,255,255,0.5);
                    border-radius: 8px;
                ">
                    ${o} <span style="font-weight:700;color:#1565C0;background:#E3F2FD;padding:0 6px;border-radius:4px;">[${n}]</span> ${a}
                </div>
            `}else t="ما هي الجملة التي رأيتها قبل قليل؟";if(this.examType==="matching"&&this.isFromList){const s=this.currentCorrectText,r=this.currentOptions.map((n,o)=>`
                <button class="memory-trainer-option" data-index="${o}" onclick="window.memoryTrainer.checkAnswer(${o})" style="
                    background: #FFFFFF;
                    border: 1.5px solid #E8EEF5;
                    border-radius: 10px;
                    padding: 9px 14px;
                    font-size: 14px;
                    font-weight: 500;
                    color: #334155;
                    cursor: pointer;
                    text-align: left;
                    transition: background-color 0.08s ease, border-color 0.08s ease, box-shadow 0.08s ease, transform 0.08s ease;
                    transform: translateY(0);
                    box-shadow: none;
                "
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 10px rgba(0,0,0,0.08)'; this.style.borderColor='#2c3e66';"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'; this.style.borderColor='#E8EEF5';"
                >
                    ${String.fromCharCode(65+o)}. ${n}
                </button>
            `).join("");i=`
                <div class="memory-trainer-recall" style="
                    background: #FFFFFF;
                    border: 1px solid #E8EEF5;
                    border-radius: 12px;
                    padding: 20px 24px;
                    max-width: 440px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
                    position: relative;
                ">
                    <div class="memory-trainer-header" style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 10px;
                        padding-bottom: 8px;
                        border-bottom: 1px solid #F1F5F9;
                    ">
                        <span class="memory-trainer-progress" style="
                            font-size: 12px;
                            color: #94A3B8;
                            font-weight: 500;
                        ">
                            ${this.currentIndex+1}/${this.trainingQueue.length}
                        </span>
                        <span class="memory-trainer-focus" style="
                            font-size: 13px;
                            font-weight: 600;
                            color: #2D6A4F;
                        ">
                            🍃 اختر العنوان
                        </span>
                    </div>
                    <div class="memory-trainer-content">
                        <p class="memory-trainer-question" style="
                            font-size: 15px;
                            font-weight: 500;
                            color: #334155;
                            margin-bottom: 10px;
                        ">
                            ${t}
                        </p>
                        <!-- الفقرة تبقى ظاهرة -->
                        <div class="memory-reading-box" style="
                            width: 100%;
                            height: 160px;
                            overflow-y: auto;
                            padding: 12px 16px;
                            background: #F8FAFC;
                            border: 1px solid #EDF2F7;
                            border-radius: 10px;
                            text-align: left;
                            direction: rtl;
                            font-size: 15px;
                            line-height: 1.8;
                            font-weight: 400;
                            color: #1a202c;
                            box-sizing: border-box;
                            margin: 8px 0 12px 0;
                        ">
                            ${s}
                        </div>
                        <!-- الخيارات أسفل الفقرة -->
                        <div class="memory-trainer-options" style="
                            display: flex;
                            flex-direction: column;
                            gap: 6px;
                            margin: 8px 0;
                        ">
                            ${r}
                        </div>
                    </div>
                    <div id="memory-trainer-feedback"></div>
                </div>
            `}else i=`
                <div class="memory-trainer-recall" style="
                    background: #FFFFFF;
                    border: 1px solid #E8EEF5;
                    border-radius: 12px;
                    padding: 20px 24px;
                    max-width: 440px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
                    position: relative;
                ">
                    <div class="memory-trainer-header" style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 10px;
                        padding-bottom: 8px;
                        border-bottom: 1px solid #F1F5F9;
                    ">
                        <span class="memory-trainer-progress" style="
                            font-size: 12px;
                            color: #94A3B8;
                            font-weight: 500;
                        ">
                            ${this.currentIndex+1}/${this.trainingQueue.length}
                        </span>
                        <span class="memory-trainer-focus" style="
                            font-size: 13px;
                            font-weight: 600;
                            color: #2D6A4F;
                        ">
                            🍃 خذ وقتك
                        </span>
                    </div>
                    <div class="memory-trainer-content">
                        <p class="memory-trainer-question" style="
                            font-size: 15px;
                            font-weight: 500;
                            color: #334155;
                            margin-bottom: 10px;
                        ">
                            ${t}
                        </p>
                        ${e}
                        <div class="memory-trainer-options" style="
                            display: flex;
                            flex-direction: column;
                            gap: 6px;
                            margin: 8px 0;
                        ">
                           ${this.currentOptions.map((s,r)=>`
    <button class="memory-trainer-option" data-index="${r}" onclick="window.memoryTrainer.checkAnswer(${r})" style="
        background: #FFFFFF;
        border: 1.5px solid #E8EEF5;
        border-radius: 10px;
        padding: 9px 14px;
        font-size: 14px;
        font-weight: 500;
        color: #334155;
        cursor: pointer;
        text-align: left;
        transition: background-color 0.08s ease, border-color 0.08s ease, box-shadow 0.08s ease, transform 0.08s ease;
        transform: translateY(0);
        box-shadow: none;
    "
    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 10px rgba(0,0,0,0.08)'; this.style.borderColor='#2c3e66';"
    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'; this.style.borderColor='#E8EEF5';"
    >
        ${String.fromCharCode(65+r)}. ${s}
    </button>
`).join("")}
                        </div>
                    </div>
                    <div id="memory-trainer-feedback"></div>
                </div>
            `;this.updateCard(i)}checkAnswer(t){if(this.isAnswered)return;this.isAnswered=!0,this.attempts++;const e=this.currentOptions[t];let i=!1,s="";if(this.examType==="matching"){const d=this.currentQuestionObj.sharedOptions||this.sharedOptions,p=this.currentQuestionObj.correct,h=d[p];i=e===h,s=h}else if(this.examType==="multiple"){const d=this.currentQuestionObj.correct,p=this.currentOptions[d];i=e===p,s=p}else if(this.examType==="sprach1"){const d=this.currentQuestionObj.connector||this.currentQuestionObj.correct;i=e===d,s=d}else if(this.examType==="sprach2"){const d=this.currentQuestionObj.connector||this.currentQuestionObj.correct;i=e===d,s=d}else i=e===this.currentCorrectText,s=this.currentCorrectText;const r=this.currentSkill,n=this.currentExamId,o=this.currentQuestionIndex,a=this.buildSentenceId(r,n,o),l=document.querySelectorAll(".memory-trainer-option"),c=document.getElementById("memory-trainer-feedback");l.forEach(d=>{d.disabled=!0,d.style.opacity="0.7",d.style.cursor="default"}),i?(this.correctAttempts++,this.increaseLevel(a),l[t].style.borderColor="#28a745",l[t].style.backgroundColor="#d4edda",c.innerHTML='<button class="memory-trainer-btn primary small" onclick="window.memoryTrainer.nextQuestion()" style="padding:6px 16px; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; background:#28a745; color:white;">التالي →</button>'):(this.decreaseLevel(a),this.wrongQuestions.includes(this.currentQuestionObj)||this.wrongQuestions.push(this.currentQuestionObj),l[t].style.borderColor="#e67e22",l[t].style.backgroundColor="#fef0e0",l.forEach((d,p)=>{this.currentOptions[p]===s&&(d.style.borderColor="#28a745",d.style.backgroundColor="#d4edda")}),c.innerHTML=`
                <div style="display:flex;gap:10px;justify-content:center;margin-top:8px;">
                    <button class="memory-trainer-btn secondary small" onclick="window.memoryTrainer.retryQuestion()" style="padding:6px 16px; border:2px solid #e67e22; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; background:white; color:#e67e22;">🔄 إعادة المحاولة</button>
                    <button class="memory-trainer-btn primary small" onclick="window.memoryTrainer.nextQuestion()" style="padding:6px 16px; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; background:#1565C0; color:white;">التالي →</button>
                </div>
            `),this.isFromList&&this.updateProgressBar()}updateProgressBar(){const t=this.getOverallProgressForSkill(this.currentSkill),e=this.card?.querySelectorAll(".memory-progress-fill, .memory-trainer-progress-bar");e&&e.forEach(s=>{s.classList.contains("memory-progress-fill")&&(s.style.width=t+"%")});const i=this.card?.querySelector(".memory-progress-percent");i&&(i.textContent=t+"%")}retryQuestion(){this.isAnswered=!1,this.currentIndex--,this.nextQuestion()}nextQuestion(){this.currentIndex++,this.currentIndex<this.trainingQueue.length?this.showMemoryCard():this.showPhaseComplete()}showPhaseComplete(){this.clearTimer();const t=this.wrongQuestions.length,e=this.isFromList?this.getOverallProgressForSkill(this.currentSkill):0;if(t===0){this.showResults();return}this.updateCard(`
            <div class="memory-trainer-results phase-complete" style="
                background: #FFFDF5;
                border: 1px solid #FDE68A;
                border-radius: 12px;
                padding: 20px 24px;
                max-width: 440px;
                width: 90%;
                text-align: center;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
            ">
                <div class="memory-trainer-icon" style="font-size:26px; display:block; margin-bottom:4px;">🧠</div>
                <h2 style="color:#1565C0; font-size:17px; font-weight:600; margin-bottom:4px;">المرحلة الأولى انتهت</h2>
                <div style="margin:8px 0 12px 0;background:#FFFFFF;border:1px solid #E8EEF5;border-radius:6px;padding:6px 10px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="flex:1;height:5px;background:#e9eef5;border-radius:6px;overflow:hidden;">
                            <div style="width:${e}%;height:100%;background:linear-gradient(90deg,#1565C0,#38bdf8);border-radius:6px;"></div>
                        </div>
                        <span style="font-size:12px;font-weight:600;color:#1565C0;min-width:35px;text-align:right;">${e}%</span>
                    </div>
                </div>
                <div class="memory-trainer-stats" style="margin:6px 0 10px 0;padding:4px 0;display:flex;justify-content:space-around;border-top:1px solid #F1F5F9;border-bottom:1px solid #F1F5F9;">
                    <div class="stat-item" style="text-align:center;">
                        <span class="stat-label" style="display:block; font-size:10px; color:#94A3B8; font-weight:500; text-transform:uppercase; letter-spacing:0.5px;">المحاولات</span>
                        <span class="stat-value" style="display:block; font-size:18px; font-weight:700; color:#1565C0; margin-top:2px;">${this.attempts}</span>
                    </div>
                    <div class="stat-item" style="text-align:center;">
                        <span class="stat-label" style="display:block; font-size:10px; color:#94A3B8; font-weight:500; text-transform:uppercase; letter-spacing:0.5px;">الإجابات الصحيحة</span>
                        <span class="stat-value" style="display:block; font-size:18px; font-weight:700; color:#1565C0; margin-top:2px;">${this.correctAttempts}</span>
                    </div>
                </div>
                <p class="memory-trainer-hint" style="font-size:13px; color:#64748B; margin:8px 0 16px 0;">الآن سنعيد فقط الأسئلة التي لم تثبت بعد.</p>
                <button class="memory-trainer-btn primary" onclick="window.memoryTrainer.startReview()" style="padding:8px 20px; border:none; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; background:#1565C0; color:white; box-shadow:0 2px 6px rgba(21,101,192,0.15);">مراجعة ${t} سؤال →</button>
            </div>
        `)}startReview(){this.isReviewMode=!0,this.trainingQueue=[...this.wrongQuestions],this.currentIndex=0,this.totalQuestions=this.trainingQueue.length,this.wrongQuestions=[],this.showMemoryCard()}showResults(){const t=this.isFromList,e=this.currentSkill,i=this.currentExamId||1,s=this.getExamProgress(e,i),r=this.getOverallProgressForSkill(e),n=this.getStageProgressForSkill(e);let o="";if(t){let a=1,l=1,c=!1;if(window.getCurrentStage&&window.getTotalStages)a=window.getCurrentStage(e),l=window.getTotalStages(e),c=a>=l;else{const h=`_${e}_combinedData`;if(window[h]){const x=window[h];a=x.currentStage||1,l=x.totalStages||1,c=x.isLastStage||a>=l}}let d=this.totalQuestions||0;const p=`_${e}_combinedData`;window[p]&&(d=window[p].totalQuestions||d),c?o=`
                    <div class="memory-trainer-results final" style="
                        background: #F0FDF4;
                        border: 1px solid #86EFAC;
                        border-radius: 12px;
                        padding: 20px 24px;
                        max-width: 440px;
                        width: 90%;
                        text-align: center;
                        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
                    ">
                        <div style="font-size:28px;text-align:center;margin-bottom:4px;">🏆</div>
                        <h2 style="color:#1565C0;font-size:18px;font-weight:600;text-align:center;margin-bottom:4px;">لقد أكملت ${e} بالكامل</h2>
                        <p style="font-size:14px;color:#64748B;text-align:center;margin-bottom:14px;font-weight:400;">تهانينا! لقد أنهيت جميع المراحل بنجاح.</p>
                        <div style="margin:0 0 14px 0;background:#FFFFFF;border:1px solid #E8EEF5;border-radius:6px;padding:6px 10px;">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <div style="flex:1;height:5px;background:#e9eef5;border-radius:6px;overflow:hidden;">
                                    <div style="width:${r}%;height:100%;background:linear-gradient(90deg,#1565C0,#38bdf8);border-radius:6px;"></div>
                                </div>
                                <span style="font-size:13px;font-weight:600;color:#1565C0;min-width:40px;text-align:right;">${r}%</span>
                            </div>
                        </div>
                        <button class="memory-trainer-btn primary" onclick="window.memoryTrainer.close();" style="padding:8px 20px;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s ease;margin-top:6px;background:#1565C0;color:white;box-shadow:0 2px 6px rgba(21,101,192,0.15);display:block;width:100%;">⬅ العودة للقائمة</button>
                    </div>
                `:o=`
                    <div class="memory-trainer-results final" style="
                        background: #F8FFFB;
                        border: 1px solid #B8E6B8;
                        border-radius: 12px;
                        padding: 20px 24px;
                        max-width: 440px;
                        width: 90%;
                        text-align: center;
                        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
                    ">
                        <div style="font-size:28px;text-align:center;margin-bottom:4px;">🎉</div>
                        <h2 style="color:#1565C0;font-size:18px;font-weight:600;text-align:center;margin-bottom:4px;">أحسنت، لقد أنهيت المرحلة ${a}</h2>
                        <p style="font-size:14px;color:#64748B;text-align:center;margin-bottom:14px;font-weight:400;">تم تثبيت ${d} نص.</p>
                        <div style="margin:0 0 14px 0;background:#FFFFFF;border:1px solid #E8EEF5;border-radius:6px;padding:6px 10px;">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <div style="flex:1;height:5px;background:#e9eef5;border-radius:6px;overflow:hidden;">
                                    <div style="width:${n}%;height:100%;background:linear-gradient(90deg,#1565C0,#38bdf8);border-radius:6px;"></div>
                                </div>
                                <span style="font-size:13px;font-weight:600;color:#1565C0;min-width:40px;text-align:right;">${n}%</span>
                            </div>
                        </div>
                        <button class="memory-trainer-btn primary" onclick="window.memoryTrainer.close(); if (typeof window.goToNextStage === 'function') window.goToNextStage('${e}');" style="padding:8px 20px;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s ease;margin-top:6px;background:#1565C0;color:white;box-shadow:0 2px 6px rgba(21,101,192,0.15);display:block;width:100%;">➡ متابعة المرحلة ${a+1}</button>
                    </div>
                `}else{let a=`امتحان ${this.currentExamId}`;this.examType==="matching"?this.currentSkill==="lesen3"?a=`امتحان ${this.currentExamId} (Lesen 3)`:a=`امتحان ${this.currentExamId} (Lesen 1)`:this.examType==="multiple"?a=`امتحان ${this.currentExamId} (Lesen 2)`:this.examType==="sprach1"?a=`امتحان ${this.currentExamId} (Sprachbausteine 1)`:this.examType==="sprach2"&&(a=`امتحان ${this.currentExamId} (Sprachbausteine 2)`),o=`
                <div class="memory-trainer-results final" style="
                    background: #F8FFFB;
                    border: 1px solid #B8E6B8;
                    border-radius: 12px;
                    padding: 20px 24px;
                    max-width: 440px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
                ">
                    <div style="font-size:28px;text-align:center;margin-bottom:4px;">🧩</div>
                    <h2 style="color:#1565C0;font-size:18px;font-weight:600;text-align:center;margin-bottom:4px;">اكتمل الاستدعاء</h2>
                    <p style="font-size:14px;color:#64748B;text-align:center;margin-bottom:14px;font-weight:400;">لقد أنهيت تدريب ${a}.</p>
                    <div style="margin:0 0 14px 0;background:#FFFFFF;border:1px solid #E8EEF5;border-radius:6px;padding:6px 10px;">
                        <div style="display:flex;align-items:center;gap:10px;">
                            <div style="flex:1;height:5px;background:#e9eef5;border-radius:6px;overflow:hidden;">
                                <div style="width:${s}%;height:100%;background:linear-gradient(90deg,#1565C0,#38bdf8);border-radius:6px;"></div>
                            </div>
                            <span style="font-size:13px;font-weight:600;color:#1565C0;min-width:40px;text-align:right;">${s}%</span>
                        </div>
                    </div>
                    <button class="memory-trainer-btn primary" onclick="window.memoryTrainer.close();" style="padding:8px 20px;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s ease;margin-top:6px;background:#1565C0;color:white;box-shadow:0 2px 6px rgba(21,101,192,0.15);display:block;width:100%;">⬅ العودة للامتحان</button>
                </div>
            `}this.updateCard(o)}clearTimer(){this.timer&&(clearTimeout(this.timer),this.timer=null)}shuffleArray(t){for(let e=t.length-1;e>0;e--){const i=Math.floor(Math.random()*(e+1));[t[e],t[i]]=[t[i],t[e]]}return t}showNotAvailable(t="هذه الميزة غير متوفرة لهذا الامتحان."){this.updateCard(`
            <div class="memory-trainer-intro" style="
                background: #FFFFFF;
                border: 1px solid #E8EEF5;
                border-radius: 12px;
                padding: 20px 24px;
                max-width: 440px;
                width: 90%;
                text-align: center;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
            ">
                <h2 style="color:#1565C0; font-size:17px; font-weight:600;">ℹ️ غير متوفرة</h2>
                <p style="color:#64748B; margin:12px 0;">${t}</p>
                <button class="memory-trainer-btn primary" onclick="window.memoryTrainer.close()" style="padding:8px 20px; border:none; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; background:#1565C0; color:white; box-shadow:0 2px 6px rgba(21,101,192,0.15);">فهمت</button>
            </div>
        `)}close(){this.clearTimer(),this.overlay&&(this.overlay.remove(),this.overlay=null),this.card=null,this.isCardReady=!1,this.questions=[],this.allQuestions=[],this.sharedOptions=[],this.trainingQueue=[],this.wrongQuestions=[],this.currentIndex=0,this.isActive=!1,this.isReviewMode=!1,this.isFromList=!1,this.attempts=0,this.correctAttempts=0,this.totalQuestions=0,this.currentExamId=1,this.examType="hoeren"}}window.memoryTrainer=new MemoryTrainer,window.startMemoryTrainerForExam=u=>{window.memoryTrainer&&(window.memoryTrainer.currentSkill=u||window.currentSkill||"hoeren1",window.memoryTrainer.currentExamId=window.currentExamId||1,window.memoryTrainer.start("single"))},window.startMemoryTrainerFromList=(u="hoeren1")=>{window.memoryTrainer&&(window.memoryTrainer.currentSkill=u,window.memoryTrainer.start("list"))},window.startMemoryTrainer=window.startMemoryTrainerForExam,console.log("🧠 Memory Trainer V4 (يدعم Hören, Lesen 1, Lesen 2, Lesen 3, Sprachbausteine 1 و Sprachbausteine 2) تم تحميله");
