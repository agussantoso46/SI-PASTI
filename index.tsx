import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Brain, FileText, Lock, LogIn, LogOut, Plus, Trash2, 
  Download, Printer, Copy, RefreshCw, Edit3, ArrowLeft, Check, 
  Search, Eye, EyeOff, HelpCircle, FileCheck, Award, Layers, 
  Settings, ChevronRight, AlertCircle, Sparkles, User, Calendar, 
  School, CheckCircle2, Bookmark, FileSpreadsheet, ExternalLink
} from 'lucide-react';

const SCHOOL_LOGO = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 450'><rect width='500' height='450' fill='%23000000'/><defs><linearGradient id='sunRays' x1='0%' y1='100%' x2='0%' y2='0%'><stop offset='0%' stop-color='%23ff5500'/><stop offset='60%' stop-color='%23ffaa00'/><stop offset='100%' stop-color='%23ffee00'/></linearGradient><linearGradient id='ribbonGrad' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' stop-color='%23ea580c'/><stop offset='50%' stop-color='%23c2410c'/><stop offset='100%' stop-color='%237c2d12'/></linearGradient></defs><g fill='url(%23sunRays)'><path d='M250 260 L100 240 L80 200 Z'/><path d='M250 260 L120 180 L100 145 Z'/><path d='M250 260 L150 130 L135 95 Z'/><path d='M250 260 L190 90 L180 55 Z'/><path d='M250 260 L235 65 L235 35 Z'/><path d='M250 260 L265 35 L265 65 Z'/><path d='M250 260 L320 55 L310 90 Z'/><path d='M250 260 L365 95 L350 130 Z'/><path d='M250 260 L400 145 L380 180 Z'/><path d='M250 260 L420 200 L400 240 Z'/></g><path d='M250 260 C 200 220, 100 220, 50 250 C 150 265, 220 280, 250 295 C 280 280, 350 265, 450 250 C 400 220, 300 220, 250 260 Z' fill='url(%23sunRays)' opacity='0.8'/><polygon points='250,15 255,27 268,27 257,35 261,48 250,40 239,48 243,35 232,27 245,27' fill='%23ffd700'/><path d='M245,280 L245,60 L250,30 L255,60 L255,280 Z' fill='%23ea580c'/><path d='M242,120 L250,80 L258,120 L250,140 Z' fill='%23fb923c'/><path d='M60 265 Q250 310 440 265 L440 295 Q250 340 60 295 Z' fill='url(%23ribbonGrad)'/><text x='250' y='360' font-family='Arial, sans-serif' font-size='30' font-weight='900' fill='%23ea580c' text-anchor='middle' letter-spacing='1'>DHARMA TANJUNG 1</text><text x='250' y='390' font-family='Arial, sans-serif' font-size='14' font-weight='bold' fill='%234b5563' text-anchor='middle'>UPTD SEKOLAH DASAR NEGERI</text><text x='250' y='410' font-family='Arial, sans-serif' font-size='13' font-weight='bold' fill='%23374151' text-anchor='middle'>KEC. CAMPLONG - SAMPANG</text></svg>";

const SUBJECTS = [
  "Matematika",
  "Pendidikan Pancasila",
  "Bahasa Indonesia",
  "IPAS",
  "Seni Budaya",
  "Bahasa Madura",
  "PJOK",
  "Bahasa Inggris",
  "Pendidikan Agama Islam",
  "Koding dan Kecerdasan Artifisial (KKA)"
];

const QUESTION_TYPES = [
  { id: 'pg', name: 'Pilihan Ganda', desc: '1 jawaban benar (opsi A, B, C, D)' },
  { id: 'pgk', name: 'Pilihan Ganda Kompleks', desc: 'Lebih dari 1 jawaban benar' },
  { id: 'bs', name: 'Benar atau Salah', desc: 'Pernyataan bernilai Benar/Salah' },
  { id: 'jodoh', name: 'Menjodohkan', desc: 'Pasangan soal dan jawaban' },
  { id: 'isian', name: 'Isian', desc: 'Jawaban singkat dan padat' },
  { id: 'uraian', name: 'Uraian', desc: 'Penjelasan & langkah penyelesaian' },
  { id: 'hots', name: 'HOTS', desc: 'Penalaran & pemecahan masalah' }
];

export default function App() {
  // Navigation & Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'create', 'result', 'history', 'guide'

  // Settings & Custom API Key
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem('sipasti_gemini_key') || '');
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    teacherName: 'AGUS SANTOSO, M.Pd.',
    grade: 'Kelas 1',
    phase: 'Fase A',
    semester: 'Semester Ganjil',
    subject: 'Matematika',
    assessmentType: 'Penilaian Harian',
    difficulty: 'Sedang',
    topic: 'Bilangan Cacah sampai 20',
    learningObjective: 'Siswa dapat mengurutkan dan membandingkan bilangan cacah dari 1 sampai 20 dengan benar.',
    questionCount: 5,
    selectedTypes: ['pg', 'isian', 'uraian'],
    schoolYear: '2026/2027',
    assessmentDate: new Date().toISOString().split('T')[0],
    additionalInstruction: 'Buat soal kontekstual kehidupan sehari-hari anak SD, gunakan bahasa ramah anak.'
  });

  // AI Generation & Result State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [generatedResult, setGeneratedResult] = useState(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [searchHistory, setSearchHistory] = useState('');
  const [toast, setToast] = useState(null);

  // Auto-update Phase when Grade Changes
  useEffect(() => {
    const gradeNum = parseInt(formData.grade.replace('Kelas ', ''));
    if (gradeNum === 1 || gradeNum === 2) setFormData(prev => ({ ...prev, phase: 'Fase A' }));
    else if (gradeNum === 3 || gradeNum === 4) setFormData(prev => ({ ...prev, phase: 'Fase B' }));
    else if (gradeNum === 5 || gradeNum === 6) setFormData(prev => ({ ...prev, phase: 'Fase C' }));
  }, [formData.grade]);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sipasti_history');
    if (saved) {
      try {
        setHistoryList(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput.trim() === 'tanjung1') {
      setIsAuthenticated(true);
      setLoginError('');
      showToast('Selamat Datang di SI PASTI UPTD SDN DHARMA TANJUNG 1', 'success');
    } else {
      setLoginError('PIN yang Anda masukkan salah. Silakan coba kembali.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput('');
    setActiveTab('dashboard');
  };

  const handleSaveApiKey = (key) => {
    setCustomApiKey(key);
    localStorage.setItem('sipasti_gemini_key', key);
    setShowKeyModal(false);
    showToast('API Key Gemini berhasil disimpan', 'success');
  };

  const handleGenerateQuestions = async () => {
    if (!formData.topic.trim()) {
      showToast('Materi / Ruang Lingkup harus diisi!', 'error');
      return;
    }
    if (!formData.learningObjective.trim()) {
      showToast('Tujuan Pembelajaran harus diisi!', 'error');
      return;
    }
    if (formData.questionCount <= 0) {
      showToast('Jumlah soal harus lebih dari 0!', 'error');
      return;
    }
    if (formData.selectedTypes.length === 0) {
      showToast('Pilih minimal satu bentuk soal!', 'error');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('AI sedang menganalisis materi dan tujuan pembelajaran...');

    const systemPrompt = `Anda adalah asisten ahli penyusunan asesmen pendidikan sekolah dasar di Indonesia. Buatlah instrumen soal berdasarkan pengaturan yang diberikan guru.
Patuhi ketentuan berikut:
1. Gunakan bahasa Indonesia yang jelas, komunikatif, dan sesuai tingkat perkembangan siswa SD.
2. Sesuaikan kedalaman materi dengan kelas dan fase yang dipilih.
3. Gunakan materi dan tujuan pembelajaran sebagai acuan utama.
4. Sesuaikan soal dengan jenis asesmen dan tingkat kesulitan.
5. Pastikan setiap soal memiliki jawaban yang benar atau kriteria jawaban yang jelas.
6. Hindari pertanyaan ambigu, pilihan jawaban yang menyesatkan, dan informasi yang tidak relevan.
7. Untuk soal pilihan ganda, gunakan pilihan A, B, C, dan D serta satu jawaban benar.
8. Untuk pilihan ganda kompleks, cantumkan semua jawaban yang benar dan jelaskan instruksinya.
9. Untuk soal menjodohkan, sediakan daftar soal dan pilihan pasangan yang jelas.
10. Untuk soal uraian, berikan contoh jawaban dan pedoman penskoran.
11. Untuk soal HOTS, gunakan situasi kontekstual yang memerlukan penalaran sesuai usia siswa.
12. Buat kisi-kisi yang menunjukkan nomor soal, tujuan/indikator, materi, bentuk soal, dan tingkat kognitif.
13. Buat kunci jawaban terpisah.
14. Pastikan jumlah soal tepat ${formData.questionCount} soal.
15. Kembalikan HANYA format JSON valid tanpa teks markdown pembuka/penutup.`;

    const userQuery = `Buatkan ${formData.questionCount} soal asesmen untuk SD dengan rincian:
- Sekolah: UPTD SDN DHARMA TANJUNG 1
- Guru: ${formData.teacherName}
- Kelas: ${formData.grade} (${formData.phase})
- Semester: ${formData.semester}
- Mata Pelajaran: ${formData.subject}
- Jenis Asesmen: ${formData.assessmentType}
- Tingkat Kesulitan: ${formData.difficulty}
- Materi/Ruang Lingkup: ${formData.topic}
- Tujuan Pembelajaran: ${formData.learningObjective}
- Bentuk Soal Ditentukan: ${formData.selectedTypes.map(t => QUESTION_TYPES.find(q=>q.id===t)?.name).join(', ')}
- Tahun Pelajaran: ${formData.schoolYear}
- Tanggal Asesmen: ${formData.assessmentDate}
- Instruksi Tambahan Guru: ${formData.additionalInstruction}

RESPON HARUS DALAM FORMAT JSON DENGAN STRUKTUR:
{
  "title": "NAMA ASESMEN / JUDUL SOAL",
  "instructions": "Petunjuk umum pengerjaan soal untuk siswa SD",
  "questions": [
    {
      "number": 1,
      "type": "Pilihan Ganda | Pilihan Ganda Kompleks | Benar atau Salah | Menjodohkan | Isian | Uraian | HOTS",
      "question": "Teks pertanyaan soal",
      "options": ["A. Opsi 1", "B. Opsi 2", "C. Opsi 3", "D. Opsi 4"],
      "pairs": [{"item": "Pertanyaan A", "match": "Pasangan A"}],
      "answerKey": "Kunci jawaban / alternatif jawaban lengkap",
      "indicator": "Indikator pembelajaran / kognitif yang diukur",
      "cognitiveLevel": "C1 / C2 / C3 / C4 (HOTS) / C5 / C6",
      "score": 10
    }
  ],
  "scoringRubric": {
    "summary": "Penjelasan umum penskoran",
    "totalMaxScore": 100,
    "formula": "Nilai Akhir = (Total Skor Perolehan / Total Skor Maksimal) x 100"
  }
}`;

    try {
      setTimeout(() => setLoadingMessage('AI sedang mengonstruksi butir soal & kunci jawaban...'), 1200);
      
      const apiKey = customApiKey || "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userQuery }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: Silakan periksa koneksi atau API Key Anda.`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!rawText) throw new Error("Format respons AI tidak valid.");

      const parsedData = JSON.parse(rawText);
      
      const fullResult = {
        id: 'SOAL-' + Date.now(),
        createdAt: new Date().toISOString(),
        metadata: { ...formData },
        generated: parsedData
      };

      setGeneratedResult(fullResult);
      saveToHistory(fullResult);
      setActiveTab('result');
      showToast('Soal berhasil disusun oleh AI!', 'success');

    } catch (err) {
      console.warn("API Error, using fallback simulation:", err);
      const fallbackResult = generateFallbackQuestions(formData);
      setGeneratedResult(fallbackResult);
      saveToHistory(fallbackResult);
      setActiveTab('result');
      showToast('Soal berhasil dihasilkan (Modul Simulasi Aktif)', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackQuestions = (config) => {
    const questionList = [];
    const count = parseInt(config.questionCount) || 5;

    for (let i = 1; i <= count; i++) {
      const typeIndex = (i - 1) % config.selectedTypes.length;
      const typeCode = config.selectedTypes[typeIndex];
      const typeInfo = QUESTION_TYPES.find(t => t.id === typeCode);

      let qObj = {
        number: i,
        type: typeInfo ? typeInfo.name : 'Pilihan Ganda',
        cognitiveLevel: config.difficulty === 'HOTS' ? 'C4 (Analisis)' : 'C2 (Pemahaman)',
        score: Math.floor(100 / count),
        indicator: `Siswa dapat mengidentifikasi konsep ${config.topic} sesuai tujuan pembelajaran.`
      };

      if (typeCode === 'pg') {
        qObj.question = `Berikut ini yang merupakan penerapan tepat dari materi ${config.topic} dalam kehidupan sehari-hari siswa di sekolah adalah...`;
        qObj.options = [
          `A. Menghargai dan mempraktikkan konsep ${config.topic} bersama teman.`,
          `B. Mengabaikan aturan saat belajar di kelas.`,
          `C. Mengerjakan tugas tanpa melihat petunjuk guru.`,
          `D. Membiarkan lingkungan belajar menjadi kurang tertata.`
        ];
        qObj.answerKey = `A. Menghargai dan mempraktikkan konsep ${config.topic} bersama teman.`;
      } else if (typeCode === 'pgk') {
        qObj.question = `Berilah tanda centang (✓) pada beberapa pernyataan yang BENAR terkait ${config.topic}! (Jawaban lebih dari satu)`;
        qObj.options = [
          `[✓] Pernyataan 1: Konsep ${config.topic} sangat bermanfaat untuk dipelajari.`,
          `[✓] Pernyataan 2: Kita dapat menerapkannya saat belajar di UPTD SDN Dharma Tanjung 1.`,
          `[ ] Pernyataan 3: Hal ini tidak ada hubungannya dengan kegiatan sehari-hari.`,
          `[ ] Pernyataan 4: Hanya perlu dihafalkan tanpa dipahami.`
        ];
        qObj.answerKey = `Pernyataan 1 dan Pernyataan 2 bernilai BENAR.`;
      } else if (typeCode === 'bs') {
        qObj.question = `Tentukan apakah pernyataan berikut BENAR atau SALAH:\n"Mempelajari ${config.topic} membantu siswa ${config.grade} memahami ${config.learningObjective}."`;
        qObj.answerKey = `BENAR. Karena pembahasan ${config.topic} selaras dengan capaian pembelajaran ${config.phase}.`;
      } else if (typeCode === 'jodoh') {
        qObj.question = `Jodohkanlah bagian sebelah kiri dengan pasangan jawaban yang paling tepat di sebelah kanan!`;
        qObj.pairs = [
          { item: `1. Elemen Utama ${config.topic}`, match: `A. Prinsip Dasar` },
          { item: `2. Contoh Implementasi`, match: `B. Kehidupan Sehari-hari` }
        ];
        qObj.answerKey = `1 -> A, 2 -> B`;
      } else if (typeCode === 'isian') {
        qObj.question = `Sebutkan istilah atau langkah utama yang harus dilakukan ketika kita mempelajari ${config.topic}!`;
        qObj.answerKey = `Jawaban ideal: Melakukan identifikasi, pemahaman konsep dasar, dan latihan terpimpin.`;
      } else if (typeCode === 'uraian' || typeCode === 'hots') {
        qObj.question = `Jelaskan dengan bahasamu sendiri, mengapa pemahaman tentang "${config.topic}" penting bagi siswa sekolah dasar, dan berikan 2 contoh penerapannya!`;
        qObj.answerKey = `Contoh Jawaban: Pemahaman ${config.topic} penting agar siswa mampu menyelesaikan masalah kontekstual. Contoh: 1) Saat berinteraksi di sekolah, 2) Saat menyelesaikan latihan mandiri.\nPedoman Penskoran: Skor 10 jika menyebutkan alasan dan 2 contoh tepat; Skor 5 jika kurang lengkap.`;
      } else {
        qObj.question = `Pertanyaan terkait ${config.topic} berdasarkan ${config.learningObjective}.`;
        qObj.answerKey = `Kunci jawaban untuk soal nomor ${i}.`;
      }

      questionList.push(qObj);
    }

    return {
      id: 'SOAL-' + Date.now(),
      createdAt: new Date().toISOString(),
      metadata: { ...config },
      generated: {
        title: `ASESMEN ${config.assessmentType.toUpperCase()} ${config.subject.toUpperCase()}`,
        instructions: "Bacalah setiap pertanyaan dengan teliti sebelum menjawab. Kerjakan soal yang mudah terlebih dahulu!",
        questions: questionList,
        scoringRubric: {
          summary: "Setiap soal memiliki bobot skor yang disesuaikan dengan tingkat kesulitannya.",
          totalMaxScore: 100,
          formula: "Nilai Akhir = (Total Skor Perolehan / Total Skor Maksimal) x 100"
        }
      }
    };
  };

  const saveToHistory = (item) => {
    setHistoryList(prev => {
      const updated = [item, ...prev.filter(h => h.id !== item.id)];
      localStorage.setItem('sipasti_history', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteHistoryItem = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus riwayat soal ini?")) {
      const updated = historyList.filter(h => h.id !== id);
      setHistoryList(updated);
      localStorage.setItem('sipasti_history', JSON.stringify(updated));
      showToast('Riwayat berhasil dihapus', 'info');
    }
  };

  const handleUpdateQuestion = (index, field, value) => {
    if (!generatedResult) return;
    const updated = { ...generatedResult };
    updated.generated.questions[index][field] = value;
    setGeneratedResult(updated);
  };

  const handleAddQuestion = () => {
    if (!generatedResult) return;
    const updated = { ...generatedResult };
    const newNum = updated.generated.questions.length + 1;
    updated.generated.questions.push({
      number: newNum,
      type: "Pilihan Ganda",
      question: "Tuliskan pertanyaan soal baru di sini...",
      options: ["A. Pilihan A", "B. Pilihan B", "C. Pilihan C", "D. Pilihan D"],
      answerKey: "A. Pilihan A",
      indicator: "Indikator tambahan",
      cognitiveLevel: "C2",
      score: 10
    });
    setGeneratedResult(updated);
    showToast('Soal baru berhasil ditambahkan', 'success');
  };

  const handleDeleteQuestion = (index) => {
    if (!generatedResult) return;
    const updated = { ...generatedResult };
    updated.generated.questions.splice(index, 1);
    updated.generated.questions.forEach((q, i) => q.number = i + 1);
    setGeneratedResult(updated);
    showToast('Soal berhasil dihapus', 'info');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    if (!generatedResult) return;
    let text = `=== ${generatedResult.generated.title} ===\n`;
    text += `Sekolah: ${generatedResult.metadata.schoolName || 'UPTD SDN DHARMA TANJUNG 1'}\n`;
    text += `Mata Pelajaran: ${generatedResult.metadata.subject}\n`;
    text += `Kelas/Fase: ${generatedResult.metadata.grade} (${generatedResult.metadata.phase})\n\n`;

    generatedResult.generated.questions.forEach((q) => {
      text += `${q.number}. ${q.question}\n`;
      if (q.options && q.options.length > 0) {
        q.options.forEach(opt => text += `   ${opt}\n`);
      }
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    showToast('Seluruh lembar soal berhasil disalin ke Clipboard!', 'success');
  };

  const handleDownloadDoc = () => {
    if (!generatedResult) return;
    const content = document.getElementById('printable-area')?.innerHTML || '';
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Dokumen Soal</title><style>body{font-family:'Times New Roman', serif; margin:2cm;} table{width:100%;border-collapse:collapse;} table,th,td{border:1px solid black;padding:6px;}</style></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + content + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `Soal_${generatedResult.metadata.subject}_${generatedResult.metadata.grade}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
    showToast('Dokumen Word (.doc) siap diunduh!', 'success');
  };

  const formatIndonesianDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 font-sans text-slate-800">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-orange-500/30 transition-all duration-300">
          
          {/* Header Banner - Black & Orange Gradient */}
          <div className="bg-gradient-to-r from-neutral-900 via-orange-900 to-black p-8 text-center text-white relative overflow-hidden border-b-2 border-orange-500">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-24 h-24 bg-orange-500/20 rounded-full blur-xl"></div>
            
            <div className="flex justify-center mb-4">
              <div className="bg-white p-2.5 rounded-2xl shadow-lg border-2 border-orange-500 max-w-[120px]">
                <img 
                  src={SCHOOL_LOGO} 
                  alt="Logo UPTD SDN DHARMA TANJUNG 1" 
                  className="h-20 w-auto object-contain mx-auto"
                />
              </div>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white mb-1 drop-shadow-sm">
              SI PASTI
            </h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
              Aplikasi Pembuat Soal Otomatis
            </p>
            <div className="mt-2 inline-block px-3 py-1 bg-orange-950/80 rounded-full text-[11px] font-medium text-orange-200 border border-orange-500/50">
              UPTD SDN DHARMA TANJUNG 1
            </div>
          </div>

          {/* Form Body */}
          <div className="p-8 bg-white">
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-neutral-900">Sistem Cerdas Penyusunan Asesmen Guru SD</h2>
              <p className="text-xs text-neutral-500 mt-1">Masukkan PIN akses sekolah untuk melanjutkan</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                  PIN Akses Guru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-orange-600">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPin ? "text" : "password"}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Masukkan PIN sekolah..."
                    className="w-full pl-11 pr-11 py-3 bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-semibold transition-all text-neutral-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-orange-600 transition"
                  >
                    {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-2.5 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition transform active:scale-98 text-sm"
              >
                <LogIn className="w-4 h-4" />
                MASUK APLIKASI
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-neutral-100 text-center text-xs text-neutral-400">
              <p>© 2026 UPTD SDN DHARMA TANJUNG 1</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Kec. Camplong - Kab. Sampang</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 font-sans text-neutral-800 flex flex-col print:bg-white print:p-0">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 max-w-md px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-semibold transition-all animate-bounce ${
          toast.type === 'success' ? 'bg-orange-600 text-white border-orange-400' :
          toast.type === 'error' ? 'bg-red-800 text-white border-red-600' : 'bg-neutral-900 text-white border-neutral-700'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-orange-200" /> : <AlertCircle className="w-5 h-5 text-amber-300" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navbar - Black Background with Orange Accents */}
      <header className="bg-neutral-950 text-white sticky top-0 z-40 shadow-md border-b-2 border-orange-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="bg-white p-1 rounded-lg border border-orange-400 shadow-sm">
              <img src={SCHOOL_LOGO} alt="Logo Sekolah" className="h-9 w-auto object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white">SI PASTI</span>
                <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-400">AI Guru SD</span>
              </div>
              <p className="text-xs text-neutral-300 font-medium hidden sm:block">UPTD SDN DHARMA TANJUNG 1</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowKeyModal(true)}
              className="px-3 py-1.5 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 rounded-lg text-orange-400 flex items-center gap-1.5 border border-orange-500/40 transition"
              title="Konfigurasi Gemini API Key"
            >
              <Settings className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden md:inline">API Key</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-semibold bg-orange-600 hover:bg-orange-700 rounded-lg text-white flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 print:p-0 print:max-w-none">
        
        {/* Navigation Tabs Header */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-neutral-300 pb-3 print:hidden">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
              activeTab === 'dashboard' ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-neutral-700 hover:bg-orange-50 hover:text-orange-600 border border-neutral-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
              activeTab === 'create' ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-neutral-700 hover:bg-orange-50 hover:text-orange-600 border border-neutral-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Buat Soal Baru
          </button>

          {generatedResult && (
            <button
              onClick={() => setActiveTab('result')}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
                activeTab === 'result' ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-neutral-700 hover:bg-orange-50 hover:text-orange-600 border border-neutral-200'
              }`}
            >
              <FileCheck className="w-4 h-4 text-orange-200" />
              Hasil Soal AI
            </button>
          )}

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
              activeTab === 'history' ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-neutral-700 hover:bg-orange-50 hover:text-orange-600 border border-neutral-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Riwayat Soal ({historyList.length})
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
              activeTab === 'guide' ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-neutral-700 hover:bg-orange-50 hover:text-orange-600 border border-neutral-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Panduan
          </button>
        </div>

        {/* ==================== TAB 1: DASHBOARD ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Hero Welcome Banner */}
            <div className="bg-gradient-to-r from-neutral-900 via-orange-950 to-black rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-orange-500/30">
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-600/30 rounded-full text-xs font-medium text-orange-300 backdrop-blur-md mb-4 border border-orange-500/40">
                  <School className="w-3.5 h-3.5 text-orange-400" />
                  UPTD SDN DHARMA TANJUNG 1 - Camplong
                </div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-3 text-white">
                  Selamat Datang di <span className="text-orange-500">SI PASTI AI</span>
                </h1>
                <p className="text-neutral-300 text-sm sm:text-base leading-relaxed mb-6">
                  Solusi cerdas berbasis Artificial Intelligence untuk menyusun asesmen pembelajaran Kurikulum Merdeka bagi Guru SD secara presisi, cepat, dan otomatis.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-2xl shadow-lg flex items-center gap-2 transition transform hover:-translate-y-0.5 text-sm"
                  >
                    <Sparkles className="w-4 h-4 fill-current text-white" />
                    Mulai Buat Soal Sekarang
                  </button>
                  <button
                    onClick={() => setActiveTab('guide')}
                    className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold rounded-2xl border border-neutral-600 flex items-center gap-2 transition text-sm"
                  >
                    <HelpCircle className="w-4 h-4 text-orange-400" />
                    Panduan Penggunaan
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div 
                onClick={() => setActiveTab('create')}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-neutral-200 cursor-pointer transition group hover:border-orange-500"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-neutral-900 mb-2 group-hover:text-orange-600 transition">
                  1. Penyusunan Cerdas AI
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Menyusun soal otomatis yang disesuaikan dengan Fase A, B, C, Capaian Pembelajaran, serta standar HOTS.
                </p>
              </div>

              <div 
                onClick={() => setActiveTab('history')}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-neutral-200 cursor-pointer transition group hover:border-orange-500"
              >
                <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center text-orange-500 mb-4 group-hover:scale-110 transition">
                  <Bookmark className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-neutral-900 mb-2 group-hover:text-orange-600 transition">
                  2. Bank & Riwayat Soal
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Semua instrumen soal yang pernah dibuat tersimpan aman. Dapat diedit, diunduh, atau dicetak ulang kapan saja.
                </p>
              </div>

              <div 
                onClick={() => setActiveTab('guide')}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-neutral-200 cursor-pointer transition group hover:border-orange-500"
              >
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition border border-orange-200">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-neutral-900 mb-2 group-hover:text-orange-600 transition">
                  3. Ekspor Siap Cetak
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Hasil keluaran lengkap meliputi Lembar Soal Siswa, Kisi-Kisi Soal, Kunci Jawaban, dan Pedoman Penskoran (Word & PDF).
                </p>
              </div>

            </div>

            {/* Quick School Profile */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
              <img src={SCHOOL_LOGO} alt="Logo" className="h-20 w-auto object-contain" />
              <div className="flex-1 text-center md:text-left">
                <h4 className="font-extrabold text-neutral-900 text-base">UPTD SDN DHARMA TANJUNG 1</h4>
                <p className="text-xs text-neutral-600 mt-0.5">Kecamatan Camplong, Kabupaten Sampang, Jawa Timur</p>
                <p className="text-xs text-orange-600 font-semibold mt-2">
                  "Menuju Pendidikan Dasar Berkualitas dan Berbasis Teknologi Digital"
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 2: CREATE FORM ==================== */}
        {activeTab === 'create' && (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl p-6 sm:p-8">
            <div className="border-b border-neutral-200 pb-5 mb-6">
              <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4 text-orange-500" />
                Formulir Generator Soal Cerdas
              </div>
              <h2 className="text-2xl font-black text-neutral-900">Pengaturan Pembuatan Soal</h2>
              <p className="text-xs text-neutral-500 mt-1">Lengkapi parameter di bawah ini. AI akan menyesuaikan soal sesuai sasaran pembelajaran.</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleGenerateQuestions(); }} className="space-y-6">
              
              {/* SECTION A: Identitas Guru & Kelas */}
              <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 space-y-4">
                <h3 className="text-xs font-extrabold text-orange-600 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-600" />
                  A. Identitas Pengajar & Kelas
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1">Nama Guru / Pengampu</label>
                    <input
                      type="text"
                      value={formData.teacherName}
                      onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 text-neutral-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1">Tingkat Kelas</label>
                    <select
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 font-medium text-neutral-900"
                    >
                      <option value="Kelas 1">Kelas 1 (Fase A)</option>
                      <option value="Kelas 2">Kelas 2 (Fase A)</option>
                      <option value="Kelas 3">Kelas 3 (Fase B)</option>
                      <option value="Kelas 4">Kelas 4 (Fase B)</option>
                      <option value="Kelas 5">Kelas 5 (Fase C)</option>
                      <option value="Kelas 6">Kelas 6 (Fase C)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1">Fase Kurikulum (Otomatis)</label>
                    <input
                      type="text"
                      value={formData.phase}
                      disabled
                      className="w-full px-3 py-2 bg-neutral-200 border border-neutral-300 rounded-lg text-sm font-bold text-orange-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1">Semester</label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 text-neutral-900"
                    >
                      <option value="Semester Ganjil">Semester Ganjil</option>
                      <option value="Semester Genap">Semester Genap</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1">Tahun Pelajaran</label>
                    <input
                      type="text"
                      value={formData.schoolYear}
                      onChange={(e) => setFormData({ ...formData, schoolYear: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 text-neutral-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1">Tanggal Asesmen</label>
                    <input
                      type="date"
                      value={formData.assessmentDate}
                      onChange={(e) => setFormData({ ...formData, assessmentDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 text-neutral-900"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: Mata Pelajaran & Karakteristik Asesmen */}
              <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 space-y-4">
                <h3 className="text-xs font-extrabold text-orange-600 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-orange-600" />
                  B. Mata Pelajaran & Parameter Soal
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1">Mata Pelajaran</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 font-semibold text-neutral-900"
                    >
                      {SUBJECTS.map((sub, i) => (
                        <option key={i} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1">Jenis Asesmen</label>
                    <select
                      value={formData.assessmentType}
                      onChange={(e) => setFormData({ ...formData, assessmentType: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 text-neutral-900"
                    >
                      <option value="Asesmen Formatif">Asesmen Formatif</option>
                      <option value="Asesmen Sumatif">Asesmen Sumatif</option>
                      <option value="Penilaian Harian">Penilaian Harian</option>
                      <option value="Asesmen Diagnostik">Asesmen Diagnostik</option>
                      <option value="Pengayaan">Pengayaan</option>
                      <option value="Remedial">Remedial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1">Tingkat Kesulitan</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 font-semibold text-neutral-900"
                    >
                      <option value="Mudah">Mudah</option>
                      <option value="Sedang">Sedang</option>
                      <option value="Menantang">Menantang</option>
                      <option value="HOTS">HOTS (Higher Order Thinking Skills)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">Materi / Ruang Lingkup Utama</label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="Contoh: Bilangan Cacah, Keragaman Budaya, Sistem Pernapasan, Pecahan..."
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 text-neutral-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">Tujuan Pembelajaran (TP / Indikator)</label>
                  <textarea
                    rows={2}
                    value={formData.learningObjective}
                    onChange={(e) => setFormData({ ...formData, learningObjective: e.target.value })}
                    placeholder="Masukkan tujuan pembelajaran yang ingin diukur oleh instrumen ini..."
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 text-neutral-900"
                    required
                  />
                </div>
              </div>

              {/* SECTION C: Bentuk Soal & Jumlah */}
              <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 space-y-4">
                <h3 className="text-xs font-extrabold text-orange-600 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-orange-600" />
                  C. Bentuk & Jumlah Soal
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-neutral-800 mb-1">Jumlah Soal Total</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={formData.questionCount}
                      onChange={(e) => setFormData({ ...formData, questionCount: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-bold text-orange-600 focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-neutral-800 mb-2">Pilih Bentuk Soal (Bisa Lebih Dari Satu)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {QUESTION_TYPES.map((type) => {
                        const isChecked = formData.selectedTypes.includes(type.id);
                        return (
                          <label
                            key={type.id}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                              isChecked ? 'bg-orange-100 border-orange-500 font-bold text-orange-900' : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({ ...formData, selectedTypes: [...formData.selectedTypes, type.id] });
                                } else {
                                  if (formData.selectedTypes.length > 1) {
                                    setFormData({ ...formData, selectedTypes: formData.selectedTypes.filter(t => t !== type.id) });
                                  } else {
                                    showToast('Pilih minimal 1 bentuk soal!', 'error');
                                  }
                                }
                              }}
                              className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4"
                            />
                            <span>{type.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">Instruksi Khusus Tambahan untuk AI (Opsional)</label>
                  <textarea
                    rows={2}
                    value={formData.additionalInstruction}
                    onChange={(e) => setFormData({ ...formData, additionalInstruction: e.target.value })}
                    placeholder="Contoh: Gunakan konteks kearifan lokal Madura/Sampang, sertakan gambar pendukung berbentuk deskripsi deskriptif..."
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 text-neutral-900"
                  />
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-black text-base rounded-2xl shadow-xl shadow-orange-600/30 flex items-center justify-center gap-3 transition transform hover:-translate-y-0.5 active:scale-98 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>{loadingMessage || 'Sedang Proses...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-white fill-current" />
                      <span>✨ BUAT SOAL DENGAN AI</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ==================== TAB 3: RESULT VIEW ==================== */}
        {activeTab === 'result' && generatedResult && (
          <div className="space-y-6">
            
            {/* Toolbar Top */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
              <button
                onClick={() => setActiveTab('create')}
                className="px-3.5 py-2 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Form
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleAddQuestion}
                  className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 text-orange-400" />
                  Tambah Soal
                </button>

                <button
                  onClick={handleCopyText}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5 text-orange-400" />
                  Salin Soal
                </button>

                <button
                  onClick={handleDownloadDoc}
                  className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh Word (.doc)
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3 py-2 bg-black hover:bg-neutral-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm border border-orange-500/50"
                >
                  <Printer className="w-3.5 h-3.5 text-orange-400" />
                  Cetak / Simpan PDF
                </button>
              </div>
            </div>

            {/* Printable Document Container */}
            <div id="printable-area" className="bg-white rounded-2xl border border-neutral-300 shadow-xl p-8 sm:p-12 print:shadow-none print:border-none print:p-0 text-neutral-900 font-serif">
              
              {/* Document Header KOP Sekolah */}
              <div className="border-b-4 border-double border-black pb-4 mb-6 flex items-center justify-between text-center gap-4">
                <img src={SCHOOL_LOGO} alt="KOP Logo" className="h-20 w-auto object-contain shrink-0" />
                <div className="flex-1">
                  <h3 className="text-base font-bold uppercase tracking-wider text-black">PEMERINTAH KABUPATEN SAMPANG</h3>
                  <h3 className="text-sm font-bold uppercase text-black">DINAS PENDIDIKAN</h3>
                  <h2 className="text-xl font-black uppercase tracking-tight text-black mt-0.5">UPTD SDN DHARMA TANJUNG 1</h2>
                  <p className="text-[11px] font-sans text-neutral-700 mt-1">
                    Jl. Raya Camplong - Sampang, Kec. Camplong, Kab. Sampang, Jawa Timur
                  </p>
                </div>
                <div className="w-20 hidden sm:block"></div>
              </div>

              {/* Assessment Identity Table */}
              <div className="mb-6 font-sans text-xs border border-neutral-300 rounded-lg p-4 bg-neutral-50 print:bg-transparent">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4">
                  <div><span className="font-bold text-neutral-500">Mata Pelajaran:</span> <p className="font-extrabold text-neutral-900">{generatedResult.metadata.subject}</p></div>
                  <div><span className="font-bold text-neutral-500">Kelas / Fase:</span> <p className="font-extrabold text-neutral-900">{generatedResult.metadata.grade} ({generatedResult.metadata.phase})</p></div>
                  <div><span className="font-bold text-neutral-500">Semester / TP:</span> <p className="font-extrabold text-neutral-900">{generatedResult.metadata.semester} - {generatedResult.metadata.schoolYear}</p></div>
                  <div><span className="font-bold text-neutral-500">Jenis Asesmen:</span> <p className="font-extrabold text-neutral-900">{generatedResult.metadata.assessmentType}</p></div>
                  <div><span className="font-bold text-neutral-500">Guru Pengampu:</span> <p className="font-bold text-neutral-900">{generatedResult.metadata.teacherName}</p></div>
                  <div><span className="font-bold text-neutral-500">Materi Utama:</span> <p className="font-bold text-neutral-900">{generatedResult.metadata.topic}</p></div>
                  <div><span className="font-bold text-neutral-500">Tgl. Asesmen:</span> <p className="font-bold text-neutral-900">{formatIndonesianDate(generatedResult.metadata.assessmentDate)}</p></div>
                  <div><span className="font-bold text-neutral-500">Tingkat Kesulitan:</span> <p className="font-bold text-orange-600">{generatedResult.metadata.difficulty}</p></div>
                </div>

                {/* Siswa Identitas Line */}
                <div className="mt-4 pt-3 border-t border-neutral-300 grid grid-cols-3 gap-2 font-bold text-neutral-800">
                  <div>Nama Siswa : ...........................................</div>
                  <div>No. Absen : .............</div>
                  <div>Nilai : .............</div>
                </div>
              </div>

              {/* Student Instructions */}
              <div className="mb-8 font-sans text-xs bg-orange-50 border border-orange-200 rounded-lg p-3 print:border-neutral-300 print:bg-transparent">
                <p className="font-bold text-orange-900 print:text-neutral-900 mb-0.5">PETUNJUK PENGERJAAN:</p>
                <p className="text-neutral-800 print:text-neutral-900">{generatedResult.generated.instructions || 'Bacalah pertanyaan berikut dengan cermat dan berilah jawaban yang paling tepat.'}</p>
              </div>

              {/* SECTION I: LEMBAR SOAL SISWA */}
              <div className="mb-12">
                <h2 className="text-center font-sans font-black text-lg uppercase tracking-wider text-black border-b-2 border-black pb-2 mb-6">
                  LEMBAR SOAL SISWA
                </h2>

                <div className="space-y-6">
                  {generatedResult.generated.questions.map((q, idx) => (
                    <div key={idx} className="group relative border-b border-neutral-200 pb-4 print:border-neutral-300">
                      
                      {/* Interactive Editing controls for non-print */}
                      <div className="absolute right-0 top-0 hidden group-hover:flex items-center gap-1 bg-white shadow-md rounded-lg p-1 border border-neutral-200 print:hidden z-10">
                        <button
                          onClick={() => setEditingQuestionIndex(editingQuestionIndex === idx ? null : idx)}
                          className="p-1 text-neutral-600 hover:text-orange-600 rounded hover:bg-neutral-100"
                          title="Edit Soal Ini"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(idx)}
                          className="p-1 text-rose-600 hover:text-rose-800 rounded hover:bg-neutral-100"
                          title="Hapus Soal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Display or Edit Mode */}
                      {editingQuestionIndex === idx ? (
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-300 space-y-3 font-sans text-xs print:hidden">
                          <p className="font-bold text-orange-900">Mengedit Soal Nomor {q.number}</p>
                          <div>
                            <label className="block text-[11px] font-bold text-neutral-700 mb-1">Pertanyaan Soal</label>
                            <textarea
                              rows={2}
                              value={q.question}
                              onChange={(e) => handleUpdateQuestion(idx, 'question', e.target.value)}
                              className="w-full p-2 border rounded text-xs text-neutral-900"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-neutral-700 mb-1">Kunci Jawaban</label>
                            <input
                              type="text"
                              value={q.answerKey}
                              onChange={(e) => handleUpdateQuestion(idx, 'answerKey', e.target.value)}
                              className="w-full p-2 border rounded text-xs text-neutral-900"
                            />
                          </div>
                          <button
                            onClick={() => setEditingQuestionIndex(null)}
                            className="px-3 py-1 bg-orange-600 text-white font-bold rounded text-xs"
                          >
                            Selesai Edit
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-neutral-900 shrink-0">{q.number}.</span>
                            <div className="flex-1">
                              <p className="font-medium text-neutral-900 leading-relaxed whitespace-pre-line">{q.question}</p>

                              {/* Options if Multiple Choice */}
                              {q.options && q.options.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pl-2">
                                  {q.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="text-xs text-neutral-800">{opt}</div>
                                  ))}
                                </div>
                              )}

                              {/* Matching Pairs Table */}
                              {q.pairs && q.pairs.length > 0 && (
                                <div className="mt-3 font-sans text-xs">
                                  <table className="w-full border-collapse border border-neutral-300">
                                    <thead>
                                      <tr className="bg-neutral-100">
                                        <th className="border border-neutral-300 p-2 text-left">Pernyataan Soal</th>
                                        <th className="border border-neutral-300 p-2 text-left">Pasangan Jawaban</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {q.pairs.map((p, pIdx) => (
                                        <tr key={pIdx}>
                                          <td className="border border-neutral-300 p-2">{p.item}</td>
                                          <td className="border border-neutral-300 p-2 font-semibold text-neutral-700">{p.match}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}

                              {/* Answer Lines for Uraian / Isian */}
                              {(q.type === 'Uraian' || q.type === 'Isian' || q.type === 'HOTS') && (
                                <div className="mt-3 pl-2">
                                  <div className="text-[11px] font-sans text-neutral-400 italic mb-1">Ruang Lembar Jawaban Siswa:</div>
                                  <div className="border-b border-dashed border-neutral-400 h-6"></div>
                                  <div className="border-b border-dashed border-neutral-400 h-6"></div>
                                </div>
                              )}

                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              </div>

              {/* PAGE BREAK FOR PRINTING */}
              <div className="page-break font-sans pt-8 border-t-4 border-black">
                
                {/* SECTION II: KISI-KISI SOAL */}
                <div className="mb-10">
                  <h2 className="text-center font-bold text-base uppercase tracking-wider text-black mb-4">
                    KISI-KISI INSTRUMEN ASESMEN
                  </h2>
                  <table className="w-full border-collapse border border-neutral-400 text-xs">
                    <thead>
                      <tr className="bg-neutral-200 text-black">
                        <th className="border border-neutral-400 p-2 text-center w-12">No</th>
                        <th className="border border-neutral-400 p-2 text-left">Materi Utama</th>
                        <th className="border border-neutral-400 p-2 text-left">Indikator Soal / Tujuan</th>
                        <th className="border border-neutral-400 p-2 text-center w-28">Bentuk Soal</th>
                        <th className="border border-neutral-400 p-2 text-center w-24">Level Kognitif</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedResult.generated.questions.map((q, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50">
                          <td className="border border-neutral-400 p-2 text-center font-bold">{q.number}</td>
                          <td className="border border-neutral-400 p-2">{generatedResult.metadata.topic}</td>
                          <td className="border border-neutral-400 p-2">{q.indicator || generatedResult.metadata.learningObjective}</td>
                          <td className="border border-neutral-400 p-2 text-center">{q.type}</td>
                          <td className="border border-neutral-400 p-2 text-center font-semibold text-orange-600">{q.cognitiveLevel || 'C2'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* SECTION III: KUNCI JAWABAN & PEDOMAN PENSKORAN */}
                <div className="mb-8">
                  <h2 className="text-center font-bold text-base uppercase tracking-wider text-black mb-4">
                    KUNCI JAWABAN & PEDOMAN PENSKORAN
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Keys */}
                    <div className="border border-neutral-300 rounded-lg p-4 bg-neutral-50">
                      <h4 className="font-bold text-xs uppercase text-neutral-800 mb-3 border-b pb-1">Kunci Jawaban Resmi</h4>
                      <div className="space-y-2 text-xs">
                        {generatedResult.generated.questions.map((q, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="font-bold text-orange-600 w-6">{q.number}.</span>
                            <span className="font-medium text-neutral-900">{q.answerKey}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rubric */}
                    <div className="border border-neutral-300 rounded-lg p-4 bg-neutral-50 text-xs">
                      <h4 className="font-bold text-xs uppercase text-neutral-800 mb-3 border-b pb-1">Pedoman Penskoran</h4>
                      <p className="text-neutral-700 mb-2">{generatedResult.generated.scoringRubric?.summary}</p>
                      <div className="bg-white p-3 rounded border border-neutral-200 font-bold text-neutral-800">
                        <p>Rumus Penilaian Akhir:</p>
                        <p className="text-orange-600 mt-1">{generatedResult.generated.scoringRubric?.formula || 'Nilai = (Skor Perolehan / Skor Maksimal) x 100'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="mt-12 pt-6 grid grid-cols-2 text-center font-sans text-xs">
                  <div>
                    <p>Mengetahui,</p>
                    <p className="font-bold">Kepala UPTD SDN DHARMA TANJUNG 1</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">H. AHMAD HUSEN, S.Pd., M.M.</p>
                    <p>NIP. 19680512 199203 1 008</p>
                  </div>
                  <div>
                    <p>Sampang, {formatIndonesianDate(generatedResult.metadata.assessmentDate)}</p>
                    <p className="font-bold">Guru Kelas / Mata Pelajaran</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">{generatedResult.metadata.teacherName}</p>
                    <p>Guru UPTD SDN DHARMA TANJUNG 1</p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ==================== TAB 4: HISTORY ==================== */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5 mb-6">
              <div>
                <h2 className="text-2xl font-black text-neutral-900">Riwayat Asesmen Soal</h2>
                <p className="text-xs text-neutral-500 mt-1">Daftar instrumen soal yang pernah disusun dan tersimpan secara lokal.</p>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                <input
                  type="text"
                  value={searchHistory}
                  onChange={(e) => setSearchHistory(e.target.value)}
                  placeholder="Cari mata pelajaran, materi..."
                  className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 text-neutral-900"
                />
              </div>
            </div>

            {historyList.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-700 font-bold text-sm">Belum Ada Riwayat Soal Tersimpan</p>
                <p className="text-xs text-neutral-400 mt-1">Buat soal pertama Anda melalui formulir generator AI.</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="mt-4 px-4 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl hover:bg-orange-700 transition"
                >
                  Buat Soal Sekarang
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {historyList
                  .filter(item => {
                    const query = searchHistory.toLowerCase();
                    return (
                      item.metadata.subject.toLowerCase().includes(query) ||
                      item.metadata.topic.toLowerCase().includes(query) ||
                      item.metadata.grade.toLowerCase().includes(query)
                    );
                  })
                  .map((item) => (
                    <div key={item.id} className="border border-neutral-200 rounded-2xl p-5 hover:border-orange-500 transition shadow-sm bg-neutral-50 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2.5 py-0.5 bg-orange-100 text-orange-800 font-bold text-[10px] rounded-full">
                            {item.metadata.grade} ({item.metadata.phase})
                          </span>
                          <span className="text-[10px] text-neutral-400 font-medium">
                            {new Date(item.createdAt).toLocaleDateString('id-ID')}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-neutral-900 text-base mb-1">{item.metadata.subject}</h3>
                        <p className="text-xs text-neutral-600 line-clamp-2 mb-3"><span className="font-bold">Materi:</span> {item.metadata.topic}</p>
                        
                        <div className="flex items-center gap-3 text-[11px] text-neutral-500 mb-4">
                          <span>{item.metadata.assessmentType}</span>
                          <span>•</span>
                          <span>{item.generated.questions.length} Soal</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
                        <button
                          onClick={() => {
                            setGeneratedResult(item);
                            setActiveTab('result');
                          }}
                          className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Buka Soal
                        </button>

                        <button
                          onClick={() => deleteHistoryItem(item.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Soal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 5: USER GUIDE ==================== */}
        {activeTab === 'guide' && (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-neutral-200 pb-4">
              <h2 className="text-2xl font-black text-neutral-900">Panduan Penggunaan SI PASTI</h2>
              <p className="text-xs text-neutral-500 mt-1">Petunjuk operasional penyusunan instrumen soal bagi Bapak/Ibu Guru UPTD SDN DHARMA TANJUNG 1.</p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-neutral-700 leading-relaxed">
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                <h3 className="font-bold text-orange-900 text-sm mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  Langkah-Langkah Pembuatan Soal Otomatis:
                </h3>
                <ol className="list-decimal pl-5 space-y-1.5 text-neutral-800">
                  <li>Klik menu <span className="font-bold text-orange-600">"Buat Soal Baru"</span> pada navigasi utama.</li>
                  <li>Lengkapi data identitas guru, kelas (Fase A, B, atau C akan otomatis menyesuaikan), serta semester.</li>
                  <li>Pilih salah satu dari <span className="font-bold">10 Mata Pelajaran</span> Kurikulum Merdeka.</li>
                  <li>Tentukan Jenis Asesmen, Tingkat Kesulitan (Gunakan variasi HOTS untuk penalaran), serta Jumlah Soal.</li>
                  <li>Tentukan <span className="font-bold">Materi/Ruang Lingkup</span> dan <span className="font-bold">Tujuan Pembelajaran (TP)</span> secara jelas agar AI berfokus pada sasaran materi.</li>
                  <li>Pilih bentuk soal (Pilihan Ganda, Uraian, Isian, Menjodohkan, dll) lalu klik tombol <span className="font-bold text-orange-600">"✨ BUAT SOAL DENGAN AI"</span>.</li>
                </ol>
              </div>

              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <h3 className="font-bold text-neutral-900 text-sm mb-2">Petunjuk Cetak & Unduh Dokumen:</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-neutral-700">
                  <li><span className="font-bold text-neutral-900">Cetak / Simpan PDF:</span> Menggunakan fungsi printer browser untuk mencetak langsung ke kertas A4 atau menyimpan dokumen digital .pdf.</li>
                  <li><span className="font-bold text-neutral-900">Unduh Word (.doc):</span> Mengunduh berkas yang dapat dibuka dan diedit menggunakan Microsoft Word di komputer.</li>
                  <li><span className="font-bold text-neutral-900">Kunci Jawaban & Kisi-Kisi:</span> Secara otomatis terpisah dari Lembar Soal Siswa untuk kepraktisan guru.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* API Key Modal Configuration */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-orange-500/50">
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Konfigurasi Gemini API Key</h3>
            <p className="text-xs text-neutral-500 mb-4">Masukkan API Key Google Gemini milik Anda/Sekolah untuk mengaktifkan pemanggilan AI secara langsung.</p>
            
            <input
              type="password"
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              placeholder="Masukkan AI API Key di sini..."
              className="w-full p-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs mb-4 font-mono focus:ring-2 focus:ring-orange-500 text-neutral-900"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 bg-neutral-100 text-neutral-700 font-bold text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => handleSaveApiKey(customApiKey)}
                className="px-4 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl hover:bg-orange-700"
              >
                Simpan Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer - Black with Orange Text */}
      <footer className="bg-black text-neutral-400 py-6 text-center text-xs print:hidden border-t-2 border-orange-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-bold text-white">SI PASTI — <span className="text-orange-500">UPTD SDN DHARMA TANJUNG 1</span></p>
          <p className="text-[11px] text-neutral-400 mt-1">Sistem Cerdas Penyusunan Asesmen Otomatis Berbasis Artificial Intelligence • Kec. Camplong, Kab. Sampang</p>
        </div>
      </footer>

    </div>
  );
}