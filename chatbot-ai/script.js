// Variabel global untuk menyimpan nama panggilan user
let userNickname = "Developer"; 

// Logika Popup Pengisian Nama
const modal = document.getElementById('nameModal');
const nicknameInput = document.getElementById('nicknameInput');
const startChatBtn = document.getElementById('startChatBtn');

// Fokuskan kursor ke input nama saat halaman terbuka
window.addEventListener('DOMContentLoaded', () => {
    nicknameInput.focus();
});

// Aksi saat tombol "Mulai Obrolan" diklik
startChatBtn.addEventListener('click', initChat);
nicknameInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') initChat();
});

function initChat() {
    const inputName = nicknameInput.value.trim();
    if (inputName === '') {
        nicknameInput.classList.add('border-red-500');
        return;
    }
    
    userNickname = inputName; 

    // Hilangkan popup
    modal.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => { modal.style.display = 'none'; }, 500);

    const chatBox = document.getElementById('chatBox');
    const welcomeWrapper = document.createElement('div');
    // justify-start memaksa pesan AI berada rapat di sebelah KIRI
    welcomeWrapper.className = 'flex justify-start w-full animate-fade-in';
    welcomeWrapper.innerHTML = `
        <div class="max-w-[80%] dark:text-slate-200 text-slate-800 text-sm md:text-base leading-relaxed p-4 rounded-2xl bg-slate-900/40 border border-slate-900">
            Halo ${userNickname}! Saya adalah Nexa yang Dibuat oleh Kusuma WebDev. Saya siap membantu kamu melakukan debugging kode atau menjawab pertanyaan analisis secara real-time. Apa target proyek kita hari ini😹?
        </div>
    `;
    chatBox.appendChild(welcomeWrapper);
}

// --- LOGIKA CORE PENGIRIMAN CHAT + FILE UPLOAD ---
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const filePreview = document.getElementById('filePreview');
const fileName = document.getElementById('fileName');
const cancelFileBtn = document.getElementById('cancelFileBtn');

let attachedFileBase64 = null;
let attachedFileMime = null;

// Klik tombol klip kertas memicu input file asli
uploadBtn.addEventListener('click', () => fileInput.click());

// Menangkap event saat user memilih file/gambar
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    fileName.textContent = file.name;
    filePreview.classList.remove('hidden');

    const reader = new FileReader();
    reader.onload = function(event) {
        // Ambil data base64 murni tanpa teks header data:image/jpeg;base64,
        attachedFileBase64 = event.target.result.split(',')[1];
        attachedFileMime = file.type;
    };
    reader.readAsDataURL(file);
});

// Membatalkan lampiran file
cancelFileBtn.addEventListener('click', resetFileAttachment);

function resetFileAttachment() {
    fileInput.value = '';
    attachedFileBase64 = null;
    attachedFileMime = null;
    filePreview.classList.add('hidden');
}

document.getElementById('sendBtn').addEventListener('click', sendMessage);
document.getElementById('userInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const inputElement = document.getElementById('userInput');
    const messageText = inputElement.value.trim();
    
    // Cek jika tidak ada teks dan tidak ada file, batalkan kirim
    if (messageText === '' && !attachedFileBase64) return;

    const chatBox = document.getElementById('chatBox');

    // 1. Tampilan Pesan User (Rapat KANAN)
    const userWrapper = document.createElement('div');
    userWrapper.className = 'flex justify-end w-full animate-fade-in';
    
    let userContent = `<div class="max-w-[80%] p-4 rounded-2xl bg-slate-800/90 text-slate-100 border border-slate-700/50 text-sm md:text-base leading-relaxed shadow-md space-y-2">`;
    if (attachedFileBase64 && attachedFileMime.startsWith('image/')) {
        userContent += `<img src="data:${attachedFileMime};base64,${attachedFileBase64}" class="max-w-xs rounded-xl max-h-48 mb-2 border border-white/20">`;
    } else if (attachedFileBase64) {
        userContent += `<div class="text-xs bg-black/20 p-2 rounded-xl border border-white/10 mb-2"><i class="fas fa-file"></i> ${fileName.textContent}</div>`;
    }
    userContent += `<span>${messageText}</span></div>`;
    userWrapper.innerHTML = userContent;
    chatBox.appendChild(userWrapper);
    
    // Siapkan data payload sebelum file di-reset
    const payloadData = {
        message: messageText,
        file_base64: attachedFileBase64,
        file_mime: attachedFileMime
    };

    inputElement.value = '';
    resetFileAttachment();
    chatBox.scrollTop = chatBox.scrollHeight;

    // 2. Tampilan Efek Loading Balasan AI (Rapat KIRI)
    const botWrapper = document.createElement('div');
    botWrapper.className = 'flex justify-start w-full animate-fade-in relative group';
    const uniqueId = 'ai-' + Date.now();
    botWrapper.innerHTML = `
        <div id="${uniqueId}" class="max-w-[80%] dark:text-slate-200 text-slate-800 text-sm md:text-base leading-relaxed p-4 rounded-2xl bg-slate-900/40 border border-slate-900">
            <span class="flex items-center gap-1.5 text-slate-500 italic font-mono text-xs"><i class="fas fa-circle-notch animate-spin text-emerald-400"></i> thinking...</span>
        </div>
    `;
    chatBox.appendChild(botWrapper);
    chatBox.scrollTop = chatBox.scrollHeight;

    // 3. Kirim data ke Flask Python Backend
    fetch('https://deri.pythonanywhere.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadData)
    })
    .then(response => response.json())
    .then(data => {
        const bubbleTarget = document.getElementById(uniqueId);
        bubbleTarget.innerHTML = ''; 

        let fullText = data.reply;
        let index = 0;
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'absolute -bottom-6 left-0 text-[10px] font-mono bg-transparent hover:text-emerald-400 transition-all cursor-pointer opacity-0 group-hover:opacity-100 text-slate-600';
        copyBtn.innerHTML = '<i class="far fa-copy"></i> Copy Teks';
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(fullText);
            copyBtn.innerHTML = '<i class="fas fa-check text-emerald-400"></i> Copied!';
            setTimeout(() => copyBtn.innerHTML = '<i class="far fa-copy"></i> Copy Teks', 2000);
        };
        bubbleTarget.parentElement.appendChild(copyBtn);

        function typeWriter() {
            if (index < fullText.length) {
                if (fullText.charAt(index) === '\n') {
                    bubbleTarget.innerHTML += '<br>';
                } else {
                    bubbleTarget.innerHTML += fullText.charAt(index);
                }
                index++;
                chatBox.scrollTop = chatBox.scrollHeight;
                setTimeout(typeWriter, 10); 
            }
        }
        typeWriter();
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById(uniqueId).innerHTML = `
            <span class="text-red-500 text-xs font-mono"><i class="fas fa-exclamation-triangle"></i> SERVER_OFFLINE</span>
        `;
    });
}