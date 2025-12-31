const content = {
    ar: {
        home: "الرئيسية",
        signup: "إنشاء حساب",
        login: "دخول",
        contact: "اتصل بنا",
        title: "مرحباً بك في المستقبل",
        text: "منصتك المتطورة لرفع ومشاركة الملفات بأمان وسرعة.",
        drop: "اسحب الملفات هنا أو اضغط للرفع",
        btn: "رفع الملف الآن",
        uploading: "جاري الرفع...",
        success: "تمت العملية بنجاح!",
        error: "حدث خطأ، حاول مرة أخرى.",
        selectFile: "الرجاء اختيار ملف.",
        loginTitle: "تسجيل الدخول",
        user: "اسم المستخدم",
        pass: "كلمة المرور",
        btnContinue: "دخول",
        noAccount: "جديد هنا؟ ",
        createAccount: "انضم إلينا",
        supportTitle: "مركز الدعم",
        signupTitle: "انضم إلى المجتمع",
        email: "البريد الإلكتروني",
        confirm: "تأكيد كلمة المرور",
        btnRegister: "إنشاء الحساب",
        haveAccount: "لديك حساب؟ ",
        loginLink: "سجل دخولك",
        dashboardTitle: "أحدث الملفات",
        fileName: "الاسم",
        fileSize: "الحجم",
        fileDate: "التاريخ",
        loginRequired: "يرجى تسجيل الدخول للوصول لهذه الميزة.",
        logout: "خروج"
    },
    en: {
        home: "Home",
        signup: "Sign Up",
        login: "Login",
        contact: "Contact",
        title: "Welcome to the Future",
        text: "Your advanced platform for secure and fast file sharing.",
        drop: "Drag files here or click to upload",
        btn: "Upload Now",
        uploading: "Uploading...",
        success: "Operation successful!",
        error: "An error occurred.",
        selectFile: "Please select a file.",
        loginTitle: "Login",
        user: "Username",
        pass: "Password",
        btnContinue: "Sign In",
        noAccount: "New here? ",
        createAccount: "Join Us",
        supportTitle: "Support Center",
        signupTitle: "Join the Community",
        email: "Email Address",
        confirm: "Confirm Password",
        btnRegister: "Create Account",
        haveAccount: "Already a member? ",
        loginLink: "Sign In",
        dashboardTitle: "Recent Files",
        fileName: "Name",
        fileSize: "Size",
        fileDate: "Date",
        loginRequired: "Please login to access this feature.",
        logout: "Logout"
    }
};

function changeLanguage(lang) {
    localStorage.setItem('preferredLang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    const elements = {
        'navHome': 'home', 'navSignup': 'signup', 'navLogin': 'login', 'navContact': 'contact',
        'welcomeTitle': 'title', 'welcomeText': 'text', 'dropText': 'drop', 'btnUpload': 'btn',
        'loginTitle': 'loginTitle', 'signupTitle': 'signupTitle', 'supportTitle': 'supportTitle',
        'lblUser': 'user', 'lblPass': 'pass', 'lblEmail': 'email', 'lblConfirm': 'confirm',
        'btnSubmit': 'btnContinue', 'dashboardTitle': 'dashboardTitle',
        'thName': 'fileName', 'thSize': 'fileSize', 'thDate': 'fileDate'
    };

    for (const [id, key] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) el.innerText = content[lang][key] || content[lang].btnRegister;
    }

    // Handle special cases
    const footerText = document.getElementById('footerText');
    if (footerText) {
        p.childNodes[0].nodeValue = content[lang].noAccount || content[lang].haveAccount;
        const link = document.getElementById('footerLink');
        if (link) link.innerText = content[lang].createAccount || content[lang].loginLink;
    }
    
    const langSelect = document.getElementById('langSelect');
    if(langSelect) langSelect.value = lang;

    // Dynamic Auth Elements
    const navLogout = document.getElementById('navLogout');
    if(navLogout) navLogout.innerText = content[lang].logout;
}

// Apply language on load
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('preferredLang') || 'ar';
    changeLanguage(savedLang);
});