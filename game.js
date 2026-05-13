// ===== SOUND ENGINE (Web Audio API) =====
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    play(type) {
        if (!this.enabled || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            switch (type) {
                case 'correct': this._playCorrect(now); break;
                case 'wrong': this._playWrong(now); break;
                case 'click': this._playClick(now); break;
                case 'start': this._playStart(now); break;
                case 'next': this._playNext(now); break;
                case 'win': this._playWin(now); break;
                case 'streak': this._playStreak(now); break;
            }
        } catch (e) { /* silent */ }
    }
    _createOsc(freq, type, start, dur, gain = 0.1) {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, start);
        g.gain.setValueAtTime(gain, start);
        g.gain.exponentialRampToValueAtTime(0.001, start + dur);
        o.connect(g).connect(this.ctx.destination);
        o.start(start);
        o.stop(start + dur);
    }
    _playCorrect(t) {
        this._createOsc(523, 'sine', t, 0.15, 0.1);
        this._createOsc(659, 'sine', t + 0.1, 0.15, 0.1);
        this._createOsc(784, 'sine', t + 0.2, 0.25, 0.08);
    }
    _playWrong(t) {
        this._createOsc(200, 'sawtooth', t, 0.2, 0.08);
        this._createOsc(180, 'sawtooth', t + 0.15, 0.25, 0.06);
    }
    _playClick(t) {
        this._createOsc(800, 'sine', t, 0.05, 0.05);
    }
    _playStart(t) {
        [523, 659, 784, 1047].forEach((f, i) => {
            this._createOsc(f, 'sine', t + i * 0.12, 0.2, 0.08);
        });
    }
    _playNext(t) {
        this._createOsc(440, 'triangle', t, 0.1, 0.05);
    }
    _playWin(t) {
        [523, 659, 784, 1047, 784, 1047].forEach((f, i) => {
            this._createOsc(f, 'sine', t + i * 0.15, 0.3, 0.1);
        });
    }
    _playStreak(t) {
        this._createOsc(880, 'sine', t, 0.1, 0.08);
        this._createOsc(1100, 'sine', t + 0.08, 0.15, 0.08);
        this._createOsc(1320, 'sine', t + 0.16, 0.2, 0.06);
    }
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

const sound = new SoundEngine();

// ===== QUESTIONS =====
const rawQuestions = [
    { q: "ما هي الكحولات؟", type: "choice", options: ["مركبات هيدروكربونية تحل فيها مجموعة هيدروكسيل محل ذرة هيدروجين", "مركبات تحتوي على ذرات كربون وفوسفور فقط", "مركبات لا تذوب في الماء أبداً"], correct: 0, explain: "الكحولات هي مشتقات هيدروكربونية تتميز بوجود مجموعة الهيدروكسيل (-OH)." },
    { q: "ما هي الصيغة العامة للكحولات؟", type: "choice", options: ["R-OH", "R-CHO", "R-COOH", "R-O-R"], correct: 0, explain: "الصيغة R-OH تمثل مجموعة ألكيل مرتبطة بمجموعة هيدروكسيل." },
    { q: "ما هي المجموعة الوظيفية في الكحولات؟", type: "choice", options: ["مجموعة الهيدروكسيل", "مجموعة الكربونيل", "مجموعة الأمين", "مجموعة الكربوكسيل"], correct: 0, explain: "مجموعة الهيدروكسيل (-OH) هي المسؤولة عن خواص الكحولات." },
    { q: "أبسط الكحولات هو الميثانول، كم ذرة كربون يحتوي؟", type: "choice", options: ["ذرة واحدة", "ذرتان", "ثلاث ذرات", "أربع ذرات"], correct: 0, explain: "الميثانول CH3OH هو أصغر عضو في عائلة الكحولات." },
    { q: "لماذا تعتبر مجموعة الهيدروكسيل قطبية؟", type: "essay", keywords: ["أكسجين", "سالبية", "فرق", "قطبي", "كهروسالبية"], explain: "بسبب فرق الكهروسالبية بين ذرة الأكسجين وذرة الهيدروجين." },
    { q: "لماذا كانت الأمهات قديماً يخفن من الكلونيا؟", type: "essay", keywords: ["إدمان", "عقل", "كحول", "نسبة", "عالية"], explain: "بسبب احتوائها على نسبة عالية من الكحول تصل لـ 95% مما يسبب الإدمان وذهاب العقل." },
    { q: "ما هو الكحول المكون من 3 ذرات كربون؟", type: "choice", options: ["بروبانول", "ميثانول", "بيوتانول", "إيثانول"], correct: 0, explain: "الكحول المشتق من البروبان (3 ذرات كربون) يسمى بروبانول." },
    { q: "تصل نسبة تركيز الكحول في بعض أنواع الكلونيا القديمة إلى:", type: "choice", options: ["90% إلى 95%", "50% فقط", "10%", "20%"], correct: 0, explain: "هذا التركيز العالي جداً هو ما يجعلها خطيرة وقابلة للاشتعال." },
    { q: "ما هو الكحول المكون من 4 ذرات كربون؟", type: "choice", options: ["بيوتانول", "ميثانول", "بروبانول", "إيثانول"], correct: 0, explain: "الكحول المشتق من البيوتان (4 ذرات كربون) يسمى بيوتانول." },
    { q: "ما هي الأضرار الجانبية لتناول الكحوليات على الفرد والمجتمع؟", type: "essay", keywords: ["جسدية", "عائلية", "تداعيات", "خطيرة", "صحة"], explain: "تؤدي إلى تداعيات خطيرة جسدية وعائلية وتؤثر سلباً على صحة الفرد والمجتمع." },
    { q: "عند تسمية الكحولات، ما هو المقطع الذي يضاف لنهاية اسم الألكان؟", type: "choice", options: ["ول", "ون", "ال", "ويك"], correct: 0, explain: "نضيف المقطع (ول) لنهاية اسم الألكان، مثل: ميثان -> ميثانول." },
    { q: "ما هو اسم الكحول المكون من ذرتي كربون؟", type: "choice", options: ["إيثانول", "ميثانول", "بروبانول", "بيوتانول"], correct: 0, explain: "ذرتان كربون تعني (إيثان)، وبإضافة مقطع الكحول تصبح إيثانول." },
    { q: "الرابطة التي تنشأ بين الهيدروجين وذرة ذات كهروسالبية عالية تسمى:", type: "choice", options: ["الرابطة الهيدروجينية", "الرابطة التساهمية", "الرابطة الأيونية", "الرابطة الفلزية"], correct: 0, explain: "الرابطة الهيدروجينية هي المسؤولة عن ارتفاع درجة غليان الكحولات." },
    { q: "ما اسم المركب الذي يحتوي على 3 ذرات كربون و3 مجموعات هيدروكسيل؟", type: "choice", options: ["1،2،3-بروبان ترايول", "إيثانول", "ميثانول", "بيوتانول"], correct: 0, explain: "يُعرف أيضاً بالجلسرين ويسمى نظامياً 1،2،3-بروبان ترايول." },
    { q: "ما اسم الكحول الحلقي المكون من 6 ذرات كربون؟", type: "choice", options: ["هكسانول حلقي", "بنزين", "بنتانول حلقي", "بروبانول حلقي"], correct: 0, explain: "يسمى هكسانول حلقي (Cyclohexanol)." },
    { q: "لماذا يمتزج الكحول مع الماء تماماً؟", type: "essay", keywords: ["روابط", "هيدروجينية", "قطبية", "تجاذب"], explain: "بسبب القطبية وتكون روابط هيدروجينية بين جزيئات الكحول وجزيئات الماء." },
    { q: "درجة غليان الكحول أعلى من الهيدروكربونات المماثلة بسبب:", type: "choice", options: ["الروابط الهيدروجينية", "الروابط التساهمية", "الوزن الخفيف", "الرابطة الأيونية"], correct: 0, explain: "الروابط الهيدروجينية قوية وتحتاج طاقة حرارية عالية لكسرها، مما يزيد التجاذب وترتفع درجة الغليان." },
    { q: "هل الكحول يذيب المواد القطبية؟", type: "choice", options: ["نعم، لأنه مركب قطبي", "لا، لأنه غير قطبي", "نعم، لأنه غير قطبي", "لا، الكحول لا يذيب شيئاً"], correct: 0, explain: "القاعدة تقول: 'المذيب يذيب شبيهه'، والكحول قطبي فيذيب المركبات القطبية." },
    { q: "ما هي العملية المعتمدة لفصل الكحول عن الماء؟", type: "choice", options: ["التقطير", "الترشيح", "التبلور", "الكروماتوجرافيا"], correct: 0, explain: "التقطير يعتمد على اختلاف درجة الغليان." },
    { q: "فسري: يصعب فصل الكحول عن الماء تماماً بالتقطير البسيط؟", type: "essay", keywords: ["شدة", "ذوبان", "ترابط", "هيدروجينية"], explain: "بسبب شدة ذوبانهم ببعضهم البعض وتكون روابط هيدروجينية قوية." },
    { q: "ما موقف المملكة من بيع المشروبات الكحولية؟", type: "choice", options: ["تمنعها تماماً", "تسمح بها", "تسمح بها في العطور فقط", "تسمح بها في المطاعم"], correct: 0, explain: "تمنع المملكة المشروبات المحرمة امتثالاً للشرع وحرصاً على الصحة." },
    { q: "ما هي الفوائد الطبية للكحول المذكورة في الدرس؟", type: "essay", keywords: ["مطهر", "معقم", "طبية", "صناعية"], explain: "يعتبر من المطهرات والمعقمات الممتازة وله أغراض طبية وصناعية كثيرة." },
    { q: "علل: الكحول لا يمتزج مع الزيت؟", type: "essay", keywords: ["زيت", "غير قطبي", "قطبي", "يذيب"], explain: "لأن الكحول مركب قطبي بينما الزيت مركب غير قطبي، والمذيبات تذيب أشباهها." },
    { q: "هناك أدوية تسمى 'بدائل الكحول' تستخدم لعلاج ماذا؟", type: "choice", options: ["الأرق", "الزكام", "الكسور", "الصداع"], correct: 0, explain: "بعض أدوية الأرق قد تسبب الإدمان وتعتبر من بدائل الكحول ويجب الحذر منها." },
    { q: "ما هو حل مشكلة جفاف البشرة بسبب مزيل ومثبت المكياج؟", type: "essay", keywords: ["تركيز", "تقليل", "مراعاة", "مرتفع"], explain: "يجب مراعاة تركيز الكحول بحيث لا يكون مرتفعاً لتجنب تحسس البشرة." },
    { q: "ما هي الذرة ذات الكهروسالبية العالية الموجودة في مجموعة الهيدروكسيل؟", type: "choice", options: ["الأكسجين", "الكربون", "الهيدروجين", "النيتروجين"], correct: 0, explain: "الأكسجين في مجموعة OH يمتلك كهروسالبية عالية تجعل الرابطة قطبية." },
    { q: "ما هو الفرق الرئيسي بين الميثان والميثانول من حيث القطبية؟", type: "choice", options: ["الميثانول قطبي والميثان غير قطبي", "كلاهما قطبي", "كلاهما غير قطبي", "الميثان قطبي والميثانول غير قطبي"], correct: 0, explain: "دخول الهيدروكسيل في الميثانول يعطيه قطبية بسبب فرق الكهروسالبية، بينما الميثان غير قطبي." },
    { q: "ما هي القاعدة التي تفسر ذوبان الكحول في الماء؟", type: "choice", options: ["المذيب يذيب شبيهه", "المركبات العضوية لا تذوب في الماء", "القطبي يذيب غير القطبي", "قاعدة التنافر"], correct: 0, explain: "بما أن الماء قطبي والكحول قطبي، فإنهما يمتزجان تماماً." },
    { q: "لماذا منع الإسلام تناول المشروبات الكحولية؟", type: "essay", keywords: ["حرام", "عقل", "رجس", "شيطان"], explain: "لأنها من عمل الشيطان ورجس، وتذهب العقل ومحرمة شرعاً (إنما الخمر والميسر... رجس)." },
    { q: "ما هو التركيب الكيميائي الذي يمنح الكحول قطبيته العالية؟", type: "choice", options: ["مجموعة الهيدروكسيل OH", "السلسلة الكربونية", "ذرات الهيدروجين الطرفية", "رابطة الكربون الأحادية"], correct: 0, explain: "مجموعة الهيدروكسيل هي المسؤولة عن الخواص القطبية للكحول." },
    { q: "أي من المركبات التالية يعتبر غير قطبي ولا يمتزج مع الكحول؟", type: "choice", options: ["الزيت", "الماء", "حمض الإيثانوئيك", "الأمونيا"], correct: 0, explain: "الزيت مركب غير قطبي لذلك لا يذوب في الكحول." },
    { q: "كيف نستبدل اسم الألكان عند تسمية الكحولات بحسب قواعد IUPAC؟", type: "choice", options: ["نحذف (ان) ونستبدلها بـ (ول)", "نضيف كلمة كحول فقط", "نضيف مقطع (ون)", "نضيف مقطع (ال)"], correct: 0, explain: "بحسب الدرس، يتم حذف (ان) واستبدالها بـ (ول) بالإضافة لترقيم السلسلة." },
    { q: "ما هي الطريقة الصحيحة للتعامل مع العطور التي تحتوي على نسبة كحول عالية جداً؟", type: "choice", options: ["تخفيف نسبة الكحول حتى النسبة المسموحة", "التخلص منها فوراً", "إضافة ماء فقط", "تغيير العطر بالكامل"], correct: 0, explain: "لحل مشكلة التركيز العالي، يتم التخفيف لتصبح آمنة." },
    { q: "هل الكحولات تستخدم في الصناعة؟", type: "choice", options: ["نعم، لها أغراض صناعية كثيرة", "لا، تستخدم في الطب فقط", "لا، هي محرمة تماماً", "تستخدم في صناعة الأغذية فقط"], correct: 0, explain: "للكحولات استخدامات صناعية وطبية هامة كالمعقمات." },
    { q: "إذا كان لديك مركب ميثان (CH4)، كيف تحوله نظرياً إلى كحول؟", type: "essay", keywords: ["استبدال", "هيدروجين", "مجموعة", "هيدروكسيل"], explain: "عن طريق استبدال ذرة هيدروجين واحدة بمجموعة هيدروكسيل (-OH) ليصبح ميثانول." },
    { q: "أي من التالي يعتبر كحولاً؟", type: "choice", options: ["CH3OH", "CH4", "CH3Cl", "CO2"], correct: 0, explain: "CH3OH (الميثانول) يحتوي على مجموعة الهيدروكسيل المميزة للكحولات." },
    { q: "ما اسم الكحول الذي يستنتج من الألكان (بنتان)؟", type: "choice", options: ["بنتانول", "بنتانون", "بنتانال", "حمض البنتانويك"], correct: 0, explain: "بإضافة مقطع (ول) يصبح بنتانول." },
    { q: "كيف تؤثر مجموعة الهيدروكسيل على درجة الغليان للكحول؟", type: "essay", keywords: ["تزيد", "ترتفع", "روابط", "هيدروجينية", "تجاذب"], explain: "تزيد من التجاذب بين الجزيئات بسبب تكون الروابط الهيدروجينية، مما يرفع درجة الغليان." },
    { q: "ما هي المشكلة الأساسية في تناول الأدوية التي تحتوي على (بدائل الكحول) لفترة طويلة؟", type: "choice", options: ["تسبب الإدمان", "تسبب الحساسية", "تسبب الصداع", "ليس لها أي أضرار"], correct: 0, explain: "كثرة أو طول استعمال هذه الأدوية قد يسبب الإدمان." },
    { q: "في تسمية الكحولات، ماذا يحدد الرقم الموجود قبل اسم الكحول؟", type: "choice", options: ["موقع مجموعة الهيدروكسيل في السلسلة", "عدد ذرات الكربون", "عدد ذرات الهيدروجين", "نوع الرابطة"], correct: 0, explain: "الرقم يحدد موقع ذرة الكربون التي ترتبط بها مجموعة (-OH)." },
    { q: "لماذا يعتبر التقطير هو العملية المتبعة لفصل الكحول عن الماء؟", type: "choice", options: ["بسبب اختلاف درجات الغليان", "بسبب اختلاف الكثافة", "بسبب اختلاف اللون", "لأن الكحول أخف وزناً"], correct: 0, explain: "التقطير يعتمد دائماً على فروقات درجات الغليان بين المواد." },
    { q: "أي من القطاعات التالية تستفيد بشكل كبير من الكحول كمعقم؟", type: "choice", options: ["القطاع الطبي والصحي", "قطاع البناء", "قطاع التعدين", "قطاع الاتصالات"], correct: 0, explain: "القطاع الطبي يستخدمه بكثرة في تعقيم الجروح وتطهير المستشفيات." },
    { q: "عند وجود الكحول في مثبتات المكياج بنسبة عالية، فإنه يسبب:", type: "choice", options: ["جفاف البشرة وتحسسها", "ترطيب البشرة", "تفتيح البشرة", "إزالة التجاعيد"], correct: 0, explain: "النسب المرتفعة من الكحول تتبخر بسرعة وتسبب الجفاف الشديد للبشرة." },
    { q: "ما هو السبب الذي يجعل الأمهات يخفن من استخدام (الكلونيا) كمعقم ليد الأطفال؟", type: "essay", keywords: ["نسبة", "عالية", "إدمان", "تسمم"], explain: "خوفاً من خطر التسمم أو الإدمان نظراً لارتفاع نسبة الكحول فيها." },
    { q: "بناءً على درس الكحولات، هل الروابط الهيدروجينية أقوى من قوى التشتت في الألكانات؟", type: "choice", options: ["نعم، ولذلك درجة غليان الكحولات أعلى", "لا، قوى التشتت أقوى", "متساويتان في القوة", "لا توجد روابط هيدروجينية في الكحولات"], correct: 0, explain: "الروابط الهيدروجينية قوية جداً مقارنة بقوى التشتت الضعيفة." },
    { q: "إذا أردت صناعة عطر آمن للاستخدام، ماذا يجب عليك فعله بنسبة الكحول؟", type: "choice", options: ["تقليلها إلى النسبة المسموحة طبياً", "زيادتها لتثبيت العطر", "إبقاؤها فوق 90%", "استبدال الكحول بالزيت فقط"], correct: 0, explain: "يجب تخفيف تركيز الكحول لتجنب الأضرار الصحية." },
    { q: "حسب قواعد التسمية، ما هو اسم المركب C2H5OH؟", type: "choice", options: ["إيثانول", "ميثانول", "بروبانول", "بيوتانول"], correct: 0, explain: "يتكون من ذرتي كربون، فهو إيثانول." },
    { q: "إذا تم ترقيم سلسلة كربونية لكحول، من أي جهة نبدأ الترقيم؟", type: "choice", options: ["من الجهة الأقرب لمجموعة الهيدروكسيل", "من أي جهة", "من الجهة الأقرب للتفرع المعقد", "من منتصف السلسلة"], correct: 0, explain: "لكي تأخذ مجموعة الهيدروكسيل أصغر رقم ممكن." },
    { q: "أي من الغازات التالية لا يشكل روابط هيدروجينية مثل الكحولات؟", type: "choice", options: ["الميثان CH4", "الماء H2O", "الأمونيا NH3", "فلوريد الهيدروجين HF"], correct: 0, explain: "الميثان غير قطبي ولا يحتوي على ذرة ذات كهروسالبية عالية مرتبطة بالهيدروجين." },
    { q: "في النهاية، ما هي الرسالة الأهم من دراسة الكحولات؟", type: "essay", keywords: ["فوائد", "أضرار", "وعي", "استخدام"], explain: "الوعي بفوائدها الطبية والصناعية، مع الحذر من أضرارها الكبيرة وإساءة استخدامها." }
];

// Helper to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Generate the final questions array and shuffle options
let questions = [];

for (let i = 0; i < rawQuestions.length; i++) {
    let t = JSON.parse(JSON.stringify(rawQuestions[i])); // Deep copy
    
    // Shuffle options if it's a choice question
    if (t.type === 'choice') {
        let correctText = t.options[t.correct];
        t.options = shuffleArray(t.options);
        t.correct = t.options.indexOf(correctText); // Update correct index
    }
    questions.push(t);
}

// Shuffle the order of questions so it's not the same every time
questions = shuffleArray(questions);
const totalQuestions = questions.length;


// ===== GAME STATE =====
let currentIdx = 0;
let score = 0;
let streak = 0;
let maxStreak = 0;
let correctCount = 0;

// ===== GAME FUNCTIONS =====
function startGame() {
    sound.init();
    sound.play('start');
    switchScreen('start-screen', 'quiz-screen');
    loadQuestion();
}

function switchScreen(from, to) {
    const fromEl = document.getElementById(from);
    const toEl = document.getElementById(to);
    fromEl.style.opacity = '0';
    fromEl.style.transform = 'translateY(-20px) scale(0.98)';
    setTimeout(() => {
        fromEl.classList.remove('active');
        fromEl.style.opacity = '';
        fromEl.style.transform = '';
        toEl.classList.add('active');
    }, 300);
}

function loadQuestion() {
    const q = questions[currentIdx];
    document.getElementById('q-count').innerText = currentIdx + 1;
    document.getElementById('total-q').innerText = totalQuestions;
    document.getElementById('question-text').innerText = q.q;
    document.getElementById('progress-bar').style.width = `${((currentIdx) / totalQuestions) * 100}%`;
    document.getElementById('streak-count').innerText = streak;

    const area = document.getElementById('answer-area');
    area.innerHTML = '';
    area.style.opacity = '0';
    area.style.transform = 'translateY(15px)';

    document.getElementById('feedback-area').style.display = 'none';
    document.getElementById('explanation-content').style.display = 'none';

    if (q.type === 'choice') {
        const grid = document.createElement('div');
        grid.className = 'options-container';
        q.options.forEach((opt, idx) => {
            const div = document.createElement('div');
            div.className = 'option';
            div.innerHTML = `<span class="option-text">${opt}</span>`;
            div.onclick = () => {
                sound.play('click');
                checkChoice(idx);
            };
            grid.appendChild(div);
        });
        area.appendChild(grid);
    } else {
        const textarea = document.createElement('textarea');
        textarea.className = 'essay-input';
        textarea.placeholder = 'اكتبي إجابتك هنا مستعينة بالكلمات العلمية...';
        textarea.id = 'essay-ans';
        const btn = document.createElement('button');
        btn.className = 'game-btn play-btn';
        btn.innerHTML = '<span><i class="fa-solid fa-check-circle"></i> تأكدي من إجابتك</span>';
        btn.onclick = () => {
            sound.play('click');
            checkEssay();
        };
        area.appendChild(textarea);
        area.appendChild(btn);
    }

    setTimeout(() => {
        area.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        area.style.opacity = '1';
        area.style.transform = 'translateY(0)';
    }, 50);
}

function checkChoice(selectedIdx) {
    const q = questions[currentIdx];
    const options = document.querySelectorAll('.option');

    if (selectedIdx === q.correct) {
        options[selectedIdx].classList.add('correct');
        options[selectedIdx].innerHTML += ' <i class="fa-solid fa-circle-check"></i>';
        showFeedback(true);
    } else {
        options[selectedIdx].classList.add('wrong');
        options[selectedIdx].innerHTML += ' <i class="fa-solid fa-circle-xmark"></i>';
        options[q.correct].classList.add('correct');
        options[q.correct].innerHTML += ' <i class="fa-solid fa-circle-check"></i>';
        showFeedback(false);
    }
    disableOptions();
}

function checkEssay() {
    const val = document.getElementById('essay-ans').value;
    const q = questions[currentIdx];
    let found = 0;
    q.keywords.forEach(k => { if (val.includes(k)) found++; });
    if (found >= 1) {
        showFeedback(true);
    } else {
        showFeedback(false, "حاولي استخدام مصطلحات علمية دقيقة.");
    }
    document.querySelector('#answer-area button').disabled = true;
}

function showFeedback(isCorrect, msg = "") {
    if (isCorrect) {
        score += 10;
        streak++;
        correctCount++;
        if (streak > maxStreak) maxStreak = streak;
        sound.play('correct');

        if (streak > 0 && streak % 3 === 0) {
            sound.play('streak');
            showScorePopup(`🔥 ${streak} متتالية!`);
        } else {
            showScorePopup('+10');
        }

        if (typeof confetti !== 'undefined') {
            confetti({
                particleCount: 40,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#4ade80', '#3b82f6', '#facc15']
            });
        }
    } else {
        streak = 0;
        sound.play('wrong');
    }

    document.getElementById('score').innerText = score;
    document.getElementById('streak-count').innerText = streak;

    const area = document.getElementById('feedback-area');
    const msgDiv = document.getElementById('feedback-msg');
    area.style.display = 'block';

    if (isCorrect) {
        msgDiv.innerHTML = `<div class="feedback-correct"><i class="fa-solid fa-star"></i> رائع! إجابة صحيحة</div>`;
    } else {
        msgDiv.innerHTML = `<div class="feedback-wrong"><i class="fa-solid fa-triangle-exclamation"></i> إجابة غير دقيقة</div>${msg ? `<p class="feedback-hint">${msg}</p>` : ''}`;
    }

    document.getElementById('explanation-content').innerText = questions[currentIdx].explain;
    setTimeout(() => {
        document.getElementById('feedback-area').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

function showScorePopup(text) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.innerText = text;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 1000);
}

function toggleExplanation() {
    const content = document.getElementById('explanation-content');
    const isHidden = content.style.display === 'none' || !content.style.display;
    content.style.display = isHidden ? 'block' : 'none';
    sound.play('click');
}

function disableOptions() {
    document.querySelectorAll('.option').forEach(o => o.style.pointerEvents = 'none');
}


function nextQuestion() {
    sound.play('next');
    currentIdx++;
    if (currentIdx < totalQuestions) {
        loadQuestion();
    } else {
        showEnd();
    }
}

function showEnd() {
    switchScreen('quiz-screen', 'end-screen');
    document.getElementById('final-score').innerText = score;
    document.getElementById('final-correct').innerText = correctCount;
    document.getElementById('final-streak').innerText = maxStreak;

    let rankMsg = "";
    let rankIcon = "";
    let maxScore = totalQuestions * 10;
    
    if (score >= maxScore * 0.8) {
        rankMsg = "عبقرية الكيمياء! أداء استثنائي.";
        rankIcon = "fa-crown";
    }
    else if (score >= maxScore * 0.5) {
        rankMsg = "عالمة متميزة! عمل رائع.";
        rankIcon = "fa-flask";
    }
    else {
        rankMsg = "بداية جيدة! يمكنك المحاولة مجدداً.";
        rankIcon = "fa-book-open";
    }

    document.getElementById('final-rank').innerHTML = `<i class="fa-solid ${rankIcon} rank-icon-large"></i><br>${rankMsg}`;

    sound.play('win');
    if (typeof confetti !== 'undefined') {
        const end = Date.now() + 3000;
        const iv = setInterval(() => {
            confetti({ particleCount: 30, spread: 80, origin: { x: Math.random(), y: Math.random() * 0.6 }, colors: ['#4ade80', '#3b82f6', '#facc15', '#f472b6'] });
            if (Date.now() > end) clearInterval(iv);
        }, 250);
    }
}

function toggleSound() {
    const on = sound.toggle();
    document.getElementById('sound-icon').className = on ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
}
