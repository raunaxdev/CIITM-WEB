// Initialize Supabase Client
const SUPABASE_URL = "https://fjiblmcwmdjlzommopml.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaWJsbWN3bWRqbHpvbW1vcG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MjE4NDUsImV4cCI6MjEwNzE5Nzg0NX0.WVv4hwuIlkE5QJdeSyUAWT6xZ_YH7_DHICR6xLomIhE";

let _supabase = null;
let currentServiceType = '';

// ==================== THEME ENGINE ====================
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  const htmlEl = document.documentElement;
  
  if (savedTheme === 'dark') {
    htmlEl.classList.add('dark');
    htmlEl.classList.remove('light');
    updateThemeUI(true);
  } else {
    htmlEl.classList.add('light');
    htmlEl.classList.remove('dark');
    updateThemeUI(false);
  }
}

function toggleTheme() {
  const htmlEl = document.documentElement;
  const isDark = htmlEl.classList.contains('dark');

  if (isDark) {
    htmlEl.classList.remove('dark');
    htmlEl.classList.add('light');
    localStorage.setItem('theme', 'light');
    updateThemeUI(false);
  } else {
    htmlEl.classList.add('dark');
    htmlEl.classList.remove('light');
    localStorage.setItem('theme', 'dark');
    updateThemeUI(true);
  }
}

function updateThemeUI(isDark) {
  const label = document.getElementById('themeLabel');
  if (label) {
    label.innerText = isDark ? 'Dark Mode' : 'Light Mode';
  }
  if (window.lucide) {
    lucide.createIcons();
  }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  
  if (window.lucide) {
    lucide.createIcons();
  }

  if (window.supabase) {
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    loadNoticesAndRepo();
  } else {
    console.error("Supabase SDK script not loaded!");
  }

  const searchInput = document.getElementById('repoSearch');
  if (searchInput) {
    searchInput.addEventListener('input', filterRepository);
  }
});

function toggleModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.toggle('hidden');
  }
}

// 1. Fetch Repository & Notices with Upload Metadata
async function loadNoticesAndRepo() {
  const noticeBoard = document.getElementById('noticeBoardList');
  const repoList = document.getElementById('repoList');

  if (!_supabase) {
    if (noticeBoard) noticeBoard.innerHTML = `<p class="text-xs text-red-500 font-medium">Database connection failed.</p>`;
    if (repoList) repoList.innerHTML = `<p class="text-xs text-red-500 font-medium">Database connection failed.</p>`;
    return;
  }

  try {
    const { data: notices, error } = await _supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase Error:", error);
      if (noticeBoard) noticeBoard.innerHTML = `<p class="text-xs text-slate-500 dark:text-slate-400 font-medium">No active notices found in database.</p>`;
      if (repoList) repoList.innerHTML = `<p class="text-xs text-slate-500 dark:text-slate-400 font-medium">No documents found in repository.</p>`;
      return;
    }

    if (notices && notices.length > 0) {
      noticeBoard.innerHTML = notices.map(item => {
        const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently';
        return `
          <div class="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs space-y-1">
            <span class="text-sky-700 dark:text-sky-400 font-bold">[${item.target_semester}]</span>
            <p class="text-slate-800 dark:text-slate-200 font-semibold">${item.title}</p>
            <p class="text-[10px] text-slate-400">${dateStr}, open document</p>
          </div>
        `;
      }).join('');

      repoList.innerHTML = notices.map(item => {
        const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
        return `
          <div class="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center text-xs">
            <div class="space-y-0.5">
              <span class="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
                <i data-lucide="file-text" class="w-4 h-4 text-sky-600 dark:text-sky-400"></i> ${item.title}
              </span>
              <p class="text-slate-500 dark:text-slate-400 text-[11px]">Uploaded for <strong>${item.target_semester}</strong> ${dateStr ? `on ${dateStr}` : ''}</p>
            </div>
            <a href="${item.pdf_url}" target="_blank" class="px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm shrink-0">View Document</a>
          </div>
        `;
      }).join('');

      if (window.lucide) lucide.createIcons();
    } else {
      if (noticeBoard) noticeBoard.innerHTML = `<p class="text-xs text-slate-500 dark:text-slate-400 font-medium">No active notices found in database.</p>`;
      if (repoList) repoList.innerHTML = `<p class="text-xs text-slate-500 dark:text-slate-400 font-medium">No documents found in repository.</p>`;
    }
  } catch (err) {
    console.error("Execution error:", err);
  }
}

// 2. Real-time Search Engine
function filterRepository() {
  const query = document.getElementById('repoSearch').value.toLowerCase();
  const repoItems = document.querySelectorAll('#repoList > div');

  repoItems.forEach(item => {
    const text = item.innerText.toLowerCase();
    item.style.display = text.includes(query) ? 'flex' : 'none';
  });
}

// 3. Category Pill Filter Logic
function filterCategory(category, btnElement) {
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('bg-sky-900', 'text-white');
    btn.classList.add('bg-slate-100', 'text-slate-700', 'dark:bg-slate-800', 'dark:text-slate-300');
  });

  if (btnElement) {
    btnElement.classList.remove('bg-slate-100', 'text-slate-700', 'dark:bg-slate-800', 'dark:text-slate-300');
    btnElement.classList.add('bg-sky-900', 'text-white');
  }

  const items = document.querySelectorAll('#repoList > div');
  items.forEach(item => {
    const text = item.innerText.toLowerCase();
    if (category === 'all') {
      item.style.display = 'flex';
    } else if (category === 'results' && text.includes('result')) {
      item.style.display = 'flex';
    } else if (category === 'circulars' && (text.includes('notice') || text.includes('circular') || text.includes('letter') || text.includes('exam'))) {
      item.style.display = 'flex';
    } else if (category === 'study' && (text.includes('syllabus') || text.includes('material') || text.includes('notes') || text.includes('assignment'))) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

// 4. Student Auth & Transition
async function handleStudentAuth() {
  const email = document.getElementById('studentEmail').value;
  const pass = document.getElementById('studentPass').value;

  if (!email || !pass) {
    alert("Please enter both email and password.");
    return;
  }

  const { data: student, error } = await _supabase
    .from('students')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !student) {
    alert("Invalid credentials or account does not exist!");
    return;
  }

  if (student.is_first_login) {
    if (student.temp_password === pass) {
      document.getElementById('resetUserEmail').value = email;
      document.getElementById('studentLoginForm').classList.add('hidden');
      document.getElementById('passwordResetForm').classList.remove('hidden');
    } else {
      alert("Invalid temporary password!");
    }
  } else {
    toggleModal('studentModal');
    const activeEmailEl = document.getElementById('activeStudentEmail');
    if (activeEmailEl) activeEmailEl.innerText = email;
    toggleModal('studentDashboardModal');
    loadStudentApplications(email);
  }
}

// 5. Password Reset
async function updatePassword() {
  const email = document.getElementById('studentEmail').value;
  const newPass = document.getElementById('newPass').value;
  const confirmPass = document.getElementById('confirmPass').value;

  if (newPass !== confirmPass || newPass.length < 6) {
    alert("Passwords must match and be at least 6 characters long.");
    return;
  }

  const { error } = await _supabase
    .from('students')
    .update({ temp_password: newPass, is_first_login: false })
    .eq('email', email);

  if (!error) {
    alert("Password updated successfully! Account is now activated.");
    location.reload();
  } else {
    alert("Error updating password: " + error.message);
  }
}

// 6. Student Services Engine
function openServiceForm(serviceType) {
  currentServiceType = serviceType;
  const formBox = document.getElementById('serviceFormBox');
  const title = document.getElementById('serviceFormTitle');
  
  const labels = {
    'absence': 'Application for Absence / Leave',
    'internship': 'Apply for Internship Approval',
    'grievance': 'Grievance Redressal Issue'
  };

  if (title) title.innerText = labels[serviceType] || 'Submit Application';
  if (formBox) formBox.classList.remove('hidden');
}

function closeServiceForm() {
  const formBox = document.getElementById('serviceFormBox');
  if (formBox) formBox.classList.add('hidden');
  document.getElementById('serviceFormText').value = '';
}

async function submitStudentApplication() {
  const details = document.getElementById('serviceFormText').value;
  const activeEmail = document.getElementById('activeStudentEmail').innerText;

  if (!details.trim()) {
    alert("Please provide details before submitting.");
    return;
  }

  const { error } = await _supabase.from('applications').insert([
    {
      student_email: activeEmail,
      service_type: currentServiceType,
      details: details,
      status: 'PENDING'
    }
  ]);

  if (!error) {
    alert("Application submitted successfully!");
    closeServiceForm();
    loadStudentApplications(activeEmail);
  } else {
    alert("Error submitting application: " + error.message);
  }
}

async function loadStudentApplications(studentEmail) {
  const trackerList = document.getElementById('studentAppTrackerList');
  if (!trackerList || !_supabase) return;

  const { data: apps, error } = await _supabase
    .from('applications')
    .select('*')
    .eq('student_email', studentEmail)
    .order('created_at', { ascending: false });

  if (error || !apps || apps.length === 0) {
    trackerList.innerHTML = `<p class="text-xs text-slate-500 dark:text-slate-400 font-medium">No submitted applications found.</p>`;
    return;
  }

  trackerList.innerHTML = apps.map(app => `
    <div class="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex justify-between items-center text-xs">
      <div>
        <span class="font-bold text-slate-800 dark:text-slate-200 uppercase">${app.service_type}</span>
        <p class="text-slate-600 dark:text-slate-400 mt-1">${app.details}</p>
      </div>
      <span class="px-2.5 py-1 rounded text-[10px] font-bold ${
        app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
        app.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
        'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
      }">${app.status}</span>
    </div>
  `).join('');
}

function switchStudentTab(tabId) {
  document.querySelectorAll('.student-tab-content').forEach(el => el.classList.add('hidden'));
  const target = document.getElementById(tabId);
  if (target) target.classList.remove('hidden');

  if (tabId === 'appTrackerTab') {
    const activeEmail = document.getElementById('activeStudentEmail').innerText;
    loadStudentApplications(activeEmail);
  }
}

// 7. Admission Lead Capture
async function submitAdmissionLead() {
  const name = document.getElementById('admName').value;
  const email = document.getElementById('admEmail').value;
  const mobile = document.getElementById('admMobile').value;
  const course = document.getElementById('admCourse').value;

  if (!name || !email || !mobile) {
    alert("Please fill all required fields.");
    return;
  }

  const { error } = await _supabase.from('applications').insert([
    {
      student_email: email,
      service_type: `ADMISSION_LEAD (${course})`,
      details: `Applicant Name: ${name}, Phone: ${mobile}, Course: ${course}`,
      status: 'NEW_LEAD'
    }
  ]);

  if (!error) {
    alert("Thank you! The CIITM Admissions desk will contact you shortly.");
    toggleModal('admissionModal');
  } else {
    alert("Error submitting form: " + error.message);
  }
}

// 8. Faculty Panel Engine & Direct File Upload
function switchFacultyTab(tabId) {
  document.querySelectorAll('.faculty-tab-content').forEach(el => el.classList.add('hidden'));
  const target = document.getElementById(tabId);
  if (target) target.classList.remove('hidden');
}

async function generateStudentAccount() {
  const name = document.getElementById('facStudentName').value;
  const course = document.getElementById('facStudentCourse').value;
  const sem = parseInt(document.getElementById('facStudentSem').value);

  if (!name) {
    alert("Please enter student full name.");
    return;
  }

  const cleanName = name.toLowerCase().replace(/\s+/g, '');
  const email = `${cleanName}@ciitm.in`;
  const tempPass = 'i2^' + Math.random().toString(36).slice(-6) + '@nc7B';

  const { error } = await _supabase.from('students').insert([
    {
      full_name: name,
      email: email,
      course: course,
      semester: sem,
      temp_password: tempPass,
      is_first_login: true
    }
  ]);

  if (!error) {
    document.getElementById('outEmail').innerText = email;
    document.getElementById('outTempPass').innerText = tempPass;
    document.getElementById('credentialResultCard').classList.remove('hidden');
  } else {
    alert("Error creating account: " + error.message);
  }
}

async function publishNotice() {
  const title = document.getElementById('noticeTitle').value;
  const sem = document.getElementById('noticeTargetSem').value;
  const fileInput = document.getElementById('noticeFile');
  let pdfUrl = document.getElementById('noticePdfUrl').value;

  if (!title) {
    alert("Please enter Notice Subject / Title.");
    return;
  }

  if (fileInput && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `circulars/${fileName}`;

    document.getElementById('noticeSubmitBtn').innerText = "Uploading File...";

    const { error: uploadError } = await _supabase.storage
      .from('notices')
      .upload(filePath, file);

    if (uploadError) {
      alert("Storage upload error: " + uploadError.message + "\nMake sure 'notices' bucket is Public.");
      document.getElementById('noticeSubmitBtn').innerText = "Publish Circular";
      return;
    }

    const { data: urlData } = _supabase.storage
      .from('notices')
      .getPublicUrl(filePath);

    pdfUrl = urlData.publicUrl;
  }

  if (!pdfUrl) {
    alert("Please select a file to upload or enter a URL.");
    return;
  }

  const { error } = await _supabase.from('notices').insert([
    { title: title, target_semester: sem, pdf_url: pdfUrl }
  ]);

  if (!error) {
    alert("Circular uploaded and published successfully!");
    location.reload();
  } else {
    alert("Error publishing notice: " + error.message);
  }
}

// 9. Result Generator Wizard
let resultRowsCount = 0;

function goToResultStep2() {
  const subject = document.getElementById('resSubject').value;
  if (!subject) {
    alert("Please enter subject name.");
    return;
  }

  document.getElementById('resultStep1').classList.add('hidden');
  document.getElementById('resultStep2').classList.remove('hidden');

  if (resultRowsCount === 0) {
    addResultRow();
    addResultRow();
  }
}

function goToResultStep1() {
  document.getElementById('resultStep2').classList.add('hidden');
  document.getElementById('resultStep1').classList.remove('hidden');
}

function addResultRow() {
  resultRowsCount++;
  const tbody = document.getElementById('resultMarksTableBody');
  const tr = document.createElement('tr');
  tr.id = `row-${resultRowsCount}`;
  tr.className = "hover:bg-slate-50 dark:hover:bg-slate-900/50";

  tr.innerHTML = `
    <td class="p-3 text-slate-500 font-medium">${resultRowsCount}</td>
    <td class="p-3"><input type="text" placeholder="ENR-2026-0${resultRowsCount}" class="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-2 py-1 w-full text-slate-800 dark:text-slate-200"></td>
    <td class="p-3"><input type="text" placeholder="Student Name" class="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-2 py-1 w-full text-slate-800 dark:text-slate-200"></td>
    <td class="p-3"><input type="number" oninput="updateRowColor(${resultRowsCount})" id="marks-${resultRowsCount}" placeholder="Marks" class="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-2 py-1 w-20 text-slate-800 dark:text-slate-200"></td>
    <td class="p-3 text-center"><input type="checkbox" onchange="updateRowColor(${resultRowsCount})" id="absent-${resultRowsCount}"></td>
    <td class="p-3"><span id="badge-${resultRowsCount}" class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">PENDING</span></td>
  `;

  tbody.appendChild(tr);
}

function updateRowColor(rowId) {
  const marksInput = document.getElementById(`marks-${rowId}`).value;
  const absentCheck = document.getElementById(`absent-${rowId}`).checked;
  const badge = document.getElementById(`badge-${rowId}`);

  if (absentCheck) {
    badge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30";
    badge.innerText = "ABSENT";
  } else if (marksInput !== "") {
    const marks = parseFloat(marksInput);
    if (marks < 20) {
      badge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30";
      badge.innerText = "FAIL (<20)";
    } else {
      badge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30";
      badge.innerText = "PASS";
    }
  }
}

async function compileAndPublishResult() {
  const sem = document.getElementById('resSemester').value;
  const subject = document.getElementById('resSubject').value;

  const { error } = await _supabase.from('notices').insert([
    {
      title: `[RESULT] ${sem} - ${subject}`,
      target_semester: sem,
      pdf_url: "#"
    }
  ]);

  if (!error) {
    document.getElementById('resultStep2').classList.add('hidden');
    document.getElementById('resultStep3').classList.remove('hidden');
  }
}