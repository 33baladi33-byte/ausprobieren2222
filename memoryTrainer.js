class MemoryTrainer{constructor(){this.questions=[],this.allQuestions=[],this.sharedOptions=[],this.trainingQueue=[],this.wrongQuestions=[],this.currentIndex=0,this.isActive=!1,this.isReviewMode=!1,this.isFromList=!1,this.examType="hoeren",this.currentCorrectText="",this.currentCorrectIndex=-1,this.currentOptions=[],this.currentQuestionIndex=0,this.currentExamId=1,this.currentQuestionObj=null,this.attempts=0,this.correctAttempts=0,this.totalQuestions=0,this.overlay=null,this.card=null,this.timer=null,this.isAnswered=!1,this.isCardReady=!1,this.TOTAL_OPTIONS=3,this.WRONG_OPTIONS=2,this.LEVELS_KEY="memory_levels",this.MAX_LEVEL=5,this.currentSkill="hoeren1",this.currentExamId=1,this.examSharedOptionsMap={}}async getUserStatus(){try{return typeof window.getUserStatusGlobal=="function"?await window.getUserStatusGlobal():typeof window.getUserStatusForExam=="function"?await window.getUserStatusForExam():"free"}catch(e){return console.warn("⚠️ فشل جلب حالة المستخدم:",e),"free"}}async start(e="single"){console.log(`🧠 بدء Memory Trainer V4 (المهارة: ${this.currentSkill}, الوضع: ${e})...`);let t=null;if(this.isFromList=!1,this.sharedOptions=[],this.examSharedOptionsMap={},e==="list"){const i=`_${this.currentSkill}_combinedData`;if(window[i]){t=window[i],this.isFromList=!0,console.log(`📚 تدريب من قائمة ${this.currentSkill} (المرحلة ${t.currentStage||1})`),this.examType=t.examType||"hoeren",this.currentSkill==="lesen1"||this.currentSkill==="lesen3"?this.examType="matching":this.currentSkill==="lesen2"?this.examType="multiple":this.currentSkill==="sprach1"?this.examType="sprach1":this.currentSkill==="sprach2"&&(this.examType="sprach2");const a=t.examIds||[];if(a.length===0){this.showNotAvailable("لا توجد امتحانات في هذه المرحلة");return}let n=[];for(const o of a)try{const s=await fetch(`data/${this.currentSkill}/exam${o}.json`);if(!s.ok){console.warn(`⚠️ لا يمكن تحميل الامتحان ${o}`);continue}const r=await s.json();let l=[];if(this.currentSkill==="lesen1"&&r.sharedOptions?l=r.sharedOptions:this.currentSkill==="lesen3"&&r.situations&&(l=r.situations),l.length===0){console.warn(`⚠️ الامتحان ${o} ليس لديه sharedOptions، سيتم تخطيه`);continue}this.examSharedOptionsMap[o]=l;let c=[];this.currentSkill==="lesen1"||this.currentSkill==="lesen2"?c=r.questions||[]:this.currentSkill==="lesen3"?(c=r.items||[],c=c.filter(d=>d.correct!==null&&d.correct!==void 0&&typeof d.correct=="number"&&d.correct>=0&&d.correct<l.length)):c=r.questions||[];for(const d of c){const p={...d,examId:o};p._sharedOptions=l,n.push(p)}console.log(`✅ تم تحميل الامتحان ${o} (${c.length} سؤال)`)}catch(s){console.warn(`⚠️ فشل تحميل الامتحان ${o}:`,s)}if(n.length===0){this.showNotAvailable("لا توجد أسئلة صالحة للتدريب في هذه المرحلة");return}if(this.questions=this.shuffleArray(n),this.allQuestions=this.questions.slice(),console.log(`📊 تم جمع ${this.questions.length} سؤال من ${a.length} امتحان`),this.sharedOptions.length===0&&a.length>0){const o=a[0];this.examSharedOptionsMap[o]&&(this.sharedOptions=this.examSharedOptionsMap[o])}}else if(typeof window.loadStageExams=="function"){await window.loadStageExams(this.currentSkill),window[i]?this.start(e):this.showNotAvailable(`لم يتم تحميل بيانات ${this.currentSkill} بعد`);return}else{this.showNotAvailable(`لم يتم تحميل بيانات ${this.currentSkill} بعد`);return}}else if(t=window.currentExamData||window._currentExamData,t){this.currentSkill=window.currentSkill||"hoeren1",this.currentExamId=window.currentExamId||1,console.log(`📖 تدريب من امتحان فردي: ${this.currentSkill} exam${this.currentExamId}`),this.currentSkill==="lesen3"&&t.situations&&!this.sharedOptions.length?this.sharedOptions=t.situations:t.sharedOptions&&(this.sharedOptions=t.sharedOptions),this.examType=t.type||"hoeren",this.currentSkill==="lesen1"||this.currentSkill==="lesen3"?this.examType="matching":this.currentSkill==="lesen2"?this.examType="multiple":this.currentSkill==="sprach1"?this.examType="sprach1":this.currentSkill==="sprach2"&&(this.examType="sprach2");let i=[];if(this.currentSkill==="sprach1"||this.currentSkill==="sprach2"?i=(t.options&&Array.isArray(t.options)?t.options:t.questions||[]).filter(n=>n.memoryHighlight).map((n,o)=>{const s=n.memoryHighlight||{};return{text:n.text||"",correct:n.correct,options:n.options||[],examId:this.currentExamId,questionIndex:o,originalQuestion:n,memoryHighlight:n.memoryHighlight||null,id:n.id,before:s.before||"",connector:s.connector||"",after:s.after||"",color:0,_sharedOptions:this.sharedOptions}}):this.currentSkill==="lesen3"&&t.items?(i=(t.items||[]).map((n,o)=>({...n,examId:this.currentExamId,questionIndex:o,_sharedOptions:this.sharedOptions})),this.sharedOptions.length>0&&(i=i.filter(n=>n.correct!==null&&n.correct!==void 0&&typeof n.correct=="number"&&n.correct>=0&&n.correct<this.sharedOptions.length))):i=(t.questions||[]).map((n,o)=>({...n,examId:this.currentExamId,questionIndex:o,_sharedOptions:this.sharedOptions})),this.questions=i,this.allQuestions=i.slice(),this.questions.length===0){this.showNotAvailable("لا توجد أسئلة صالحة في هذا الامتحان");return}}else{this.showNotAvailable("لا توجد بيانات امتحان");return}if(this.buildTrainingQueue(),this.trainingQueue.length===0){this.showNotAvailable("لا توجد جمل للتدريب");return}this.isActive=!0,this.isReviewMode=!1,this.currentIndex=0,this.attempts=0,this.correctAttempts=0,this.wrongQuestions=[],this.totalQuestions=this.trainingQueue.length,this.isCardReady=!1,this.createOverlay(),this.createCardStructure(),this.isFromList?this.showIntroCardList():this.showIntroCardSingle()}createOverlay(){this.overlay&&this.overlay.remove(),this.overlay=document.createElement("div"),this.overlay.className="memory-trainer-overlay",this.overlay.addEventListener("click",e=>{if(e.target===this.overlay){if(this.currentIndex>=this.trainingQueue.length&&this.isActive){this.wrongQuestions.length>0?this.showPhaseComplete():this.showResults();return}this.close()}}),document.body.appendChild(this.overlay)}createCardStructure(){this.overlay||(console.warn("⚠️ createCardStructure: overlay غير موجود، يتم إنشاؤه تلقائياً"),this.createOverlay());const e=this.overlay.querySelector(".memory-trainer-card-container");e&&e.remove(),this.card=document.createElement("div"),this.card.className="memory-trainer-card-container",this.card.style.cssText=`
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: memorySlideUp 0.15s ease;
        `,this.overlay.appendChild(this.card),this.isCardReady=!0}updateCard(e){(!this.isCardReady||!this.card)&&this.createCardStructure(),this.card.innerHTML=e}buildTrainingQueue(){const e=this.questions.map(n=>n),t=Math.ceil(e.length/2),i=this.shuffleArray([...e]),a=[];for(let n=0;n<Math.min(t,i.length);n++)a.push(i[n]);this.trainingQueue=this.shuffleArray([...e,...a]),console.log(`📊 قائمة التدريب: ${this.trainingQueue.length} جملة (${this.isFromList?"مرحلة":"امتحان فردي"})`)}buildSentenceId(e,t,i){return window.buildSentenceId?window.buildSentenceId(e,t,i):`${e}_exam${t}_${i}`}getSentenceLevel(e){const t=JSON.parse(localStorage.getItem(this.LEVELS_KEY)||"{}");return t[e]!==void 0?t[e]:0}setSentenceLevel(e,t){const i=JSON.parse(localStorage.getItem(this.LEVELS_KEY)||"{}");let a=Math.max(0,Math.min(this.MAX_LEVEL,t));i[e]=a,localStorage.setItem(this.LEVELS_KEY,JSON.stringify(i))}increaseLevel(e){const t=this.getSentenceLevel(e);if(t<this.MAX_LEVEL){const i=t+1;this.setSentenceLevel(e,i),console.log(`⬆️ زيادة مستوى ${e} -> ${i}`)}}decreaseLevel(e){const t=this.getSentenceLevel(e);if(t>0){const i=t-1;this.setSentenceLevel(e,i),console.log(`⬇️ إنقاص مستوى ${e} -> ${i}`)}}getExamProgress(e,t){if(window.getExamProgress)return window.getExamProgress(e,t);const i=`${e}_exam${t}_`,a=JSON.parse(localStorage.getItem(this.LEVELS_KEY)||"{}");let n=0,o=0;for(const s in a)s.startsWith(i)&&(n+=a[s],o++);return o===0?0:Math.min(100,Math.round(n/(o*this.MAX_LEVEL)*100))}getOverallProgressForSkill(e){return window.getOverallProgress?window.getOverallProgress.length===1?window.getOverallProgress(e):window.getOverallProgress():0}getStageProgressForSkill(e){return window.getStageProgress?window.getStageProgress(e):0}generateOptions(e,t){const i=[e];let a=0;if(this.examType==="matching"){const s=t.examId||this.currentExamId;let r=this.examSharedOptionsMap[s]||this.sharedOptions;if(r&&r.length>0){const l=t.correct,c=r[l],d=r.filter((m,g)=>g!==l),x=this.shuffleArray([...d]).slice(0,2),h=[c,...x];for(;h.length<3;){const m=r[Math.floor(Math.random()*r.length)];h.includes(m)||h.push(m)}return this.shuffleArray(h)}}const n=this.allQuestions.filter(s=>s.text!==e).map(s=>s.text);let o=this.shuffleArray([...n]);for(let s=0;s<o.length&&a<this.WRONG_OPTIONS;s++){const r=o[s];!i.includes(r)&&r.trim()!==""&&(i.push(r),a++)}for(;i.length<this.TOTAL_OPTIONS;)console.warn("⚠️ لم يتم العثور على جمل خاطئة كافية، نضيف جملة وهمية مؤقتة"),i.push(`جملة ${i.length+1}`);return this.shuffleArray(i)}showIntroCardSingle(){const e=this.getExamProgress(this.currentSkill,this.currentExamId);let t=`امتحان ${this.currentExamId}`;this.examType==="matching"?this.currentSkill==="lesen3"?t=`امتحان ${this.currentExamId} (Lesen 3)`:t=`امتحان ${this.currentExamId} (Lesen 1)`:this.examType==="multiple"?t=`امتحان ${this.currentExamId} (Lesen 2)`:this.examType==="sprach1"?t=`امتحان ${this.currentExamId} (Sprachbausteine 1)`:this.examType==="sprach2"&&(t=`امتحان ${this.currentExamId} (Sprachbausteine 2)`),this.updateCard(`
            <div class="memory-trainer-intro">
                <div class="memory-trainer-icon">🧩</div>
                <h2>استدعاء ذكي</h2>
                <p style="font-size:14px;color:#334155;margin:6px 0 2px 0;">تدريب ${t}.</p>
                <p style="font-size:13px;color:#64748B;margin:2px 0 14px 0;">${this.examType==="multiple"?"سترى السؤال مرة واحدة، ثم سنطلب منك اختيار الجواب الصحيح.":this.examType==="sprach1"||this.examType==="sprach2"?"سترى الجملة مع الفراغ، ثم سنطلب منك اختيار الكلمة المناسبة.":"سترى النص مرة واحدة، ثم سنطلب منك اختيار العنوان المناسب."}</p>
                <div style="margin:4px 0 14px 0;background:#FFFFFF;border:1px solid #E8EEF5;border-radius:6px;padding:4px 10px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="flex:1;height:5px;background:#e9eef5;border-radius:6px;overflow:hidden;">
                            <div style="width:${e}%;height:100%;background:linear-gradient(90deg,#1565C0,#38bdf8);border-radius:6px;"></div>
                        </div>
                        <span style="font-size:12px;font-weight:600;color:#1565C0;">${e}%</span>
                    </div>
                </div>
                <button class="memory-trainer-btn primary" onclick="window.memoryTrainer.showMemoryCard()">ابدأ</button>
            </div>
        `)}showIntroCardList(){this.getUserStatus().then(e=>{const t=e==="premium",i=this.getOverallProgressForSkill(this.currentSkill),a=this.trainingQueue.length;let n=1,o=1;window.getCurrentStage&&window.getTotalStages&&(n=window.getCurrentStage(this.currentSkill),o=window.getTotalStages(this.currentSkill));let s=this.currentSkill;this.examType==="matching"?this.currentSkill==="lesen3"?s="Lesen 3":s="Lesen 1":this.examType==="multiple"?s="Lesen 2":this.examType==="sprach1"?s="Sprachbausteine 1":this.examType==="sprach2"&&(s="Sprachbausteine 2");let r="";t?r='<button class="memory-trainer-btn primary" onclick="window.memoryTrainer.showMemoryCard()">ابدأ التدريب</button>':r=`
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
                    <p style="font-size:14px;color:#334155;margin:4px 0 2px 0;">هاد الميزة غدي تخليك تتدرب على جميع أسئلة امتحانات المرحلة ${n} من ${s}.</p>
                    <p style="font-size:13px;color:#64748B;margin:2px 0 12px 0;">كلما تدربت أكثر، أصبح النظام أكثر ذكاءً في اختيار الأسئلة.</p>
                    <div style="margin:10px 0 14px 0;background:#FFFFFF;border:1px solid #E8EEF5;border-radius:6px;padding:6px 10px;text-align:left;">
                        <div style="display:flex;align-items:center;gap:10px;">
                            <div style="flex:1;height:5px;background:#e9eef5;border-radius:6px;overflow:hidden;">
                                <div style="width:${i}%;height:100%;background:linear-gradient(90deg,#1565C0,#38bdf8);border-radius:6px;"></div>
                            </div>
                            <span style="font-size:13px;font-weight:600;color:#1565C0;min-width:40px;text-align:right;">${i}%</span>
                        </div>
                    </div>
                    <p style="font-size:12px;color:#94A3B8;margin:4px 0 4px 0;">${a} نص للتدريب</p>
                    <p style="font-size:11px;color:#94A3B8;margin:0 0 12px 0;">المرحلة ${n} / ${o}</p>
                    ${r}
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
            `)})}showMemoryCard(){if(this.clearTimer(),this.isAnswered=!1,this.currentIndex>=this.trainingQueue.length){this.showPhaseComplete();return}const e=this.trainingQueue[this.currentIndex],t=e.text;this.currentCorrectText=t,this.currentExamId=e.examId||this.currentExamId,this.currentQuestionIndex=e.questionIndex||0,this.currentQuestionObj=e,this.currentCorrectIndex=e.correct;const i=e.examId||this.currentExamId,a=this.examSharedOptionsMap[i]||this.sharedOptions;let n="";if(this.examType==="matching"){const o=this.currentCorrectIndex,s=a&&a[o]||"",r=s.match(/^[a-zA-Z][\.\)]\s*/)?s.match(/^[a-zA-Z][\.\)]\s*/)[0]:"",l=s.replace(/^[a-zA-Z][\.\)]\s*/,"");n=`
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
                            ${t}
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
                            ✅ ${r}${l}
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
            `}else if(this.examType==="multiple"){const o=this.currentQuestionIndex!==void 0?this.currentQuestionIndex+1:this.currentIndex+1;let r=e.options&&e.options.length>0?e.options[e.correct]:"";/^[a-zA-Z][\.\)]\s*/.test(r)&&(r=r.replace(/^[a-zA-Z][\.\)]\s*/,"")),n=`
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
    ✅ ${r}
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
            `}else if(this.examType==="sprach1"){const o=e.memoryHighlight||{},s=e.id||this.currentQuestionIndex+1,r=o.before||"",l=o.connector||"",c=o.after||"";n=`
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
    ${r} <span style="font-weight:700;color:#1565C0;background:#E3F2FD;padding:0 6px;border-radius:4px;">[${s}]</span> ${c}
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
            `}else if(this.examType==="sprach2"){const o=e.memoryHighlight||{},s=e.id||this.currentQuestionIndex+1,r=o.before||"",l=o.connector||"",c=o.after||"";n=`
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
                            ${r} <span style="font-weight:700;color:#1565C0;background:#E3F2FD;padding:0 6px;border-radius:4px;">[${s}]</span> ${c}
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
            `}else n=`
                <div class="memory-trainer-card">
                    <div class="memory-trainer-header">
                        <span class="memory-trainer-progress">${this.currentIndex+1}/${this.trainingQueue.length}</span>
                        <span class="memory-trainer-focus">🍃 خذ وقتك</span>
                    </div>
                    <div class="memory-trainer-content">
                        <p class="memory-trainer-hint">🌿 سأطلب منك هذه الجملة بعد قليل.</p>
                        <div class="memory-trainer-answer">
                            <span>${t}</span>
                        </div>
                    </div>
                    <button class="memory-trainer-btn primary" onclick="window.memoryTrainer.readyToRecall()">أنا جاهز</button>
                </div>
            `;this.updateCard(n)}readyToRecall(){this.clearTimer();const e=this.currentQuestionObj,t=e.examId||this.currentExamId,i=this.examSharedOptionsMap[t]||this.sharedOptions;if(this.examType==="matching"){const s=this.currentCorrectIndex,r=i[s],l=i.filter((c,d)=>d!==s).sort(()=>Math.random()-.5).slice(0,2);for(;l.length<2;){const c=i[Math.floor(Math.random()*i.length)];!l.includes(c)&&c!==r&&l.push(c)}this.currentOptions=this.shuffleArray([r,...l])}else if(this.examType==="multiple")this.currentOptions=e.options||[],this.currentOptions.length===0&&(console.warn("⚠️ لا توجد خيارات في السؤال، نستخدم generateOptions كحل احتياطي"),this.currentOptions=this.generateOptions(this.currentCorrectText,e));else if(this.examType==="sprach1")this.currentOptions=e.options||[],this.currentOptions.length===0&&(console.warn("⚠️ لا توجد خيارات في السؤال، نستخدم generateOptions كحل احتياطي"),this.currentOptions=this.generateOptions(this.currentCorrectText,e));else if(this.examType==="sprach2"){const s=e.options||[],r=e.connector||e.correct,l=s.filter(c=>c!==r).sort(()=>Math.random()-.5).slice(0,2);this.currentOptions=this.shuffleArray([r,...l])}else this.currentOptions=this.generateOptions(this.currentCorrectText,e);let a="",n="";if(this.examType==="matching")a=this.currentSkill==="lesen3"?"اختر الحالة المناسبة للفقرة التي قرأتها:":"اختر العنوان المناسب للنص الذي قرأته:";else if(this.examType==="multiple")a="ما الاختيار الصحيح؟",n=`
                <div style="font-size:17px; font-weight:500; text-align:left; padding:12px 0; color:#1a202c; margin-bottom:16px;">
                    ${this.currentQuestionIndex!==void 0?this.currentQuestionIndex+1:this.currentIndex+1}. ${this.currentCorrectText}:
                </div>
            `;else if(this.examType==="sprach1"){a="اختر الكلمة الصحيحة:";const s=e.memoryHighlight||{},r=e.id||this.currentQuestionIndex+1,l=s.before||"",c=s.after||"";n=`
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
                    ${l} <span style="font-weight:700;color:#1565C0;background:#E3F2FD;padding:0 6px;border-radius:4px;">[${r}]</span> ${c}
                </div>
            `}else if(this.examType==="sprach2"){a="اختر الكلمة الصحيحة:";const s=e.memoryHighlight||{},r=e.id||this.currentQuestionIndex+1,l=s.before||"",c=s.after||"";n=`
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
                    ${l} <span style="font-weight:700;color:#1565C0;background:#E3F2FD;padding:0 6px;border-radius:4px;">[${r}]</span> ${c}
                </div>
            `}else a="ما هي الجملة التي رأيتها قبل قليل؟";let o="";this.examType==="matching"&&(o=`
                <div class="memory-reading-box" style="
                    width: 100%;
                    max-height: 140px;
                    overflow-y: auto;
                    padding: 12px 16px;
                    background: #F8FAFC;
                    border: 1px solid #EDF2F7;
                    border-radius: 10px;
                    text-align: right;
                    direction: rtl;
                    font-size: 15px;
                    line-height: 1.8;
                    font-weight: 400;
                    color: #1a202c;
                    box-sizing: border-box;
                    margin: 8px 0 12px 0;
                ">
                    ${this.currentCorrectText}
                </div>
            `),this.updateCard(`
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
                        ${a}
                    </p>
                    ${n}
                    ${o}
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
        `)}checkAnswer(e){if(this.isAnswered)return;this.isAnswered=!0,this.attempts++;const t=this.currentOptions[e];let i=!1,a="";if(this.examType==="matching"){const d=this.currentQuestionObj.examId||this.currentExamId,p=this.examSharedOptionsMap[d]||this.sharedOptions,x=this.currentCorrectIndex,h=p[x];i=t===h,a=h}else if(this.examType==="multiple"){const d=this.currentQuestionObj.correct,p=this.currentOptions[d];i=t===p,a=p}else if(this.examType==="sprach1"){const d=this.currentQuestionObj.connector||this.currentQuestionObj.correct;i=t===d,a=d}else if(this.examType==="sprach2"){const d=this.currentQuestionObj.connector||this.currentQuestionObj.correct;i=t===d,a=d}else i=t===this.currentCorrectText,a=this.currentCorrectText;const n=this.currentSkill,o=this.currentExamId,s=this.currentQuestionIndex,r=this.buildSentenceId(n,o,s),l=document.querySelectorAll(".memory-trainer-option"),c=document.getElementById("memory-trainer-feedback");l.forEach(d=>{d.disabled=!0,d.style.opacity="0.7",d.style.cursor="default"}),i?(this.correctAttempts++,this.increaseLevel(r),l[e].style.borderColor="#28a745",l[e].style.backgroundColor="#d4edda",c.innerHTML='<button class="memory-trainer-btn primary small" onclick="window.memoryTrainer.nextQuestion()" style="padding:6px 16px; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; background:#28a745; color:white;">التالي →</button>'):(this.decreaseLevel(r),this.wrongQuestions.includes(this.currentQuestionObj)||this.wrongQuestions.push(this.currentQuestionObj),l[e].style.borderColor="#e67e22",l[e].style.backgroundColor="#fef0e0",l.forEach((d,p)=>{this.currentOptions[p]===a&&(d.style.borderColor="#28a745",d.style.backgroundColor="#d4edda")}),c.innerHTML=`
                <div style="display:flex;gap:10px;justify-content:center;margin-top:8px;">
                    <button class="memory-trainer-btn secondary small" onclick="window.memoryTrainer.retryQuestion()" style="padding:6px 16px; border:2px solid #e67e22; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; background:white; color:#e67e22;">🔄 إعادة المحاولة</button>
                    <button class="memory-trainer-btn primary small" onclick="window.memoryTrainer.nextQuestion()" style="padding:6px 16px; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; background:#1565C0; color:white;">التالي →</button>
                </div>
            `),this.isFromList&&this.updateProgressBar()}updateProgressBar(){const e=this.getOverallProgressForSkill(this.currentSkill),t=this.card?.querySelectorAll(".memory-progress-fill, .memory-trainer-progress-bar");t&&t.forEach(a=>{a.classList.contains("memory-progress-fill")&&(a.style.width=e+"%")});const i=this.card?.querySelector(".memory-progress-percent");i&&(i.textContent=e+"%")}retryQuestion(){this.isAnswered=!1,this.currentIndex--,this.nextQuestion()}nextQuestion(){this.currentIndex++,this.currentIndex<this.trainingQueue.length?this.showMemoryCard():this.showPhaseComplete()}showPhaseComplete(){this.clearTimer();const e=this.wrongQuestions.length,t=this.isFromList?this.getOverallProgressForSkill(this.currentSkill):0;if(e===0){this.showResults();return}this.updateCard(`
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
                            <div style="width:${t}%;height:100%;background:linear-gradient(90deg,#1565C0,#38bdf8);border-radius:6px;"></div>
                        </div>
                        <span style="font-size:12px;font-weight:600;color:#1565C0;min-width:35px;text-align:right;">${t}%</span>
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
                <button class="memory-trainer-btn primary" onclick="window.memoryTrainer.startReview()" style="padding:8px 20px; border:none; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; background:#1565C0; color:white; box-shadow:0 2px 6px rgba(21,101,192,0.15);">مراجعة ${e} سؤال →</button>
            </div>
        `)}startReview(){this.isReviewMode=!0,this.trainingQueue=[...this.wrongQuestions],this.currentIndex=0,this.totalQuestions=this.trainingQueue.length,this.wrongQuestions=[],this.showMemoryCard()}showResults(){const e=this.isFromList,t=this.currentSkill,i=this.currentExamId||1,a=this.getExamProgress(t,i),n=this.getOverallProgressForSkill(t),o=this.getStageProgressForSkill(t);let s="";if(e){let r=1,l=1,c=!1;if(window.getCurrentStage&&window.getTotalStages)r=window.getCurrentStage(t),l=window.getTotalStages(t),c=r>=l;else{const x=`_${t}_combinedData`;if(window[x]){const h=window[x];r=h.currentStage||1,l=h.totalStages||1,c=h.isLastStage||r>=l}}let d=this.totalQuestions||0;const p=`_${t}_combinedData`;window[p]&&(d=window[p].totalQuestions||d),c?s=`
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
                        <h2 style="color:#1565C0;font-size:18px;font-weight:600;text-align:center;margin-bottom:4px;">لقد أكملت ${t} بالكامل</h2>
                        <p style="font-size:14px;color:#64748B;text-align:center;margin-bottom:14px;font-weight:400;">تهانينا! لقد أنهيت جميع المراحل بنجاح.</p>
                        <div style="margin:0 0 14px 0;background:#FFFFFF;border:1px solid #E8EEF5;border-radius:6px;padding:6px 10px;">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <div style="flex:1;height:5px;background:#e9eef5;border-radius:6px;overflow:hidden;">
                                    <div style="width:${n}%;height:100%;background:linear-gradient(90deg,#1565C0,#38bdf8);border-radius:6px;"></div>
                                </div>
                                <span style="font-size:13px;font-weight:600;color:#1565C0;min-width:40px;text-align:right;">${n}%</span>
                            </div>
                        </div>
                        <button class="memory-trainer-btn primary" onclick="window.memoryTrainer.close();" style="padding:8px 20px;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s ease;margin-top:6px;background:#1565C0;color:white;box-shadow:0 2px 6px rgba(21,101,192,0.15);display:block;width:100%;">⬅ العودة للقائمة</button>
                    </div>
                `:s=`
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
                        <h2 style="color:#1565C0;font-size:18px;font-weight:600;text-align:center;margin-bottom:4px;">أحسنت، لقد أنهيت المرحلة ${r}</h2>
                        <p style="font-size:14px;color:#64748B;text-align:center;margin-bottom:14px;font-weight:400;">تم تثبيت ${d} نص.</p>
                        <div style="margin:0 0 14px 0;background:#FFFFFF;border:1px solid #E8EEF5;border-radius:6px;padding:6px 10px;">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <div style="flex:1;height:5px;background:#e9eef5;border-radius:6px;overflow:hidden;">
                                    <div style="width:${o}%;height:100%;background:linear-gradient(90deg,#1565C0,#38bdf8);border-radius:6px;"></div>
                                </div>
                                <span style="font-size:13px;font-weight:600;color:#1565C0;min-width:40px;text-align:right;">${o}%</span>
                            </div>
                        </div>
                        <button class="memory-trainer-btn primary" onclick="window.memoryTrainer.close(); if (typeof window.goToNextStage === 'function') window.goToNextStage('${t}');" style="padding:8px 20px;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s ease;margin-top:6px;background:#1565C0;color:white;box-shadow:0 2px 6px rgba(21,101,192,0.15);display:block;width:100%;">➡ متابعة المرحلة ${r+1}</button>
                    </div>
                `}else{let r=`امتحان ${this.currentExamId}`;this.examType==="matching"?this.currentSkill==="lesen3"?r=`امتحان ${this.currentExamId} (Lesen 3)`:r=`امتحان ${this.currentExamId} (Lesen 1)`:this.examType==="multiple"?r=`امتحان ${this.currentExamId} (Lesen 2)`:this.examType==="sprach1"?r=`امتحان ${this.currentExamId} (Sprachbausteine 1)`:this.examType==="sprach2"&&(r=`امتحان ${this.currentExamId} (Sprachbausteine 2)`),s=`
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
                    <p style="font-size:14px;color:#64748B;text-align:center;margin-bottom:14px;font-weight:400;">لقد أنهيت تدريب ${r}.</p>
                    <div style="margin:0 0 14px 0;background:#FFFFFF;border:1px solid #E8EEF5;border-radius:6px;padding:6px 10px;">
                        <div style="display:flex;align-items:center;gap:10px;">
                            <div style="flex:1;height:5px;background:#e9eef5;border-radius:6px;overflow:hidden;">
                                <div style="width:${a}%;height:100%;background:linear-gradient(90deg,#1565C0,#38bdf8);border-radius:6px;"></div>
                            </div>
                            <span style="font-size:13px;font-weight:600;color:#1565C0;min-width:40px;text-align:right;">${a}%</span>
                        </div>
                    </div>
                    <button class="memory-trainer-btn primary" onclick="window.memoryTrainer.close();" style="padding:8px 20px;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s ease;margin-top:6px;background:#1565C0;color:white;box-shadow:0 2px 6px rgba(21,101,192,0.15);display:block;width:100%;">⬅ العودة للامتحان</button>
                </div>
            `}this.updateCard(s)}clearTimer(){this.timer&&(clearTimeout(this.timer),this.timer=null)}shuffleArray(e){for(let t=e.length-1;t>0;t--){const i=Math.floor(Math.random()*(t+1));[e[t],e[i]]=[e[i],e[t]]}return e}showNotAvailable(e="هذه الميزة غير متوفرة لهذا الامتحان."){this.updateCard(`
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
                <p style="color:#64748B; margin:12px 0;">${e}</p>
                <button class="memory-trainer-btn primary" onclick="window.memoryTrainer.close()" style="padding:8px 20px; border:none; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; background:#1565C0; color:white; box-shadow:0 2px 6px rgba(21,101,192,0.15);">فهمت</button>
            </div>
        `)}close(){this.clearTimer(),this.overlay&&(this.overlay.remove(),this.overlay=null),this.card=null,this.isCardReady=!1,this.questions=[],this.allQuestions=[],this.sharedOptions=[],this.trainingQueue=[],this.wrongQuestions=[],this.currentIndex=0,this.isActive=!1,this.isReviewMode=!1,this.isFromList=!1,this.attempts=0,this.correctAttempts=0,this.totalQuestions=0,this.currentExamId=1,this.examType="hoeren"}}window.memoryTrainer=new MemoryTrainer,window.startMemoryTrainerForExam=u=>{window.memoryTrainer&&(window.memoryTrainer.currentSkill=u||window.currentSkill||"hoeren1",window.memoryTrainer.currentExamId=window.currentExamId||1,window.memoryTrainer.start("single"))},window.startMemoryTrainerFromList=(u="hoeren1")=>{window.memoryTrainer&&(window.memoryTrainer.currentSkill=u,window.memoryTrainer.start("list"))},window.startMemoryTrainer=window.startMemoryTrainerForExam,console.log("🧠 Memory Trainer V4 (يدعم Hören, Lesen 1, Lesen 2, Lesen 3, Sprachbausteine 1 و Sprachbausteine 2) تم تحميله");
