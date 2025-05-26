// Deklarasi Dexie Database
const db = new Dexie('MyLibraryDatabase');
db.version(1).stores({
    books: '++id, title, author, type, publishedYear, rating, currentPage, isbn, *readDays'
});

// Variabel global untuk books
let books = [];

// Kunci untuk localStorage (pengingat)
const LAST_REMINDER_DATE_KEY = 'lastReminderDate';
const REMINDER_TIME_KEY = 'reminderTime';

// --- Referensi Elemen Modal Tambah/Edit (Deklarasi) ---
let bookModal;
let modalTitle;
let bookForm;
let modalTitleInput;
let modalAuthorInput;
let modalTypeSelect;
let bookIndexInput;
let editModalCloseButton;
let openAddBookModalButton;

// --- Referensi Elemen Input/Textarea di Modal Tambah/Edit (Deklarasi) ---
let modalIsbnInput;
let modalPublishedYearInput;
let modalRatingInput;
let modalCurrentPageInput;
let modalNotesInput;
let modalCoverImageUrlInput;

// --- Referensi Elemen Modal Detail Buku (Deklarasi) ---
let bookDetailModal;
let detailCloseButton;
let detailCoverImage;
let detailTitle;
let detailAuthor;
let detailType;
let detailPublishedYear;
let detailRating;
let detailCurrentPage;
let detailIsbn;
let detailNotes;
let detailReadDays;

// --- Referensi Elemen DOM Lainnya (Deklarasi) ---
let bookList;
let filterType;
let searchInput;
let sortBy; // <-- Pastikan ini ada
let importButton;
let importFile;
let exportButton;
let reminderTimeInput;
let statsContainer;
let totalReadingDaysElement;
// >>> TAMBAHKAN INI:
let toggleStatsListButton; // Tombol toggle statistik
let statsBookListElement; // Elemen UL untuk daftar buku di stats
let statsBookListContainer; // Container yang bisa di-collapse
// <<< AKHIR PENAMBAHAN



// --- Fungsi untuk Membuka dan Menutup Modal Tambah/Edit ---
function openModal(book = null) {
    if (!bookForm) {
        console.error("openModal: Elemen bookForm tidak ditemukan.");
        return;
    }
    bookForm.reset();

    if (book) { // Mode Edit
        if (!modalTitle || !modalTitleInput || !modalAuthorInput || !modalTypeSelect || !bookIndexInput || !modalIsbnInput || !modalPublishedYearInput || !modalRatingInput || !modalCurrentPageInput || !modalNotesInput || !modalCoverImageUrlInput) {
             console.error("openModal: Beberapa elemen input modal edit tidak ditemukan.");
             return;
        }
        modalTitle.textContent = 'Edit Buku';
        modalTitleInput.value = book.title;
        modalAuthorInput.value = book.author || '';
        modalTypeSelect.value = book.type;
        bookIndexInput.value = book.id;

        modalIsbnInput.value = book.isbn || '';
        modalPublishedYearInput.value = book.publishedYear > 0 ? book.publishedYear : '';
        modalRatingInput.value = book.rating > 0 ? book.rating : '';
        modalCurrentPageInput.value = book.currentPage > 0 ? book.currentPage : '';
        modalNotesInput.value = book.notes || '';
        modalCoverImageUrlInput.value = book.coverImageUrl || '';

    } else { // Mode Tambah
        if (!modalTitle || !bookIndexInput) {
             console.error("openModal: Beberapa elemen modal tambah tidak ditemukan.");
             return;
        }
        modalTitle.textContent = 'Tambah Buku Baru';
        bookIndexInput.value = '';
    }

    if (!bookModal) {
         console.error("openModal: Elemen bookModal tidak ditemukan.");
         return;
    }
    bookModal.style.display = 'block';
}

function closeModal() {
    if (!bookModal || !bookForm || !bookIndexInput) {
         console.error("closeModal: Beberapa elemen modal tambah/edit tidak ditemukan.");
         return;
    }
    bookModal.style.display = 'none';
    bookForm.reset();
    bookIndexInput.value = '';
}

// --- Fungsi untuk Membuka dan Menutup Modal Detail Buku (Asinkron) ---
async function openDetailModal(bookId) {
     if (!bookDetailModal || !detailTitle || !detailAuthor || !detailType || !detailPublishedYear || !detailRating || !detailCurrentPage || !detailIsbn || !detailNotes || !detailReadDays || !detailCoverImage) {
         console.error("openDetailModal: Beberapa elemen modal detail tidak ditemukan.");
         return;
     }
    const book = await db.books.get(bookId);

    if (book) {
        detailTitle.textContent = book.title || 'Tidak Ada Judul';
        detailAuthor.textContent = `Penulis: ${book.author || 'Tidak Diketahui'}`;
        detailType.textContent = `Jenis: ${book.type === 'online' ? 'Online' : 'Offline'}`;

        detailPublishedYear.textContent = book.publishedYear > 0 ? `Tahun Terbit: ${book.publishedYear}` : 'Tahun Terbit: -';
        detailRating.textContent = book.rating > 0 ? `Rating: ${book.rating.toFixed(1)}/5` : 'Rating: -';
        detailCurrentPage.textContent = book.currentPage > 0 ? `Halaman Terakhir: ${book.currentPage}` : 'Halaman Terakhir: -';
        detailIsbn.textContent = book.isbn ? `ISBN: ${book.isbn}` : 'ISBN: -';
        detailNotes.textContent = book.notes || 'Tidak ada catatan.';

        const readDaysCount = Array.isArray(book.readDays) ? book.readDays.length : 0;
        detailReadDays.textContent = `Dibaca selama: ${readDaysCount} hari`;

        if (book.coverImageUrl && typeof book.coverImageUrl === 'string' && book.coverImageUrl.trim() !== '') {
             detailCoverImage.src = book.coverImageUrl.trim();
             detailCoverImage.style.display = 'block';
             detailCoverImage.alt = `Sampul Buku: ${book.title || 'Tidak Ada Judul'}`;
        } else {
             detailCoverImage.src = '';
             detailCoverImage.style.display = 'none';
        }

        bookDetailModal.style.display = 'block';
    } else {
        console.error("openDetailModal: Buku dengan ID", bookId, "tidak ditemukan untuk ditampilkan detailnya.");
        alert("Gagal menampilkan detail buku. Buku tidak ditemukan.");
    }
}

function closeDetailModal() {
    if (!bookDetailModal || !detailTitle || !detailAuthor || !detailType || !detailPublishedYear || !detailRating || !detailCurrentPage || !detailIsbn || !detailNotes || !detailReadDays || !detailCoverImage) {
         console.error("closeDetailModal: Beberapa elemen modal detail tidak ditemukan.");
         return;
    }
    bookDetailModal.style.display = 'none';
    detailTitle.textContent = '';
    detailAuthor.textContent = '';
    detailType.textContent = '';
    detailPublishedYear.textContent = '';
    detailRating.textContent = '';
    detailCurrentPage.textContent = '';
    detailIsbn.textContent = '';
    detailNotes.textContent = '';
    detailReadDays.textContent = '';
    detailCoverImage.src = '';
    detailCoverImage.style.display = 'none';
}


// --- Fungsi Aksi Buku (Asinkron) ---

window.markAsRead = async (bookId) => {
    const today = new Date().toLocaleDateString();
    const book = await db.books.get(bookId);

    if (book) {
         if (!Array.isArray(book.readDays)) {
             book.readDays = [];
         }
         if (!book.readDays.includes(today)) {
             book.readDays.push(today);
             await db.books.put(book);
             console.log(`Buku "${book.title}" berhasil ditandai dibaca hari ini.`);
             await renderBooksAndUpdateUI();
         } else {
             alert('Anda sudah menandai buku ini dibaca hari ini.');
         }
    } else {
        console.error("markAsRead: Buku dengan ID", bookId, "tidak ditemukan.");
    }
};

window.deleteBook = async (bookId) => {
     const bookToDelete = await db.books.get(bookId);

     if (bookToDelete) {
        if (confirm(`Yakin ingin menghapus buku "${bookToDelete.title}"?`)) {
            await db.books.delete(bookId);
            console.log(`Buku "${bookToDelete.title}" berhasil dihapus.`);
            if (bookDetailModal && bookDetailModal.style.display === 'block') {
                 closeDetailModal();
            }
            await renderBooksAndUpdateUI();
        }
     } else {
        console.error("deleteBook: Buku dengan ID", bookId, "tidak ditemukan untuk dihapus.");
     }
};

window.editBook = async (bookId) => {
     if (bookId) {
         const bookToEdit = await db.books.get(parseInt(bookId));
         if (bookToEdit) {
              openModal(bookToEdit);
         } else {
              console.error("editBook: Buku dengan ID", bookId, "tidak ditemukan untuk diedit.");
              alert("Terjadi kesalahan: Buku tidak ditemukan.");
         }
     } else {
         console.error("editBook: ID buku tidak diberikan untuk editBook.");
     }
};


// --- Fungsi Render Tampilan (Memuat data dari DB, memfilter/mencari, dan menampilkan) ---
async function renderBooksAndUpdateUI() {
    try {
        if (!filterType || !searchInput || !sortBy) { // Tambahkan check untuk sortBy
             console.error("renderBooksAndUpdateUI: Beberapa elemen filter, search, atau sort tidak ditemukan.");
             // Anda bisa tambahkan return di sini jika ingin menghentikan fungsi
             // return;
        }

        // 1. Ambil nilai filter, search, dan sort
        const selectedType = filterType ? filterType.value : 'all';
        const keyword = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedSort = (sortBy && sortBy.value) ? sortBy.value : 'id'; // Ambil nilai sort, default 'id'

        // 2. Query data awal dari database
        let collection = db.books;
        // Terapkan filter dasar di level Dexie jika memungkinkan (hanya untuk online/offline)
        if (selectedType === 'online' || selectedType === 'offline') {
            collection = collection.where('type').equals(selectedType);
        }

        // 3. Dapatkan hasil query ke dalam array
        let resultBooks = await collection.toArray();

        // 4. TERAPKAN PENYORTIRAN SISI KLIEN pada resultBooks
        resultBooks.sort((a, b) => {
            // Logika penyortiran berdasarkan selectedSort
            if (selectedSort === 'id') {
                 // Mengurutkan dari ID terbesar ke terkecil (terbaru)
                 return (a.id > b.id ? -1 : 1);
            }

            // Handle string comparisons (case-insensitive for title/author)
            if (selectedSort === 'title' || selectedSort === 'author') {
                const fieldA = (a[selectedSort] || '').toLowerCase();
                const fieldB = (b[selectedSort] || '').toLowerCase();
                if (fieldA < fieldB) return -1;
                if (fieldA > fieldB) return 1;
                // If equal by main criteria, sort by ID as secondary (latest first)
                return (a.id > b.id ? -1 : 1);
            }

            // Handle numeric comparisons (publishedYear, rating, currentPage)
            if (selectedSort === 'publishedYear' || selectedSort === 'rating' || selectedSort === 'currentPage') {
                 const fieldA = parseFloat(a[selectedSort]) || 0; // Treat missing/invalid as 0
                 const fieldB = parseFloat(b[selectedSort]) || 0;
                 // Sort descending for publishedYear, rating, currentPage (terbesar ke terkecil)
                 if (fieldA < fieldB) return 1; // Untuk descending sort
                 if (fieldA > fieldB) return -1; // Untuk descending sort
                 // If equal by main criteria, sort by ID as secondary (latest first)
                 return (a.id > b.id ? -1 : 1);
            }

            // Handle readDaysCount (calculated, not a direct field)
            if (selectedSort === 'readDaysCount') {
                const countA = Array.isArray(a.readDays) ? a.readDays.length : 0;
                const countB = Array.isArray(b.readDays) ? b.readDays.length : 0;
                 // Sort descending (most read days first)
                if (countA < countB) return 1; // Untuk descending sort
                if (countA > countB) return -1; // Untuk descending sort
                 // If equal by main criteria, sort by ID as secondary (latest first)
                 return (a.id > b.id ? -1 : 1);
            }

            // Fallback to default sort by ID descending if selectedSort is unexpected
             return (a.id > b.id ? -1 : 1);
        });


        // 5. TERAPKAN FILTERING SISI KLIEN pada array yang sudah tersortir
        const fullyFilteredBooks = resultBooks.filter(book => {
            let matchFilterBasedOnSelectedType = true;
            // Filter yang tidak bisa dilakukan langsung di Dexie (seperti has-read-days, no-read-days, has-rating, has-cover)
            if (selectedType === 'has-read-days') {
                 matchFilterBasedOnSelectedType = Array.isArray(book.readDays) && book.readDays.length > 0;
            } else if (selectedType === 'no-read-days') {
                 matchFilterBasedOnSelectedType = !Array.isArray(book.readDays) || book.readDays.length === 0;
            } else if (selectedType === 'has-rating') {
                const rating = parseFloat(book.rating);
                matchFilterBasedOnSelectedType = !isNaN(rating) && rating > 0;
            } else if (selectedType === 'has-cover') {
                matchFilterBasedOnSelectedType = typeof book.coverImageUrl === 'string' && book.coverImageUrl.trim() !== '';
            }
            // Pencarian keyword (selalu dilakukan sisi klien)
            const matchKeyword =
                (book.title && book.title.toLowerCase().includes(keyword)) ||
                (book.author && book.author.toLowerCase().includes(keyword)) ||
                 (book.isbn && book.isbn.toLowerCase().includes(keyword)) ||
                 (book.notes && book.notes.toLowerCase().includes(keyword));

            // Gabungkan hasil filter berdasarkan tipe (jika ada filter tipe sisi klien) dan pencarian keyword
            // Jika filterType adalah 'online' atau 'offline', matchFilterBasedOnSelectedType akan selalu true karena sudah difilter di Dexie.
            // Jika filterType adalah filter sisi klien, maka gunakan matchFilterBasedOnSelectedType yang dihitung di sini.
            const isClientSideFilterActive = selectedType !== 'all' && selectedType !== 'online' && selectedType !== 'offline';

            return (isClientSideFilterActive ? matchFilterBasedOnSelectedType : true) && matchKeyword;

        });


        // 6. Update variabel global 'books'
        books = fullyFilteredBooks;

        // 7. Render tampilan menggunakan data yang sudah difilter dan tersortir
        if (bookList) renderBookList();
        if (statsContainer || totalReadingDaysElement || statsBookListElement || statsBookListContainer || toggleStatsListButton) { // Tambahkan check untuk elemen stats
             renderStats();
        }


    } catch (error) {
        console.error("renderBooksAndUpdateUI: Gagal memuat atau memfilter buku dari database:", error);
        if(bookList) bookList.innerHTML = '<li class="book-item empty-list-message"><span>Gagal memuat buku.</span></li>';
        if(statsContainer) statsContainer.innerHTML = '<p>Gagal memuat statistik.</p>';
        if(totalReadingDaysElement) totalReadingDaysElement.textContent = '';
         // Pastikan elemen stats lain juga di-reset atau disembunyikan jika terjadi error
         if(statsBookListElement) statsBookListElement.innerHTML = '';
         if(statsBookListContainer) statsBookListContainer.classList.remove('expanded');
         if(toggleStatsListButton) toggleStatsListButton.style.display = 'none';

         if (window.readingChartInstance) {
             window.readingChartInstance.destroy();
             window.readingChartInstance = null;
         }
    }
}

function renderBookList() {
    if (!bookList) {
        console.error("renderBookList: Elemen bookList tidak ditemukan di DOM.");
        return;
    }
    bookList.innerHTML = '';
    const fragment = document.createDocumentFragment();
    const booksToDisplay = books;

    if (booksToDisplay.length === 0) {
         const messageItem = document.createElement('li');
         messageItem.classList.add('book-item', 'empty-list-message');
         const selectedType = filterType ? filterType.value : 'all';
         const keyword = searchInput ? searchInput.value.trim() : '';
         const isFilterOrSearchActive = selectedType !== 'all' || keyword !== '';
         if (!isFilterOrSearchActive) {
             messageItem.innerHTML = '<span>Tidak ada buku dalam daftar.</span>';
         } else {
              messageItem.innerHTML = '<span>Tidak ada buku yang cocok dengan filter atau pencarian.</span>';
         }
         fragment.appendChild(messageItem);
    } else {
         booksToDisplay.forEach((book) => {
                 const listItem = document.createElement('li');
                 listItem.classList.add('book-item');
                 const bookId = book.id;
                 const readDaysCount = Array.isArray(book.readDays) ? book.readDays.length : 0;

                 listItem.addEventListener('click', () => {
                     openDetailModal(bookId);
                 });

                 listItem.innerHTML = `
                     ${book.coverImageUrl ? `<img src="${book.coverImageUrl}" alt="Sampul Buku: ${book.title}" class="book-cover-tiny">` : ''}
                     <div class="book-details-text">
                         <span>
                             <strong>${book.title}</strong> ${book.author ? '(' + book.author + ')' : ''} (${book.type})
                         </span>
                         <span class="book-meta">
                             ${book.publishedYear > 0 ? 'Terbit: ' + book.publishedYear : ''}
                             ${book.rating > 0 ? ' | Rating: ' + book.rating.toFixed(1) : ''}
                             ${book.currentPage > 0 ? ' | Halaman Terakhir: ' + book.currentPage : ''}
                         </span>
                          ${book.isbn ? `<span class="book-meta">ISBN: ${book.isbn}</span>` : ''}
                          ${book.notes ? `<p class="book-notes-preview">${book.notes.substring(0, 150)}${book.notes.length > 150 ? '...' : ''}</p>` : ''}
                     </div>
                     <span class="book-read-count">Dibaca selama ${readDaysCount} hari</span>
                     <div class="controls">
                         <button class="mark-as-read-btn" data-book-id="${bookId}">Baca Hari Ini</button>
                         <button class="edit-book-btn" data-book-id="${bookId}">Edit</button>
                         <button class="delete-book-btn" data-book-id="${bookId}">Hapus</button>
                     </div>
                 `;

                 const controlsDiv = listItem.querySelector('.controls');
                 const markAsReadBtn = controlsDiv.querySelector('.mark-as-read-btn');
                 const editBookBtn = controlsDiv.querySelector('.edit-book-btn');
                 const deleteBookBtn = controlsDiv.querySelector('.delete-book-btn');

                 if (markAsReadBtn) {
                     markAsReadBtn.addEventListener('click', (event) => {
                         event.stopPropagation();
                         const id = event.target.dataset.bookId;
                         markAsRead(parseInt(id));
                     });
                 }
                 if (editBookBtn) {
                     editBookBtn.addEventListener('click', async (event) => {
                         event.stopPropagation();
                         const id = event.target.dataset.bookId;
                         await editBook(parseInt(id));
                     });
                 }
                 if (deleteBookBtn) {
                     deleteBookBtn.addEventListener('click', (event) => {
                         event.stopPropagation();
                         const id = event.target.dataset.bookId;
                         deleteBook(parseInt(id));
                     });
                 }
                 fragment.appendChild(listItem);
             });
        }
         bookList.appendChild(fragment);
    }

    function renderStats() {
        if (!statsContainer || !totalReadingDaysElement) {
            console.error("renderStats: Elemen statistik tidak ditemukan di DOM.");
            return;
        }
        let canvas = document.getElementById('readingChart');
        if (window.readingChartInstance) { window.readingChartInstance.destroy(); window.readingChartInstance = null; }
        if (!canvas) { canvas = document.createElement('canvas'); canvas.id = 'readingChart'; if (statsContainer && !statsContainer.querySelector('#readingChart')) { statsContainer.appendChild(canvas); }}

        const booksForStats = books;

        if (booksForStats.length === 0) {
            statsContainer.innerHTML = '<p>Tidak ada data statistik.</p>';
            totalReadingDaysElement.textContent = '';
            if (window.readingChartInstance) { window.readingChartInstance.destroy(); window.readingChartInstance = null; }
            const oldCanvas = document.getElementById('readingChart'); if(oldCanvas) oldCanvas.remove();
            return;
        }

        let totalHari = 0;
        let totalBuku = booksForStats.length;
        let onlineCount = booksForStats.filter(book => book.type === 'online').length;
        let offlineCount = totalBuku - onlineCount;
        let totalRating = 0;
        let ratedBooksCount = 0;
        let statsHtmlList = '<ul>';

        booksForStats.forEach((book) => {
             const count = Array.isArray(book.readDays) ? book.readDays.length : 0;
             totalHari += count;
             const rating = parseFloat(book.rating);
             if (!isNaN(rating) && rating > 0) { totalRating += rating; ratedBooksCount++; }
             statsHtmlList += `<li><strong>${book.title}</strong> (${book.type})`;
             if (book.publishedYear > 0) statsHtmlList += ` | Terbit: ${book.publishedYear}`;
             if (!isNaN(rating) && rating > 0) statsHtmlList += ` | Rating: ${rating.toFixed(1)}`;
             if (book.currentPage > 0) statsHtmlList += ` | Halaman Terakhir: ${book.currentPage}`;
             statsHtmlList += ` - ${count} hari</li>`;
        });
        statsHtmlList += '</ul>';

        let summaryHtml = `
            <p><strong>Jumlah Total Buku (dalam filter):</strong> ${totalBuku}</p>
            <p><strong>Online (dalam filter):</strong> ${onlineCount} | <strong>Offline (dalam filter):</strong> ${offlineCount}</p>
        `;
         if (ratedBooksCount > 0) { summaryHtml += `<p><strong>Rata-rata Rating (dari ${ratedBooksCount} buku dalam filter):</strong> ${(totalRating / ratedBooksCount).toFixed(1)}</p>`; }

        const existingCanvas = statsContainer.querySelector('canvas');
        statsContainer.innerHTML = summaryHtml + statsHtmlList;
        if(existingCanvas) statsContainer.appendChild(existingCanvas);
        else { canvas = document.createElement('canvas'); canvas.id = 'readingChart'; statsContainer.appendChild(canvas); }

        totalReadingDaysElement.textContent = `Total hari membaca semua buku (dalam filter): ${totalHari} hari`;

        const dateCounts = {};
        booksForStats.forEach(book => { if (Array.isArray(book.readDays)) { book.readDays.forEach(date => { if (typeof date === 'string') { dateCounts[date] = (dateCounts[date] || 0) + 1; } }); } });
        const sortedDates = Object.keys(dateCounts).sort((a, b) => { const [da, ma, ya] = a.split('/'); const [db, mb, yb] = b.split('/'); const dateA = new Date(ya, ma - 1, da); const dateB = new Date(yb, mb - 1, db); return dateA.getTime() - dateB.getTime(); });
        const counts = sortedDates.map(date => dateCounts[date]);
        const ctx = document.getElementById('readingChart')?.getContext('2d');

         if (ctx && sortedDates.length > 0) {
            if (window.readingChartInstance) { window.readingChartInstance.destroy(); }
            window.readingChartInstance = new Chart(ctx, {
                type: 'bar', data: { labels: sortedDates, datasets: [{ label: 'Jumlah Buku Dibaca per Hari (dalam filter)', data: counts, backgroundColor: 'rgba(32, 201, 151, 0.8)', borderColor: '#20c997', borderWidth: 1 }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: true, text: 'Statistik Hari Membaca per Tanggal (dalam filter)', font: { family: 'Arial, sans-serif', size: 14 }, color: '#000' } }, scales: { y: { beginAtZero: true, stepSize: 1, title: { display: true, text: 'Jumlah Buku', font: { family: 'Arial, sans-serif', size: 12 }, color: '#000' }, ticks: { precision: 0, color: '#000', font: { family: 'Arial, sans-serif' } } }, x: { title: { display: true, text: 'Tanggal', font: { family: 'Arial, sans-serif', size: 12 }, color: '#000' }, ticks: { color: '#000', font: { family: 'Arial, sans-serif' } } } } }
            });
         } else {
             if (window.readingChartInstance) { window.readingChartInstance.destroy(); window.readingChartInstance = null; }
             const chartContainer = document.getElementById('statsContainer');
              if (chartContainer && chartContainer.querySelector('canvas')) {
                   if (!chartContainer.querySelector('.no-chart-data-message')) {
                       const msg = document.createElement('p'); msg.classList.add('no-chart-data-message'); msg.textContent = 'Tidak ada data hari membaca untuk ditampilkan di grafik dalam filter ini.'; msg.style.fontStyle = 'italic';
                       const currentCanvas = chartContainer.querySelector('canvas'); if(currentCanvas) currentCanvas.remove();
                       chartContainer.appendChild(msg);
                   }
              }
         }
    }

    async function handleImport(event) {
        console.log("Import: Memulai proses import.");
        const file = event.target.files[0];
        if (!file) { return; }
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (Array.isArray(importedData)) {
                    const cleanedImportedData = importedData.map(book => {
                         if (typeof book === 'object' && book !== null) {
                             const cleanedBook = {
                                title: book.title || '', author: book.author || '', type: book.type || 'offline', readDays: Array.isArray(book.readDays) ? book.readDays : [],
                                isbn: book.isbn || '', publishedYear: book.publishedYear ? parseInt(book.publishedYear) || 0 : 0,
                                rating: book.rating ? parseFloat(book.rating) || 0 : 0, currentPage: book.currentPage ? parseInt(book.currentPage) || 0 : 0,
                                notes: book.notes || '', coverImageUrl: book.coverImageUrl || ''
                             };
                             if (book.hasOwnProperty('id')) { cleanedBook.id = parseInt(book.id); if (isNaN(cleanedBook.id)) { delete cleanedBook.id; }}
                             return cleanedBook;
                         } return null;
                    }).filter(book => book !== null);
                    if (cleanedImportedData.length > 0) {
                         if (confirm(`Apakah Anda ingin mengganti semua data buku yang ada (${books.length} buku) dengan ${cleanedImportedData.length} buku dari file ini? (Ini akan menghapus data yang ada)`)) {
                            try { await db.books.clear(); await db.books.bulkAdd(cleanedImportedData); console.log(`Import: ${cleanedImportedData.length} buku berhasil diimpor.`); alert(`Berhasil mengimpor ${cleanedImportedData.length} buku!`); await renderBooksAndUpdateUI();
                            } catch (bulkAddError) { console.error("Import: Gagal melakukan bulkAdd:", bulkAddError); alert("Gagal mengimpor data."); await renderBooksAndUpdateUI(); }
                         } else { alert("Import dibatalkan."); }
                    } else { alert("Tidak ada data buku yang valid ditemukan dalam file impor."); }
                } else { alert("Format file JSON tidak valid. Pastikan isinya adalah array."); }
            } catch (error) { console.error("Import: Gagal membaca atau menguraikan file JSON:", error); alert("Gagal membaca atau menguraikan file JSON."); }
            finally { if(importFile) importFile.value = ''; }
        };
        reader.onerror = () => { console.error("Import: Gagal membaca file:", reader.error); alert("Gagal membaca file."); if(importFile) importFile.value = ''; };
        reader.readAsText(file);
    }

    async function handleExport() {
        console.log("Export: Memulai proses export.");
        const allBooks = await db.books.toArray();
        if (allBooks.length === 0) { alert("Tidak ada buku untuk diekspor."); return; }
        const jsonString = JSON.stringify(allBooks, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'my_library.json';
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
        console.log("Export: Proses export selesai.");
    }

    // --- Fungsi Pengingat ---
    function initReminderTimePicker() {
         if (!reminderTimeInput) { console.error("initReminderTimePicker: Elemen reminderTimeInput tidak ditemukan."); return; }
         const storedTime = localStorage.getItem(REMINDER_TIME_KEY);
         if (storedTime) { reminderTimeInput.value = storedTime; }
         else { reminderTimeInput.value = "20:00"; saveReminderTime(); }
    }
    function saveReminderTime() {
         if (!reminderTimeInput) { console.error("saveReminderTime: Elemen reminderTimeInput tidak ditemukan."); return; }
         localStorage.setItem(REMINDER_TIME_KEY, reminderTimeInput.value);
         startDailyReminder();
    }
    function startDailyReminder() {
         if (!("Notification" in window) || Notification.permission !== "granted") { return; }
         const reminderTime = localStorage.getItem(REMINDER_TIME_KEY);
         const lastReminderDate = localStorage.getItem(LAST_REMINDER_DATE_KEY);
         const today = new Date().toLocaleDateString();
         if (!reminderTime) { return; }
         const [hours, minutes] = reminderTime.split(':').map(Number);
         const now = new Date();
         const reminderDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
         const lastReminderTimestamp = localStorage.getItem(LAST_REMINDER_DATE_KEY + '_ts');
         const nowTimestamp = now.getTime();
         const oneDay = 24 * 60 * 60 * 1000;
         const isTodayReminderSent = lastReminderDate === today;
         const isReminderTimePassed = now >= reminderDateTime;
         const isTimestampReasonable = !lastReminderTimestamp || (nowTimestamp - parseInt(lastReminderTimestamp) > -oneDay && nowTimestamp - parseInt(lastReminderTimestamp) < oneDay * 365);
         if (!isTodayReminderSent && isReminderTimePassed && isTimestampReasonable) {
             db.books.count().then(bookCount => {
                 if (bookCount > 0) {
                      const notificationTitle = "Waktunya Membaca!";
                      const notificationOptions = { body: "Yuk, luangkan waktu sebentar untuk membaca buku hari ini.", icon: './book-icon.png', tag: 'daily-reading-reminder', renotify: true };
                      try { new Notification(notificationTitle, notificationOptions); localStorage.setItem(LAST_REMINDER_DATE_KEY, today); localStorage.setItem(LAST_REMINDER_DATE_KEY + '_ts', nowTimestamp.toString()); }
                      catch (e) { console.error("startDailyReminder: Gagal menampilkan notifikasi:", e); }
                 }
             }).catch(error => { console.error("startDailyReminder: Gagal menghitung buku untuk pengingat:", error); });
         }
    }


// --- Kode yang berjalan setelah DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', async () => {
    // Inisialisasi referensi elemen DOM di sini
    bookModal = document.getElementById('bookModal');
    modalTitle = document.getElementById('modalTitle');
    bookForm = document.getElementById('bookForm');
    modalTitleInput = document.getElementById('modalTitleInput');
    modalAuthorInput = document.getElementById('modalAuthorInput');
    modalTypeSelect = document.getElementById('modalTypeSelect');
    bookIndexInput = document.getElementById('bookIndex');
    editModalCloseButton = document.querySelector('#bookModal .close-button');
    openAddBookModalButton = document.getElementById('openAddBookModal');

    modalIsbnInput = document.getElementById('modalIsbnInput');
    modalPublishedYearInput = document.getElementById('modalPublishedYearInput');
    modalRatingInput = document.getElementById('modalRatingInput');
    modalCurrentPageInput = document.getElementById('modalCurrentPageInput');
    modalNotesInput = document.getElementById('modalNotesInput');
    modalCoverImageUrlInput = document.getElementById('modalCoverImageUrlInput');

    bookDetailModal = document.getElementById('bookDetailModal');
    detailCloseButton = document.querySelector('#bookDetailModal .detail-close-button');
    detailCoverImage = document.getElementById('detailCoverImage');
    detailTitle = document.getElementById('detailTitle');
    detailAuthor = document.getElementById('detailAuthor');
    detailType = document.getElementById('detailType');
    detailPublishedYear = document.getElementById('detailPublishedYear');
    detailRating = document.getElementById('detailRating');
    detailCurrentPage = document.getElementById('detailCurrentPage');
    detailIsbn = document.getElementById('detailIsbn');
    detailNotes = document.getElementById('detailNotes');
    detailReadDays = document.getElementById('detailReadDays');

    bookList = document.getElementById('bookList');
    filterType = document.getElementById('filterType');
    searchInput = document.getElementById('searchInput');
    sortBy = document.getElementById('sortBy'); // Ini sudah ada, pastikan namanya benar 'sortBy'
    importButton = document.getElementById('importButton');
    importFile = document.getElementById('importFile');
    exportButton = document.getElementById('exportButton');
    reminderTimeInput = document.getElementById('reminderTime');
    statsContainer = document.getElementById('statsContainer');
    totalReadingDaysElement = document.getElementById('totalReadingDays');

    // >>> TAMBAHKAN INI:
    toggleStatsListButton = document.getElementById('toggleStatsList'); // Inisialisasi tombol toggle
    statsBookListElement = document.getElementById('statsBookList'); // Inisialisasi UL daftar buku stats
    statsBookListContainer = document.getElementById('statsBookListContainer'); // Inisialisasi container collapse
    // <<< AKHIR PENAMBAHAN


    // --- Menambahkan Event Listeners Utama ---
    // Tombol untuk membuka modal Tambah Buku
    if (openAddBookModalButton) {
        openAddBookModalButton.addEventListener('click', () => {
            openModal(); // Panggil openModal tanpa argumen untuk mode tambah
        });
    } else { console.error("Event: openAddBookModalButton not found."); }

    // Event listener untuk menutup modal Tambah/Edit (klik tombol X)
    if (editModalCloseButton) {
        editModalCloseButton.addEventListener('click', closeModal);
    } else { console.error("Event: editModalCloseButton not found."); }

     // Event listener untuk menutup modal Detail (klik tombol X)
     if (detailCloseButton) {
        detailCloseButton.addEventListener('click', closeDetailModal);
    } else { console.error("Event: detailCloseButton not found."); }


    // Event listener untuk menutup modal saat mengklik di luar konten modal (untuk kedua modal)
document.addEventListener('DOMContentLoaded', async () => {
    // ... (Inisialisasi semua referensi elemen DOM seperti yang sudah ada) ...
    // toggleStatsListButton, statsBookListElement, statsBookListContainer juga diinisialisasi di sini.

    // --- Menambahkan Event Listeners Utama ---

    // Tombol untuk membuka modal Tambah Buku
    if (openAddBookModalButton) {
        openAddBookModalButton.addEventListener('click', () => {
            openModal();
        });
    } else { console.error("Event: openAddBookModalButton not found."); }

    // Event listener untuk menutup modal Tambah/Edit (klik tombol X)
    if (editModalCloseButton) {
        editModalCloseButton.addEventListener('click', closeModal);
    } else { console.error("Event: editModalCloseButton not found."); }

    // Event listener untuk menutup modal Detail (klik tombol X)
    if (detailCloseButton) {
        detailCloseButton.addEventListener('click', closeDetailModal);
    } else { console.error("Event: detailCloseButton not found."); }

    // Event listener untuk menutup modal saat mengklik di luar konten modal (untuk kedua modal)
    window.addEventListener('click', async (event) => {
        if (bookModal && event.target === bookModal) {
            closeModal();
        }
        if (bookDetailModal && event.target === bookDetailModal) {
            closeDetailModal();
        }
        // KOSONGKAN BAGIAN INI DARI LISTENER LAIN
    });


    // Event listener untuk submit form di dalam modal Tambah/Edit
    if (bookForm && modalTitleInput && modalAuthorInput && modalTypeSelect && bookIndexInput && modalIsbnInput && modalPublishedYearInput && modalRatingInput && modalCurrentPageInput && modalNotesInput && modalCoverImageUrlInput) {
        bookForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = modalTitleInput.value.trim();
            const author = modalAuthorInput.value.trim();
            const type = modalTypeSelect.value;
            const bookId = bookIndexInput.value;

            const isbn = modalIsbnInput.value.trim();
            const rating = parseFloat(modalRatingInput.value) || 0;
            const publishedYear = parseInt(modalPublishedYearInput.value) || 0;
            const currentPage = parseInt(modalCurrentPageInput.value) || 0;
            const notes = modalNotesInput.value.trim();
            const coverImageUrl = modalCoverImageUrlInput.value.trim();


            if (title === '') {
                alert('Judul buku wajib diisi.');
                return;
            }
            if (rating < 0 || rating > 5) {
                 alert('Rating harus antara 0 sampai 5.');
                 return;
            }

            const bookData = {
                 title, author, type, isbn, publishedYear, rating, currentPage, notes, coverImageUrl
            };

            if (bookId !== '') { // Mode Edit
                 const idToUpdate = parseInt(bookId);
                 if (!isNaN(idToUpdate)) {
                     bookData.id = idToUpdate;
                     try {
                         const existingBook = await db.books.get(idToUpdate);
                         if (existingBook) {
                             bookData.readDays = existingBook.readDays;
                             await db.books.put(bookData);
                             console.log(`Buku "${bookData.title}" berhasil diperbarui.`);
                             await renderBooksAndUpdateUI();
                             closeModal();
                         } else {
                             console.error("Submit: Buku dengan ID", idToUpdate, "tidak ditemukan untuk diperbarui.");
                             alert("Terjadi kesalahan: Buku tidak ditemukan.");
                             closeModal();
                         }
                     } catch (error) {
                         console.error("Submit: Gagal memperbarui buku:", error);
                         alert("Gagal menyimpan perubahan buku.");
                     }
                 } else {
                     console.error("Submit: ID buku tidak valid untuk diedit:", bookId);
                     alert("Terjadi kesalahan: ID buku tidak valid.");
                     closeModal();
                 }
            } else { // Mode Tambah
                 bookData.readDays = [];
                 try {
                     const addedId = await db.books.add(bookData);
                     console.log(`Buku baru ditambahkan dengan ID: ${addedId}`);
                     await renderBooksAndUpdateUI();
                     closeModal();
                 } catch (error) {
                     console.error("Submit: Gagal menambah buku:", error);
                     alert("Gagal menambah buku baru.");
                 }
            }
        });
    } else { console.error("Event: bookForm or its required inputs not found. Cannot attach submit listener."); }

    // Event listeners untuk Filter, Pencarian, dan Penyortiran (PINDAHKAN KE SINI)
    if (filterType) { filterType.addEventListener('change', renderBooksAndUpdateUI); } else { console.error("Event: filterType not found."); }
    if (searchInput) { searchInput.addEventListener('input', renderBooksAndUpdateUI); } else { console.error("Event: searchInput not found."); } // Pastikan ID searchInput unik di HTML
    if (sortBy) { sortBy.addEventListener('change', renderBooksAndUpdateUI); } else { console.error("Event: sortBy not found."); }

    // Event listeners untuk Import/Export (PINDAHKAN KE SINI)
    if (importButton && importFile) {
        importButton.addEventListener('click', () => { if (importFile) importFile.click(); });
        importFile.addEventListener('change', handleImport);
    } else { console.error("Event: importButton or importFile not found."); }
    if (exportButton) { exportButton.addEventListener('click', handleExport); } else { console.error("Event: exportButton not found."); }

    // Event listener untuk Input Waktu Pengingat (PINDAHKAN KE SINI)
    if (reminderTimeInput) { reminderTimeInput.addEventListener('change', saveReminderTime); } else { console.error("Event: reminderTimeInput not found."); }

    // Event listener untuk Tombol Toggle Statistik (PINDAHKAN KE SINI)
    if (toggleStatsListButton && statsBookListContainer) {
        toggleStatsListButton.addEventListener('click', () => {
            const isExpanded = statsBookListContainer.classList.toggle('expanded');
            toggleStatsListButton.textContent = isExpanded ? '[Sembunyikan Detail]' : '[Tampilkan Detail]';
            // Pertimbangkan menambahkan aria-expanded di sini juga
            // toggleStatsListButton.setAttribute('aria-expanded', isExpanded);
        });
    } else { console.error("Event: toggleStatsListButton or statsBookListContainer not found."); }

    // Event listener untuk submit form di dalam modal Tambah/Edit
    if (bookForm && modalTitleInput /* && semua input lainnya */) {
        bookForm.addEventListener('submit', async (e) => {
            // ... (logika submit form yang sudah ada) ...
        });
    } else { console.error("Event: bookForm or its required inputs not found. Cannot attach submit listener."); }

    // HAPUS BLOK LISTENER DUPLIKAT DI BAWAH INI JIKA MASIH ADA (karena sudah dipindah ke atas)
    // if (filterType) { filterType.addEventListener('change', renderBooksAndUpdateUI); } ...
    // if (searchInput) { searchInput.addEventListener('input', renderBooksAndUpdateUI); } ...
    // if (sortBy) { sortBy.addEventListener('change', renderBooksAndUpdateUI); } ...
    // if (importButton && importFile) { ... } ...
    // if (exportButton) { exportButton.addEventListener('click', handleExport); } ...
    // if(reminderTimeInput) { reminderTimeInput.addEventListener('change', saveReminderTime); } ...


    // --- Inisialisasi Aplikasi ---
    await renderBooksAndUpdateUI();
    initReminderTimePicker();

}); // Akhir dari DOMContentLoaded