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
    let blogContents = {}; // Cache for loaded markdown content

    // Function to load markdown content
    async function loadMarkdownContent(mdPath) {
        if (blogContents[mdPath]) {
            return blogContents[mdPath];
        }

        try {
            const response = await fetch(mdPath);
            if (response.ok) {
                const content = await response.text();
                blogContents[mdPath] = content.toLowerCase();
                return blogContents[mdPath];
            }
        } catch (error) {
            console.log('Could not load markdown:', mdPath);
        }
        return '';
    }

    // Enhanced search function with markdown content
    async function searchBlogs(searchTerm) {
        const filteredBlogs = [];

        for (const blog of allBlogs) {
            // Search in blog name and description
            const basicMatch = blog.blogName.toLowerCase().includes(searchTerm) ||
                blog.description.toLowerCase().includes(searchTerm);

            // Search in writers array
            const writersMatch = Array.isArray(blog.writers) ?
                blog.writers.some(writer => writer.toLowerCase().includes(searchTerm)) :
                (blog.writers && blog.writers.toLowerCase().includes(searchTerm));

            // Search in graphic designers array
            const designersMatch = Array.isArray(blog.graphicDesigners) ?
                blog.graphicDesigners.some(designer => designer.toLowerCase().includes(searchTerm)) :
                (blog.graphicDesigners && blog.graphicDesigners.toLowerCase().includes(searchTerm));

            // Search in categories array
            const categoriesMatch = Array.isArray(blog.categories) ?
                blog.categories.some(category => category.toLowerCase().includes(searchTerm)) :
                (blog.category && blog.category.toLowerCase().includes(searchTerm));

            // Search in markdown content
            let markdownMatch = false;
            if (blog.mdPath) {
                const markdownContent = await loadMarkdownContent(blog.mdPath);
                markdownMatch = markdownContent.includes(searchTerm);
            }

            // Advanced keyword matching in available text
            const allText = [
                blog.blogName,
                blog.description,
                blog.content || '',
                ...(Array.isArray(blog.writers) ? blog.writers : [blog.writers || '']),
                ...(Array.isArray(blog.graphicDesigners) ? blog.graphicDesigners : [blog.graphicDesigners || '']),
                ...(Array.isArray(blog.categories) ? blog.categories : [blog.category || ''])
            ].join(' ').toLowerCase();

            const keywordMatch = allText.includes(searchTerm);

            if (basicMatch || writersMatch || designersMatch || categoriesMatch || markdownMatch || keywordMatch) {
                filteredBlogs.push(blog);
            }
        }

        return filteredBlogs;
    }

    // Search functionality - Updated to include markdown content search
    $('#searchForm').on('submit', async function (e) {
        e.preventDefault();
        const searchTerm = $('#searchInput').val().toLowerCase().trim();

        if (searchTerm === '') {
            renderBlogs(allBlogs);
            return;
        }

        // Show loading state during search
        $('#blogsGrid').html(`
            <div class="loading-state text-center py-5" style="grid-column: 1 / -1;">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Searching...</span>
                </div>
                <h4 class="mt-3">Searching...</h4>
                <p class="text-muted">Looking through articles and content</p>
            </div>
        `);

        try {
            const filteredBlogs = await searchBlogs(searchTerm);
            // Sort filtered results by date - latest first
            const sortedFilteredBlogs = filteredBlogs.sort((a, b) => new Date(b.date) - new Date(a.date));
            renderBlogs(sortedFilteredBlogs);
        } catch (error) {
            console.error('Search error:', error);
            renderBlogs(allBlogs.filter(blog => {
                // Fallback to basic search if markdown loading fails
                const basicMatch = blog.blogName.toLowerCase().includes(searchTerm) ||
                    blog.description.toLowerCase().includes(searchTerm);
                const writersMatch = Array.isArray(blog.writers) ?
                    blog.writers.some(writer => writer.toLowerCase().includes(searchTerm)) :
                    (blog.writers && blog.writers.toLowerCase().includes(searchTerm));
                return basicMatch || writersMatch;
            }));
        }
    });

    // Enhanced real-time search with markdown content
    let searchTimeout;
    $('#searchInput').on('input', function () {
        const searchTerm = $(this).val().toLowerCase().trim();

        // Clear previous timeout
        clearTimeout(searchTimeout);

        // Add delay to avoid too many searches while typing
        searchTimeout = setTimeout(async () => {
            if (searchTerm.length >= 3) { // Increase to 3 characters for markdown search
                try {
                    // For real-time search, do a quick search first without markdown
                    const quickFilteredBlogs = allBlogs.filter(blog => {
                        const quickMatch = blog.blogName.toLowerCase().includes(searchTerm) ||
                            blog.description.toLowerCase().includes(searchTerm) ||
                            (blog.content && blog.content.toLowerCase().includes(searchTerm));

                        const writersMatch = Array.isArray(blog.writers) ?
                            blog.writers.some(writer => writer.toLowerCase().includes(searchTerm)) :
                            (blog.writers && blog.writers.toLowerCase().includes(searchTerm));

                        const designersMatch = Array.isArray(blog.graphicDesigners) ?
                            blog.graphicDesigners.some(designer => designer.toLowerCase().includes(searchTerm)) :
                            (blog.graphicDesigners && blog.graphicDesigners.toLowerCase().includes(searchTerm));

                        const categoriesMatch = Array.isArray(blog.categories) ?
                            blog.categories.some(category => category.toLowerCase().includes(searchTerm)) :
                            (blog.category && blog.category.toLowerCase().includes(searchTerm));

                        return quickMatch || writersMatch || designersMatch || categoriesMatch;
                    });

                    // Sort and show quick results first
                    const sortedQuickResults = quickFilteredBlogs.sort((a, b) => new Date(b.date) - new Date(a.date));
                    renderBlogs(sortedQuickResults);

                    // Then search markdown content in background and update if needed
                    setTimeout(async () => {
                        try {
                            const fullResults = await searchBlogs(searchTerm);
                            const sortedFullResults = fullResults.sort((a, b) => new Date(b.date) - new Date(a.date));

                            // Only update if results are different and search term hasn't changed
                            if ($('#searchInput').val().toLowerCase().trim() === searchTerm &&
                                sortedFullResults.length !== sortedQuickResults.length) {
                                renderBlogs(sortedFullResults);
                            }
                        } catch (error) {
                            console.log('Background markdown search failed:', error);
                        }
                    }, 100);

                } catch (error) {
                    console.error('Real-time search error:', error);
                }
            } else if (searchTerm.length === 0) {
                renderBlogs(allBlogs);
            }
        }, 500); // Increased delay for markdown search
    });

    // Preload popular blog markdown content for faster search
    function preloadPopularContent() {
        // Preload the first 5 most recent blogs
        const recentBlogs = allBlogs.slice(0, 5);
        recentBlogs.forEach(blog => {
            if (blog.mdPath) {
                loadMarkdownContent(blog.mdPath);
            }
        });
    }

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
                // Sort blogs by date - latest first
                allBlogs = data.blogs.sort((a, b) => new Date(b.date) - new Date(a.date));
                renderBlogs(allBlogs);

                // Preload some content for faster search
                setTimeout(preloadPopularContent, 1000);
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

    // Initial load
    loadBlogs();
});