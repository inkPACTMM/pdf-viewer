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

    let allBlogs = [];

    // Load blogs data
    function loadBlogs() {
        $('#blogsGrid').html(`
                    <div class="loading-state text-center py-5" style="grid-column: 1 / -1;">
                        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                            <span class="sr-only">Loading...</span>
                        </div>
                        <h4 class="mt-3">Loading Blogs...</h4>
                        <p class="text-muted">Please wait while we fetch the latest stories</p>
                    </div>
                `);

        $.ajax({
            url: '../data/blogs.json',
            dataType: 'json',
            success: function (data) {
                allBlogs = data.blogs;
                renderBlogs(allBlogs);
            },
            error: function () {
                $('#blogsGrid').html(`
                            <div class="alert alert-danger m-5 text-center" style="grid-column: 1 / -1;">
                                <h4><i class="fas fa-exclamation-triangle mr-2"></i>Error Loading Blogs</h4>
                                <p>Unable to load blogs at this time. Please try again later.</p>
                                <button class="btn btn-primary mt-3" onclick="location.reload()">
                                    <i class="fas fa-redo mr-2"></i>Retry
                                </button>
                            </div>
                        `);
            }
        });
    }

    // Render blogs - Updated to include clickable names
    function renderBlogs(blogs) {
        $('#blogsGrid').empty();

        if (blogs.length === 0) {
            $('#blogsGrid').html(`
                        <div class="empty-state">
                            <div class="mb-4">
                                <i class="fas fa-search" style="font-size: 4rem; color: #012FB3; opacity: 0.3;"></i>
                            </div>
                            <h3>No blogs found</h3>
                            <p>Try a different search term or <a href="blogs.html" class="text-primary">browse all blogs</a>.</p>
                        </div>
                    `);
            return;
        }

        blogs.forEach((blog, index) => {
            // Format multiple writers and designers with clickable links
            const writers = Array.isArray(blog.writers) ? blog.writers : [blog.writers];
            const designers = Array.isArray(blog.graphicDesigners) ? blog.graphicDesigners : [
                blog.graphicDesigners
            ];

            const writersHTML = writers.filter(w => w && w.trim()).map(writer =>
                `<a href="profile.html?name=${encodeURIComponent(writer)}" class="writer-link">${writer}</a>`
            ).join(', ');

            const designersHTML = designers.filter(d => d && d.trim()).map(designer =>
                `<a href="profile.html?name=${encodeURIComponent(designer)}" class="designer-link">${designer}</a>`
            ).join(', ');

            // Handle multiple categories
            const categories = Array.isArray(blog.categories) ? blog.categories : (blog
                .category ? [blog.category] : ['General']);
            const categoriesHTML = categories.map(cat =>
                `<span class="blog-category">${cat}</span>`).join('');

            const blogCard = `
                        <div class="blog-card" data-blog-id="${blog.id}" style="animation-delay: ${index * 0.1}s">
                            <div class="blog-image-container">
                                <img src="${blog.image}" alt="${blog.blogName}" class="blog-image" loading="lazy">
                                <div class="blog-categories">
                                    ${categoriesHTML}
                                </div>
                            </div>
                            <div class="blog-content">
                                <h3 class="blog-title">${blog.blogName}</h3>
                                <div class="blog-meta">
                                    <span class="blog-writer">
                                        <i class="fas fa-pen mr-1"></i>
                                        ${writersHTML || 'Unknown'}
                                    </span>
                                    <span class="blog-designer">
                                        <i class="fas fa-palette mr-1"></i>
                                        ${designersHTML || 'Unknown'}
                                    </span>
                                    <span class="blog-date">
                                        <i class="fas fa-calendar mr-1"></i>
                                        ${new Date(blog.date).toLocaleDateString()}
                                    </span>
                                    <span class="blog-read-time">
                                        <i class="fas fa-clock mr-1"></i>
                                        ${blog.readTime}
                                    </span>
                                </div>
                                <p class="blog-description">${blog.description}</p>
                                <a href="blog-detail.html?id=${blog.id}" class="read-more-btn">
                                    Read Full Article <i class="fas fa-arrow-right ml-1"></i>
                                </a>
                            </div>
                        </div>
                    `;
            $('#blogsGrid').append(blogCard);
        });

        // Add click handler to blog cards (excluding profile links)
        $('.blog-card').on('click', function (e) {
            if (!$(e.target).closest('.read-more-btn, .writer-link, .designer-link').length) {
                const blogId = $(this).data('blog-id');
                window.location.href = `blog-detail.html?id=${blogId}`;
            }
        });
    }

    // Search functionality - Updated to include content keywords
    $('#searchForm').on('submit', function (e) {
        e.preventDefault();
        const searchTerm = $('#searchInput').val().toLowerCase().trim();

        if (searchTerm === '') {
            renderBlogs(allBlogs);
            return;
        }

        const filteredBlogs = allBlogs.filter(blog => {
            // Search in blog name and description
            const basicMatch = blog.blogName.toLowerCase().includes(searchTerm) ||
                blog.description.toLowerCase().includes(searchTerm);

            // Search in writers array
            const writersMatch = Array.isArray(blog.writers) ?
                blog.writers.some(writer => writer.toLowerCase().includes(searchTerm)) :
                (blog.writers && blog.writers.toLowerCase().includes(searchTerm));

            // Search in graphic designers array
            const designersMatch = Array.isArray(blog.graphicDesigners) ?
                blog.graphicDesigners.some(designer => designer.toLowerCase().includes(
                    searchTerm)) :
                (blog.graphicDesigners && blog.graphicDesigners.toLowerCase().includes(
                    searchTerm));

            // Search in categories array
            const categoriesMatch = Array.isArray(blog.categories) ?
                blog.categories.some(category => category.toLowerCase().includes(
                    searchTerm)) :
                (blog.category && blog.category.toLowerCase().includes(searchTerm));

            // Search in content - NEW: Split content into words and search for keywords
            const contentMatch = blog.content && blog.content.toLowerCase().includes(
                searchTerm);

            // Advanced content keyword matching - search for partial matches in content
            const contentKeywordMatch = blog.content &&
                blog.content.toLowerCase().split(/\s+/).some(word =>
                    word.includes(searchTerm) || searchTerm.includes(word.replace(
                        /[^\w]/g, ''))
                );

            return basicMatch || writersMatch || designersMatch || categoriesMatch ||
                contentMatch || contentKeywordMatch;
        });

        renderBlogs(filteredBlogs);
    });

    // Enhanced real-time search as user types (optional)
    let searchTimeout;
    $('#searchInput').on('input', function () {
        const searchTerm = $(this).val().toLowerCase().trim();

        // Clear previous timeout
        clearTimeout(searchTimeout);

        // Add delay to avoid too many searches while typing
        searchTimeout = setTimeout(() => {
            if (searchTerm.length >= 2) { // Only search after 2 characters
                const filteredBlogs = allBlogs.filter(blog => {
                    // Quick search in title, description, and key content words
                    const quickMatch = blog.blogName.toLowerCase().includes(
                            searchTerm) ||
                        blog.description.toLowerCase().includes(searchTerm) ||
                        (blog.content && blog.content.toLowerCase().includes(
                            searchTerm));

                    // Search in writers
                    const writersMatch = Array.isArray(blog.writers) ?
                        blog.writers.some(writer => writer.toLowerCase()
                            .includes(searchTerm)) :
                        (blog.writers && blog.writers.toLowerCase().includes(
                            searchTerm));

                    // Search in categories
                    const categoriesMatch = Array.isArray(blog.categories) ?
                        blog.categories.some(category => category.toLowerCase()
                            .includes(searchTerm)) :
                        (blog.category && blog.category.toLowerCase().includes(
                            searchTerm));

                    return quickMatch || writersMatch || categoriesMatch;
                });

                renderBlogs(filteredBlogs);
            } else if (searchTerm.length === 0) {
                renderBlogs(allBlogs); // Show all blogs when search is empty
            }
        }, 300); // 300ms delay
    });

    // Clear search functionality
    $('#searchInput').on('keydown', function (e) {
        if (e.key === 'Escape') {
            $(this).val('');
            renderBlogs(allBlogs);
        }
    });

    // Initial load
    loadBlogs();
});