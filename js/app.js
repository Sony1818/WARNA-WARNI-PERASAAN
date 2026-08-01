/* =========================================================================
   WARNA-WARNI PERASAAN — Logika Permainan
   Ditulis dengan JavaScript murni (tanpa framework), siap untuk GitHub Pages.

   CATATAN UNTUK GURU / PENGEMBANG:
   - Video setiap level dicari di folder assets/videos/ dengan nama:
       senang.mp4, sedih.mp4, marah.mp4, takut.mp4, bangga.mp4
   - Jika video belum ada, aplikasi TETAP BISA DIMAINKAN karena akan
     otomatis menampilkan mode cadangan (fallback) berupa cerita singkat.
   - Pertanyaan akan muncul otomatis setelah video selesai diputar sampai
     habis (tidak berhenti di tengah).
   ========================================================================= */

(function () {
  "use strict";

  /* ------------------------- 1. DATA LEVEL ------------------------- */

  const LEVELS = [
    {
      id: "senang",
      label: "Senang",
      emoji: "😄",
      video: "assets/videos/senang.mp4",
      mulutPath: "M 75 130 Q 100 155 125 130",
      ceritaCadangan: "Budi mendapat hadiah ulang tahun. Budi tersenyum lebar.",
    },
    {
      id: "sedih",
      label: "Sedih",
      emoji: "😢",
      video: "assets/videos/sedih.mp4",
      mulutPath: "M 75 138 Q 100 116 125 138",
      ceritaCadangan: "Mainan kesayangan Sari terjatuh dan rusak. Sari menangis.",
    },
    {
      id: "marah",
      label: "Marah",
      emoji: "😠",
      video: "assets/videos/marah.mp4",
      mulutPath: "M 76 131 L 124 131",
      ceritaCadangan: "Adik mengambil pensil Rani tanpa izin. Rani kesal dan cemberut.",
    },
    {
      id: "takut",
      label: "Takut",
      emoji: "😱",
      video: "assets/videos/takut.mp4",
      mulutPath: "M 90 120 Q 100 148 110 120 Q 100 132 90 120",
      ceritaCadangan: "Tiba-tiba terdengar suara petir yang keras. Doni terkejut dan bersembunyi.",
    },
    {
      id: "bangga",
      label: "Bangga",
      emoji: "🫡",
      video: "assets/videos/bangga.mp4",
      mulutPath: "M 78 129 Q 100 148 122 132",
      ceritaCadangan: "Made berhasil merapikan tempat tidurnya sendiri tanpa dibantu.",
    },
  ];

  // Urutan pilihan jawaban selalu sama di setiap level.
  // Konsisten & bisa ditebak = lebih nyaman untuk anak autisme/tunagrahita.
  const OPSI_JAWABAN = LEVELS.map((lv) => ({
    id: lv.id,
    label: lv.label,
    emoji: lv.emoji,
  }));

  const MATERI = {
    video: "assets/videos/materi.mp4",
    ceritaCadangan:
      "Sebelum bermain, ingatlah ada 5 perasaan yang akan kita pelajari: senang, sedih, marah, takut, dan bangga.",
    durasiCadangan: 6000, // ms — lama "menonton" simulasi jika video belum ada
  };

  const SKOR_PER_LEVEL = 10;
  const SKOR_MAKSIMAL = LEVELS.length * SKOR_PER_LEVEL;

  const KUNCI_SKOR_TERBAIK = "wwp_skorTerbaik";
  const KUNCI_RIWAYAT = "wwp_riwayat";
  const KUNCI_NAMA_TERAKHIR = "wwp_namaTerakhir";
  const KUNCI_MUSIK_AKTIF = "wwp_musikAktif";

  /* ------------------------- 2. STATE ------------------------- */

  const state = {
    nama: "",
    levelIndex: 0,
    skor: 0,
    levelSudahBenar: false,
    videoModeCadangan: false,
    timerCadangan: null,
    materiMaxDitonton: 0,
    materiModeCadangan: false,
    materiTimerCadangan: null,
  };

  /* ------------------------- 3. AMBIL ELEMEN ------------------------- */

  const el = {
    // Kawan Warna
    kawanBadan: document.querySelector(".kawan-badan"),
    kawanMulut: document.getElementById("kawanMulut"),
    kawanBicara: document.getElementById("kawanBicara"),

    // Sambutan (halaman utama)
    layarSambutan: document.getElementById("layarSambutan"),
    tombolMulaiSambutan: document.getElementById("tombolMulaiSambutan"),
    skorTerbaikWrap: document.getElementById("skorTerbaikWrap"),
    skorTerbaikNilai: document.getElementById("skorTerbaikNilai"),

    // Isi nama
    layarNama: document.getElementById("layarNama"),
    formNama: document.getElementById("formNama"),
    inputNama: document.getElementById("inputNama"),

    // Tombol musik
    tombolMusik: document.getElementById("tombolMusik"),

    // Materi (video pengantar sebelum bermain)
    layarMateri: document.getElementById("layarMateri"),
    videoMateri: document.getElementById("videoMateri"),
    materiFallback: document.getElementById("materiFallback"),
    materiFallbackTeks: document.getElementById("materiFallbackTeks"),
    tombolPlayMateri: document.getElementById("tombolPlayMateri"),
    petunjukMateri: document.getElementById("petunjukMateri"),
    tombolLanjutMateri: document.getElementById("tombolLanjutMateri"),

    // Game
    layarGame: document.getElementById("layarGame"),
    progressIsi: document.getElementById("progressIsi"),
    progressTeks: document.getElementById("progressTeks"),
    progressBar: document.getElementById("progressBar"),
    skorBerjalan: document.getElementById("skorBerjalan"),
    labelLevel: document.getElementById("labelLevel"),
    video: document.getElementById("videoLevel"),
    videoFallback: document.getElementById("videoFallback"),
    fallbackWajah: document.getElementById("fallbackWajah"),
    tombolPlayVideo: document.getElementById("tombolPlayVideo"),
    tombolUlangiVideo: document.getElementById("tombolUlangiVideo"),

    // Popup
    popupPertanyaan: document.getElementById("popupPertanyaan"),
    pilihanEmosi: document.getElementById("pilihanEmosi"),
    popupPesan: document.getElementById("popupPesan"),
    tombolLanjut: document.getElementById("tombolLanjut"),

    // Hasil
    layarHasil: document.getElementById("layarHasil"),
    namaHasil: document.getElementById("namaHasil"),
    skorAkhirAngka: document.getElementById("skorAkhirAngka"),
    bintangHasil: document.getElementById("bintangHasil"),
    tombolLihatSertifikat: document.getElementById("tombolLihatSertifikat"),
    tombolMainLagi: document.getElementById("tombolMainLagi"),

    // Sertifikat
    layarSertifikat: document.getElementById("layarSertifikat"),
    kanvasSertifikat: document.getElementById("kanvasSertifikat"),
    tombolUnduhSertifikat: document.getElementById("tombolUnduhSertifikat"),
    tombolKembaliHasil: document.getElementById("tombolKembaliHasil"),
  };

  /* ------------------------- 4. NAVIGASI LAYAR ------------------------- */

  function tampilkanLayar(idLayar) {
    document.querySelectorAll(".layar").forEach((layar) => {
      layar.classList.toggle("layar-aktif", layar.id === idLayar);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ------------------------- 5. KAWAN WARNA (karakter pemandu) ------------------------- */

  function aturKawan(level) {
    if (el.kawanBadan) el.kawanBadan.style.fill = `var(--c-${level.id})`;
    if (el.kawanMulut) el.kawanMulut.setAttribute("d", level.mulutPath);
  }

  function kawanKatakan(teks, durasiMs) {
    if (!el.kawanBicara) return;
    el.kawanBicara.textContent = teks;
    el.kawanBicara.classList.add("tampil");
    window.clearTimeout(kawanKatakan._timer);
    kawanKatakan._timer = window.setTimeout(() => {
      el.kawanBicara.classList.remove("tampil");
    }, durasiMs || 3000);
  }

  /* ------------------------- 6. HALAMAN UTAMA & ISI NAMA ------------------------- */

  function muatSkorTerbaik() {
    const terbaik = Number(localStorage.getItem(KUNCI_SKOR_TERBAIK) || 0);
    if (terbaik > 0) {
      el.skorTerbaikWrap.hidden = false;
      el.skorTerbaikNilai.textContent = terbaik;
    }
    const namaTerakhir = localStorage.getItem(KUNCI_NAMA_TERAKHIR);
    if (namaTerakhir) el.inputNama.value = namaTerakhir;
  }

  el.tombolMulaiSambutan.addEventListener("click", () => {
    // Ketukan pertama ini juga yang "membuka" izin audio dari browser,
    // sehingga musik latar bisa mulai diputar otomatis di layar-layar berikutnya.
    MusikLatar.mulai("nama");
    tampilkanLayar("layarNama");
    el.inputNama.focus();
  });

  el.formNama.addEventListener("submit", (event) => {
    event.preventDefault();
    const nama = el.inputNama.value.trim();
    if (!nama) return;

    state.nama = nama;
    state.levelIndex = 0;
    state.skor = 0;

    localStorage.setItem(KUNCI_NAMA_TERAKHIR, nama);

    MusikLatar.mulai("materi");
    tampilkanLayar("layarMateri");
    muatMateri();
  });

  /* ------------------------- 6b. LAYAR MATERI (wajib ditonton sampai selesai) ------------------------- */

  function muatMateri() {
    state.materiMaxDitonton = 0;
    state.materiModeCadangan = false;
    window.clearTimeout(state.materiTimerCadangan);

    el.videoMateri.pause();
    el.videoMateri.removeAttribute("src");
    el.videoMateri.load();
    el.videoMateri.src = MATERI.video;
    el.videoMateri.currentTime = 0;

    el.materiFallback.hidden = true;
    el.materiFallbackTeks.textContent = MATERI.ceritaCadangan;
    el.videoMateri.style.display = "";
    el.tombolPlayMateri.hidden = false;
    el.tombolLanjutMateri.hidden = true;
    el.petunjukMateri.textContent = 'Tombol "Lanjut" akan muncul setelah video selesai ditonton.';

    kawanKatakan("Simak dulu videonya ya, baru kita main!", 3500);
  }

  function tandaiMateriSelesai() {
    el.tombolLanjutMateri.hidden = false;
    el.petunjukMateri.textContent = "Bagus! Sekarang kamu bisa mulai bermain.";
    kawanKatakan("Siap bermain? Ayo! 🎉", 2500);
  }

  function aktifkanModeCadanganMateri() {
    if (state.materiModeCadangan) return;
    state.materiModeCadangan = true;

    el.videoMateri.style.display = "none";
    el.materiFallback.hidden = false;

    state.materiTimerCadangan = window.setTimeout(() => {
      tandaiMateriSelesai();
    }, MATERI.durasiCadangan);
  }

  el.tombolPlayMateri.addEventListener("click", () => {
    el.tombolPlayMateri.hidden = true;

    el.videoMateri.addEventListener("timeupdate", () => {
      if (el.videoMateri.currentTime > state.materiMaxDitonton) {
        state.materiMaxDitonton = el.videoMateri.currentTime;
      }
    });
    // Cegah anak melompat maju (skip) — video harus benar-benar ditonton.
    el.videoMateri.addEventListener("seeking", () => {
      if (el.videoMateri.currentTime > state.materiMaxDitonton + 0.75) {
        el.videoMateri.currentTime = state.materiMaxDitonton;
      }
    });
    el.videoMateri.addEventListener("ended", tandaiMateriSelesai, { once: true });
    el.videoMateri.addEventListener("error", aktifkanModeCadanganMateri, { once: true });
    // Jaga-jaga: jika sempat salah mendeteksi error padahal videonya akhirnya
    // berhasil diputar, sembunyikan lagi tulisan cadangan begitu video benar-benar jalan.
    el.videoMateri.addEventListener("playing", () => {
      if (state.materiModeCadangan) {
        state.materiModeCadangan = false;
        window.clearTimeout(state.materiTimerCadangan);
        el.materiFallback.hidden = true;
        el.videoMateri.style.display = "";
      }
    });

    const janji = el.videoMateri.play();
    if (janji && typeof janji.catch === "function") {
      janji.catch(aktifkanModeCadanganMateri);
    }
  });

  el.tombolLanjutMateri.addEventListener("click", () => {
    tampilkanLayar("layarGame");
    muatLevel(0);
  });

  /* ------------------------- 7. MEMUAT SETIAP LEVEL ------------------------- */

  function muatLevel(index) {
    const level = LEVELS[index];
    state.levelIndex = index;
    state.levelSudahBenar = false;
    state.videoModeCadangan = false;
    window.clearTimeout(state.timerCadangan);

    MusikLatar.mulai("game-" + level.id);

    // Perbarui tampilan atas (progress bar & skor)
    const persen = (index / LEVELS.length) * 100;
    el.progressIsi.style.width = persen + "%";
    el.progressTeks.textContent = `Level ${index + 1} dari ${LEVELS.length}`;
    el.progressBar.setAttribute("aria-valuenow", index);
    el.skorBerjalan.textContent = state.skor;

    el.labelLevel.textContent = level.label;
    aturKawan(level);
    kawanKatakan(`Ayo tonton videonya, lalu jawab: apa perasaan ${level.label.toLowerCase()}?`, 4000);

    // Siapkan video
    el.video.pause();
    el.video.removeAttribute("src");
    el.video.load();
    el.video.src = level.video;
    el.video.currentTime = 0;

    el.videoFallback.hidden = true;
    el.fallbackWajah.textContent = level.emoji;
    document.getElementById("videoLevel").style.display = "";
    el.tombolPlayVideo.hidden = false;
    el.tombolUlangiVideo.hidden = true;
    el.popupPertanyaan.hidden = true;
  }

  /* ------------------------- 8. MEMUTAR VIDEO SAMPAI SELESAI ------------------------- */

  function aktifkanModeCadangan() {
    if (state.videoModeCadangan) return; // sudah aktif, jangan diulang
    state.videoModeCadangan = true;
    const level = LEVELS[state.levelIndex];

    document.getElementById("videoLevel").style.display = "none";
    el.videoFallback.hidden = false;
    el.videoFallback.querySelector(".fallback-teks").textContent = level.ceritaCadangan;

    // Simulasikan durasi "menonton" lalu tampilkan pertanyaan
    state.timerCadangan = window.setTimeout(() => {
      munculkanPopup();
    }, 3200);
  }

  el.tombolPlayVideo.addEventListener("click", () => {
    el.tombolPlayVideo.hidden = true;
    const level = LEVELS[state.levelIndex];

    el.video.addEventListener(
      "ended",
      () => {
        if (!el.popupPertanyaan.hidden) return;
        munculkanPopup();
      },
      { once: true }
    );
    el.video.addEventListener("error", aktifkanModeCadangan, { once: true });
    // Jaga-jaga: jika sempat salah mendeteksi error padahal videonya akhirnya
    // berhasil diputar, sembunyikan lagi tulisan cadangan begitu video benar-benar jalan.
    el.video.addEventListener("playing", () => {
      if (state.videoModeCadangan) {
        state.videoModeCadangan = false;
        window.clearTimeout(state.timerCadangan);
        el.videoFallback.hidden = true;
        document.getElementById("videoLevel").style.display = "";
      }
    });

    const janji = el.video.play();
    if (janji && typeof janji.catch === "function") {
      janji.catch(aktifkanModeCadangan);
    }

    kawanKatakan("Perhatikan baik-baik ya!", 2500);
  });

  el.tombolUlangiVideo.addEventListener("click", () => {
    el.popupPertanyaan.hidden = true;
    if (state.videoModeCadangan) {
      el.tombolUlangiVideo.hidden = true;
      aktifkanModeCadangan();
      return;
    }
    el.video.currentTime = 0;
    el.video.play();
    el.video.addEventListener(
      "ended",
      () => {
        if (!el.popupPertanyaan.hidden) return;
        munculkanPopup();
      },
      { once: true }
    );
    el.tombolUlangiVideo.hidden = true;
  });

  /* ------------------------- 9. POPUP PERTANYAAN ------------------------- */

  function munculkanPopup() {
    el.popupPesan.textContent = "";
    el.popupPesan.className = "popup-pesan";
    el.tombolLanjut.hidden = true;
    el.tombolUlangiVideo.hidden = false;

    el.pilihanEmosi.innerHTML = "";
    OPSI_JAWABAN.forEach((opsi) => {
      const tombol = document.createElement("button");
      tombol.type = "button";
      tombol.className = "tombol-emosi";
      tombol.setAttribute("data-id", opsi.id);
      tombol.setAttribute("aria-label", opsi.label);
      tombol.innerHTML = `<span class="emoji-besar" aria-hidden="true">${opsi.emoji}</span><span>${opsi.label}</span>`;
      tombol.addEventListener("click", () => evaluasiJawaban(opsi.id, tombol));
      el.pilihanEmosi.appendChild(tombol);
    });

    el.popupPertanyaan.hidden = false;
    const tombolPertama = el.pilihanEmosi.querySelector(".tombol-emosi");
    if (tombolPertama) tombolPertama.focus();
  }

  function evaluasiJawaban(idDipilih, tombolElemen) {
    if (state.levelSudahBenar) return; // sudah benar, tunggu klik "Lanjut"

    const level = LEVELS[state.levelIndex];
    const benar = idDipilih === level.id;

    if (benar) {
      state.levelSudahBenar = true;
      tombolElemen.classList.add("benar");
      el.pilihanEmosi.querySelectorAll(".tombol-emosi").forEach((btn) => (btn.disabled = true));

      state.skor += SKOR_PER_LEVEL;
      el.skorBerjalan.textContent = state.skor;

      el.popupPesan.textContent = "Benar sekali! Kamu hebat! 🎉";
      el.popupPesan.classList.add("pesan-benar");

      putarSuaraTepukTangan();
      kawanKatakan("Horeee, betul! 🎉", 2500);

      el.tombolLanjut.hidden = false;
      el.tombolLanjut.focus();
    } else {
      tombolElemen.classList.add("salah");
      window.setTimeout(() => tombolElemen.classList.remove("salah"), 500);

      el.popupPesan.textContent = "Belum tepat, coba lagi ya 🙂";
      el.popupPesan.classList.remove("pesan-benar");
      el.popupPesan.classList.add("pesan-salah");

      kawanKatakan("Coba perhatikan lagi ekspresinya ya!", 2500);
    }
  }

  el.tombolLanjut.addEventListener("click", () => {
    el.popupPertanyaan.hidden = true;
    const berikutnya = state.levelIndex + 1;
    if (berikutnya < LEVELS.length) {
      muatLevel(berikutnya);
    } else {
      selesaikanPermainan();
    }
  });

  /* ------------------------- 10. SUARA TEPUK TANGAN (Web Audio API) ------------------------- */
  // Dibuat langsung dengan kode (disintesis), jadi tidak perlu file suara terpisah.

  let audioCtx = null;
  function ambilAudioCtx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function buatSatuTepukan(ctx, waktuMulai) {
    const durasi = 0.08;
    const jumlahSampel = Math.floor(ctx.sampleRate * durasi);
    const buffer = ctx.createBuffer(1, jumlahSampel, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < jumlahSampel; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / jumlahSampel);
    }
    const sumber = ctx.createBufferSource();
    sumber.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1400 + Math.random() * 900;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.55, waktuMulai);
    gain.gain.exponentialRampToValueAtTime(0.001, waktuMulai + durasi);

    sumber.connect(filter).connect(gain).connect(ctx.destination);
    sumber.start(waktuMulai);
    sumber.stop(waktuMulai + durasi);
  }

  function buatNadaSenang(ctx, frekuensi, waktuMulai, durasi) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = frekuensi;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, waktuMulai);
    gain.gain.linearRampToValueAtTime(0.22, waktuMulai + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, waktuMulai + durasi);

    osc.connect(gain).connect(ctx.destination);
    osc.start(waktuMulai);
    osc.stop(waktuMulai + durasi);
  }

  function putarSuaraTepukTangan() {
    try {
      const ctx = ambilAudioCtx();
      const jumlahTepuk = 10;
      for (let i = 0; i < jumlahTepuk; i++) {
        const waktu = ctx.currentTime + i * (0.09 + Math.random() * 0.05);
        buatSatuTepukan(ctx, waktu);
      }
      [523.25, 659.25, 783.99].forEach((frekuensi, i) => {
        buatNadaSenang(ctx, frekuensi, ctx.currentTime + 0.55 + i * 0.13, 0.2);
      });
    } catch (err) {
      // Jika Web Audio API tidak didukung perangkat, permainan tetap lanjut tanpa suara.
      console.warn("Suara tidak dapat diputar:", err);
    }
  }

  /* ------------------------- 10b. MUSIK LATAR PER LAYAR (file MP3) ------------------------- */
  // Setiap layar/level memutar file musiknya sendiri dari folder assets/musik/.
  // Berpindah tema akan meredupkan (fade out) musik lama lalu memutar musik baru (fade in).

  const TEMA_MUSIK_FILE = {
    sambutan: "assets/musik/sambutan.mp3",
    nama: "assets/musik/nama.mp3",
    materi: "assets/musik/materi.mp3",
    "game-senang": "assets/musik/senang.mp3",
    "game-sedih": "assets/musik/sedih.mp3",
    "game-marah": "assets/musik/marah.mp3",
    "game-takut": "assets/musik/takut.mp3",
    "game-bangga": "assets/musik/bangga.mp3",
    hasil: "assets/musik/hasil.mp3",
    sertifikat: "assets/musik/sertifikat.mp3",
  };

  const VOLUME_MUSIK = 0.35;

  const MusikLatar = (function () {
    const audioEl = document.getElementById("audioMusikLatar");
    audioEl.loop = true;

    let temaAktif = null;
    let aktif = localStorage.getItem(KUNCI_MUSIK_AKTIF) !== "0"; // default: nyala
    let timerFade = null;
    audioEl.volume = 0;

    function fadeKe(volumeTujuan, durasiMs, setelahSelesai) {
      window.clearInterval(timerFade);
      const volumeAwal = audioEl.volume;
      const langkahMs = 30;
      const jumlahLangkah = Math.max(1, Math.round(durasiMs / langkahMs));
      let langkahKe = 0;

      timerFade = window.setInterval(() => {
        langkahKe++;
        audioEl.volume = Math.min(1, Math.max(0, volumeAwal + (volumeTujuan - volumeAwal) * (langkahKe / jumlahLangkah)));
        if (langkahKe >= jumlahLangkah) {
          window.clearInterval(timerFade);
          audioEl.volume = volumeTujuan;
          if (setelahSelesai) setelahSelesai();
        }
      }, langkahMs);
    }

    function putarSumberBaru(src) {
      audioEl.src = src;
      audioEl.currentTime = 0;
      const janji = audioEl.play();
      if (janji && typeof janji.catch === "function") {
        // Diam-diam gagal jika file belum ditambahkan guru, atau browser
        // belum mengizinkan audio (butuh interaksi pengguna lebih dulu).
        janji.catch(() => {});
      }
      if (aktif) fadeKe(VOLUME_MUSIK, 500);
    }

    function mulai(idTema) {
      if (temaAktif === idTema) return; // tema sama, tidak perlu diulang
      const src = TEMA_MUSIK_FILE[idTema];
      if (!src) return;
      temaAktif = idTema;

      if (audioEl.paused || !audioEl.src) {
        putarSumberBaru(src);
      } else {
        fadeKe(0, 250, () => putarSumberBaru(src));
      }
    }

    function toggleAktif() {
      aktif = !aktif;
      localStorage.setItem(KUNCI_MUSIK_AKTIF, aktif ? "1" : "0");
      fadeKe(aktif ? VOLUME_MUSIK : 0, 300);
      return aktif;
    }

    function apakahAktif() {
      return aktif;
    }

    return { mulai, toggleAktif, apakahAktif };
  })();

  el.tombolMusik.addEventListener("click", () => {
    const kiniAktif = MusikLatar.toggleAktif();
    el.tombolMusik.textContent = kiniAktif ? "🔊" : "🔇";
    el.tombolMusik.setAttribute("aria-pressed", String(kiniAktif));
    el.tombolMusik.setAttribute("aria-label", kiniAktif ? "Matikan musik latar" : "Nyalakan musik latar");
  });

  // Tampilkan status ikon musik sesuai preferensi tersimpan saat halaman dibuka
  if (!MusikLatar.apakahAktif()) {
    el.tombolMusik.textContent = "🔇";
    el.tombolMusik.setAttribute("aria-pressed", "false");
  }

  /* ------------------------- 11. LAYAR HASIL ------------------------- */

  function selesaikanPermainan() {
    MusikLatar.mulai("hasil");

    // Update progress bar penuh
    el.progressIsi.style.width = "100%";
    el.progressTeks.textContent = `Level ${LEVELS.length} dari ${LEVELS.length}`;

    // Simpan ke Local Storage
    const terbaikSebelumnya = Number(localStorage.getItem(KUNCI_SKOR_TERBAIK) || 0);
    if (state.skor > terbaikSebelumnya) {
      localStorage.setItem(KUNCI_SKOR_TERBAIK, String(state.skor));
    }
    const riwayat = JSON.parse(localStorage.getItem(KUNCI_RIWAYAT) || "[]");
    riwayat.push({
      nama: state.nama,
      skor: state.skor,
      tanggal: new Date().toISOString(),
    });
    localStorage.setItem(KUNCI_RIWAYAT, JSON.stringify(riwayat.slice(-50)));

    // Tampilkan layar hasil
    el.namaHasil.textContent = `Selamat, ${state.nama}!`;
    el.skorAkhirAngka.textContent = `${state.skor} / ${SKOR_MAKSIMAL}`;

    const jumlahBintang = Math.round((state.skor / SKOR_MAKSIMAL) * 5);
    el.bintangHasil.textContent = "⭐".repeat(jumlahBintang) + "☆".repeat(5 - jumlahBintang);

    tampilkanLayar("layarHasil");
  }

  el.tombolMainLagi.addEventListener("click", () => {
    MusikLatar.mulai("sambutan");
    tampilkanLayar("layarSambutan");
  });

  /* ------------------------- 12. SERTIFIKAT ------------------------- */

  el.tombolLihatSertifikat.addEventListener("click", () => {
    MusikLatar.mulai("sertifikat");
    tampilkanLayar("layarSertifikat");
    gambarSertifikat();
  });

  el.tombolKembaliHasil.addEventListener("click", () => {
    tampilkanLayar("layarHasil");
  });

  function gambarSertifikat() {
    const canvas = el.kanvasSertifikat;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    function lukis() {
      // Latar
      const gradasi = ctx.createLinearGradient(0, 0, W, H);
      gradasi.addColorStop(0, "#fff9f0");
      gradasi.addColorStop(1, "#fef1da");
      ctx.fillStyle = gradasi;
      ctx.fillRect(0, 0, W, H);

      // Bingkai dekoratif
      ctx.strokeStyle = "#ffcb47";
      ctx.lineWidth = 14;
      ctx.strokeRect(24, 24, W - 48, H - 48);
      ctx.strokeStyle = "#8e7cc3";
      ctx.lineWidth = 4;
      ctx.strokeRect(42, 42, W - 84, H - 84);

      // Chip emoji di atas
      ctx.font = "44px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("😄 😢 😠 😱 🫡", W / 2, 130);

      // Judul
      ctx.fillStyle = "#3a3357";
      ctx.font = "700 46px 'Baloo 2', sans-serif";
      ctx.fillText("Sertifikat Warna-Warni Perasaan", W / 2, 200);

      ctx.font = "600 22px 'Nunito', sans-serif";
      ctx.fillStyle = "#6b6486";
      ctx.fillText("Diberikan kepada", W / 2, 260);

      // Nama pemain
      ctx.font = "800 58px 'Baloo 2', sans-serif";
      ctx.fillStyle = "#2f7dc0";
      ctx.fillText(state.nama || "-", W / 2, 340);

      // Garis bawah nama
      const lebarGaris = Math.min(500, ctx.measureText(state.nama || "-").width + 60);
      ctx.strokeStyle = "#ffcb47";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(W / 2 - lebarGaris / 2, 365);
      ctx.lineTo(W / 2 + lebarGaris / 2, 365);
      ctx.stroke();

      // Deskripsi
      ctx.font = "600 22px 'Nunito', sans-serif";
      ctx.fillStyle = "#3a3357";
      ctx.fillText("telah berhasil menyelesaikan seluruh level permainan", W / 2, 420);
      ctx.fillText("mengenal 5 perasaan: senang, sedih, marah, takut, dan bangga.", W / 2, 452);

      // Skor
      ctx.font = "800 40px 'Baloo 2', sans-serif";
      ctx.fillStyle = "#4fbf8b";
      ctx.fillText(`Skor Akhir: ${state.skor} / ${SKOR_MAKSIMAL}`, W / 2, 530);

      // Tanggal
      const tanggal = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      ctx.font = "600 20px 'Nunito', sans-serif";
      ctx.fillStyle = "#6b6486";
      ctx.fillText(tanggal, W / 2, 600);

      ctx.font = "600 18px 'Nunito', sans-serif";
      ctx.fillText("Warna-Warni Perasaan — Game Edukasi Mengenal Emosi", W / 2, 650);
    }

    // Pastikan font kustom sudah dimuat sebelum digambar di canvas
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(lukis);
    } else {
      lukis();
    }
  }

  el.tombolUnduhSertifikat.addEventListener("click", () => {
    const tautan = document.createElement("a");
    const namaFile = (state.nama || "pemain").trim().replace(/\s+/g, "-").toLowerCase();
    tautan.download = `sertifikat-${namaFile}.png`;
    tautan.href = el.kanvasSertifikat.toDataURL("image/png");
    tautan.click();
  });

  /* ------------------------- 13. MULAI ------------------------- */

  muatSkorTerbaik();
  kawanKatakan("Halo! Aku Kawan Warna 👋 Ayo main bersama!", 3500);
})();
