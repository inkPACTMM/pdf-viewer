$(document).ready(function () {
    // Enhanced navbar scroll effect
    $(window).scroll(function () {
        if ($(this).scrollTop() > 50) {
            $('.navbar').addClass('scrolled');
        } else {
            $('.navbar').removeClass('scrolled');
        }
    });

    // Auto-close mobile menu when clicking on links
    $('.navbar-nav .nav-link').on('click', function () {
        if ($(window).width() < 992) {
            $('.navbar-collapse').collapse('hide');
        }
    });

    // Close mobile menu when clicking outside
    $(document).on('click', function (e) {
        if (!$(e.target).closest('.navbar').length) {
            $('.navbar-collapse').collapse('hide');
        }
    });

    // Enhanced search form interaction
    $('#searchInput').on('focus', function () {
        $(this).closest('.input-group').addClass('focused');
    }).on('blur', function () {
        $(this).closest('.input-group').removeClass('focused');
    });

    let allBooks = [];
    let cachedData = sessionStorage.getItem('libraryBooks');
    let lastScrollPosition = sessionStorage.getItem('libraryScrollPosition');

    function handleBooksDisplay() {
        // Always check for search query and cached data
        cachedData = sessionStorage.getItem('libraryBooks'); // Refresh cache
        lastScrollPosition = sessionStorage.getItem('libraryScrollPosition');
        if (cachedData) {
            allBooks = JSON.parse(cachedData);
            const urlParams = new URLSearchParams(window.location.search);
            const searchQuery = urlParams.get('q');
            if (searchQuery && searchQuery.trim() !== '') {
                $('#searchInput').val(searchQuery);
                const term = searchQuery.toLowerCase();
                const filteredBooks = allBooks.filter(book =>
                    book.title.toLowerCase().includes(term) ||
                    book.author.toLowerCase().includes(term) ||
                    (book.description && book.description.toLowerCase().includes(term))
                );
                renderBooks(filteredBooks);
                setupPagination(filteredBooks);
            } else {
                renderBooks(allBooks);
                setupPagination(allBooks);
            }
            // Restore scroll position
            if (lastScrollPosition) {
                $(window).scrollTop(lastScrollPosition);
            }
        } else {
            // Show loading only if no cache exists
            $('.bookshelf-container').html(`
                <div class="loading-state text-center py-5">
                    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                        <span class="sr-only">Loading...</span>
                    </div>
                    <h4 class="mt-3">Loading Books...</h4>
                    <p class="text-muted">Please wait while we fetch the latest collection</p>
                </div>
            `);
        }
    }

    // Initial display (always use cache if available)
    handleBooksDisplay();

    // Load books data (refresh cache after fetch)
    (function refreshBooks() {
        fetch(`${API_BASE}/api/books`)
            .then(resp => {
                if (!resp.ok) throw new Error('Failed to fetch books');
                return resp.json();
            })
            .then(data => {
                const list = data.data || data.books || data || [];
                allBooks = list;
                sessionStorage.setItem('libraryBooks', JSON.stringify(allBooks));
                handleBooksDisplay();
            })
            .catch(() => {
                if (!cachedData) {
                    $('.bookshelf-container').html(`
                        <div class="alert alert-danger m-5 text-center">
                            <h4><i class="fas fa-exclamation-triangle mr-2"></i>Error Loading Books</h4>
                            <p>Unable to load the library at this time. Please check your connection and try again.</p>
                            <button class="btn btn-primary mt-3" onclick="location.reload()">
                                <i class="fas fa-redo mr-2"></i>Retry
                            </button>
                        </div>
                    `);
                }
            });
    })();

    // Save scroll position when leaving page
    $(window).on('beforeunload', function () {
        sessionStorage.setItem('libraryScrollPosition', $(window).scrollTop());
    });

    // Handle visibility change (browser back/forward navigation)
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') {
            handleBooksDisplay();
        }
    });

    function showPage(pageNum) {
        // Update active pagination button
        $('.pagination .page-item').removeClass('active');
        $(`.pagination .page-item`).filter(function () {
            const p = $(this).find('.page-link').data('page');
            return parseInt(p) === parseInt(pageNum);
        }).addClass('active');

        // Fade transition between pages
        $('.bookshelf-page').not(`[data-page="${pageNum}"]`).fadeOut(200);
        $(`.bookshelf-page[data-page="${pageNum}"]`).fadeIn(400);

        sessionStorage.setItem('lastActivePage', pageNum);
    }

    // Replace the search input handler with form submit handler
    $('#searchForm').on('submit', function (e) {
        e.preventDefault();
        const searchTerm = $('#searchInput').val().toLowerCase();

        // Add loading effect to search button
        const $btn = $(this).find('.btn');
        const originalText = $btn.html();
        $btn.addClass('btn-searching').html(
            '<i class="fa fa-spinner fa-spin mr-2"></i>Searching...');

        setTimeout(() => {
            const filteredBooks = allBooks.filter(book =>
                book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm) ||
                (book.description && book.description.toLowerCase().includes(
                    searchTerm))
            );
            renderBooks(filteredBooks);
            setupPagination(filteredBooks);
            $btn.removeClass('btn-searching').html(originalText);
        }, 500);

        // Update URL with search parameter without reloading
        const url = new URL(window.location);
        url.searchParams.set('q', searchTerm);
        window.history.pushState({}, '', url);
    });

    // Set worker path for PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

    // `API_BASE` and `toAbsolute()` are provided by `code/js/config.js`

    async function renderPDFThumbnail(pdfUrl) {
        try {
            const loadingTask = pdfjsLib.getDocument(pdfUrl);
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);

            const scale = 1.5;
            const viewport = page.getViewport({
                scale
            });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            return canvas.toDataURL();
        } catch (error) {
            console.error('Error rendering PDF thumbnail:', error);
            return null;
        }
    }

    function renderBooks(books) {
        const booksPerShelf = window.innerWidth <= 480 ? 2 : (window.innerWidth <= 768 ? 4 : 5);
        const shelvesPerPage = 2;
        $('.bookshelf-container').empty();

        if (books.length === 0) {
            $('.bookshelf-container').html(`
                <div class="empty-state">
                    <div class="mb-4">
                        <i class="fas fa-search" style="font-size: 4rem; color: #012FB3; opacity: 0.3;"></i>
                    </div>
                    <h3>No books found</h3>
                    <p>Try a different search term or <a href="library.html" class="text-primary">browse all books</a>.</p>
                </div>
            `);
            $('.pagination').empty();
            return;
        }

        const chunkedBooks = [];
        for (let i = 0; i < books.length; i += booksPerShelf * shelvesPerPage) {
            chunkedBooks.push(books.slice(i, i + booksPerShelf * shelvesPerPage));
        }

        const $container = $('<div class="bookshelf-pages"></div>');

        chunkedBooks.forEach((pageBooks, pageIndex) => {
            const $page = $(`<div class="bookshelf-page" data-page="${pageIndex + 1}"></div>`);

            const shelfCount = Math.min(2, Math.ceil(pageBooks.length / booksPerShelf));
            for (let shelf = 0; shelf < shelfCount; shelf++) {
                const shelfBooks = pageBooks.slice(shelf * booksPerShelf, (shelf + 1) *
                    booksPerShelf);
                const $shelf = $(`
                    <div class="bookshelf mb-5">
                        <div class="covers">
                            ${shelfBooks.map((book, index) => `
                                <div class="thumb book-1" data-id="${book.id}" data-book-id="${book.id}">
                                    <div class="book-tooltip">${book.title}</div>
                                    <a href="v-pdf.html?id=${book.id}">
                                            <img src="${toAbsolute(book.thumbnail)}" alt="${book.title}" loading="lazy">
                                    </a>
                                </div>
                            `).join('')}
                        </div>
                            <img class="shelf-img" src="images/shelf_wood.png" loading="lazy" alt="Bookshelf">
                    </div>
                `);
                $page.append($shelf);
            }

            $container.append($page);
        });

        $('.bookshelf-container').append($container);

        $('.bookshelf-page').hide();
        $('.bookshelf-page[data-page="1"]').show();

        // Initialize flipBook for each book element with its own pdfUrl
        $container.find('.thumb').each(function () {
            const $thumb = $(this);
            const bookId = $thumb.data('book-id');
            const book = books.find(b => b.id == bookId) || {};
            const pdfUrl = toAbsolute((book && (book.pdfUrl || book.pdf)) || 'data/pdf/pdf.pdf');

            // Attach flipBook to the thumb container so clicking the cover opens the flipbook
            $thumb.flipBook({
                pdfUrl: pdfUrl,
                lightBox: true,
                layout: 3,
                currentPage: {
                    vAlign: "bottom",
                    hAlign: "left"
                },
                btnShare: { enabled: false },
                btnPrint: { hideOnMobile: true },
                btnDownloadPages: {
                    enabled: true,
                    title: "Download pages",
                    icon: "fa-download",
                    icon2: "file_download",
                    url: toAbsolute('images/pdf.rar'),
                    name: "allPages.zip",
                    hideOnMobile: false
                },
                btnColor: '#012FB3',
                sideBtnColor: '#012FB3',
                sideBtnSize: 60,
                sideBtnBackground: "rgba(0,0,0,.7)",
                sideBtnRadius: 60
            });
        });

        // SIMPLIFIED TOOLTIP HANDLING
        setTimeout(() => {
            $('.book-tooltip').each(function () {
                const $tooltip = $(this);
                const $thumb = $tooltip.closest('.thumb');

                // Simple touch device support
                $thumb.on('touchstart', function (e) {
                    $('.book-tooltip').not($tooltip).css({
                        'opacity': '0',
                        'visibility': 'hidden'
                    });

                    $tooltip.css({
                        'opacity': '1',
                        'visibility': 'visible'
                    });

                    setTimeout(() => {
                        $tooltip.css({
                            'opacity': '0',
                            'visibility': 'hidden'
                        });
                    }, 2000);
                });
            });
        }, 100);
    }

    function setupPagination(books) {
        const booksPerPage = 10; // 2 shelves × 5 books
        const pageCount = Math.ceil(books.length / booksPerPage);

        // Update pagination UI
        let paginationHtml = `
            <li class="page-item ${pageCount <= 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" tabindex="-1" aria-label="Previous">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;

        for (let i = 1; i <= pageCount; i++) {
            paginationHtml += `
                <li class="page-item ${i === 1 ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }

        paginationHtml += `
            <li class="page-item ${pageCount <= 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" aria-label="Next">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;

        $('.pagination').html(paginationHtml);

        // Update pagination click handlers
        $('.pagination').off('click').on('click', '.page-item', function (e) {
            e.preventDefault();
            if ($(this).hasClass('disabled')) return;

            const $link = $(this).find('.page-link');

            // Determine currently active page number
            const $active = $('.pagination .page-item').filter('.active');
            let currentPage = 1;
            if ($active.length) {
                currentPage = parseInt($active.find('.page-link').data('page')) || $active.index() + 1;
            }

            let pageNum = currentPage;

            if ($link.attr('aria-label') === 'Previous') {
                pageNum = Math.max(1, currentPage - 1);
            } else if ($link.attr('aria-label') === 'Next') {
                pageNum = Math.min(pageCount, currentPage + 1);
            } else {
                pageNum = parseInt($link.data('page')) || currentPage;
            }

            if (pageNum && pageNum >= 1 && pageNum <= pageCount) {
                showPage(pageNum);
            }
        });
    }
});