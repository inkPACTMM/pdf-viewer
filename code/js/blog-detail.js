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

    // Get blog ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const blogId = urlParams.get('id');

    if (!blogId) {
        showError('No blog ID provided');
        return;
    }

    loadBlog(blogId);
    $('.back-button').on('click', function (e) {
        e.preventDefault();
        if (document.referrer && document.referrer.includes(window.location.host)) {
            history.back();
        } else {
            window.location.href = 'blogs.html';
        }
    });
});

function loadBlog(blogId) {
    showLoadingStates();
    // Fetch blog metadata by id
    fetch(`${API_BASE}/api/blogs/${encodeURIComponent(blogId)}`)
        .then(resp => {
            if (!resp.ok) throw new Error('Network response was not ok');
            return resp.json();
        })
        .then(json => {
            // API returns { success:true, data: {...} } or the blog object directly
            const blog = json && json.data ? json.data : json;
            if (blog) {
                displayBlog(blog);
            } else {
                showError('Blog not found');
            }
        })
        .catch(() => {
            showError('Error loading blog data');
        });
    }

function showLoadingStates() {
    $('#blogImage').hide();
    $('#blogTitle').html(
        '<div class="loading-shimmer" style="width: 60%; height: 40px; margin: 0 auto;"></div>');
    $('#blogDate').html('<div class="loading-shimmer" style="width: 100px; height: 20px;"></div>');
    $('#blogReadTime').html('<div class="loading-shimmer" style="width: 80px; height: 20px;"></div>');
    $('#blogContent').html('<div class="loading-shimmer" style="width: 100%; height: 200px;"></div>');
}

// `API_BASE` and `toAbsolute()` are provided by `code/js/config.js`

function displayBlog(blog) {
    // Update page title
    document.title = `${blog.blogName} - Blog | InkPact Digital Library`;

    // Blog basic info
    // Use server-hosted image when available
    $('#blogImage').attr('src', toAbsolute(blog.image)).attr('alt', blog.blogName).show();
    $('#blogTitle').text(blog.blogName);
    $('#blogDate').text(new Date(blog.date).toLocaleDateString());
    $('#blogReadTime').text(blog.readTime);

    // Categories
    const categories = Array.isArray(blog.categories) ? blog.categories : (blog.category ? [blog.category] : [
        'General'
    ]);
    let categoriesHTML = '';
    categories.forEach(category => {
        categoriesHTML += `<span class="blog-category">${category}</span>`;
    });
    $('#blogCategories').html(categoriesHTML);

    // Writers
    const writers = Array.isArray(blog.writers) ? blog.writers : [blog.writers];
    let writersHTML = '';
    writers.filter(writer => writer && writer.trim()).forEach(writer => {
        writersHTML +=
            `<a href="profile.html?name=${encodeURIComponent(writer)}" class="profile-link">${writer}</a>`;
    });
    $('#writerLinks').html(writersHTML || '<span style="color: #999;">No writers listed</span>');

    // Graphic Designers
    const designers = Array.isArray(blog.graphicDesigners) ? blog.graphicDesigners : [blog.graphicDesigners];
    let designersHTML = '';
    designers.filter(designer => designer && designer.trim()).forEach(designer => {
        designersHTML +=
            `<a href="profile.html?name=${encodeURIComponent(designer)}" class="profile-link designer-link">${designer}</a>`;
    });
    $('#designerLinks').html(designersHTML || '<span style="color: #999;">No designers listed</span>');

    // Load and render Markdown file for blog content using mdPath from JSON
    const mdPath = blog.mdPath ? blog.mdPath : null;
    if (mdPath || blog.markdownContent) {
        // Prefer markdownContent field returned by API when available
        if (blog.markdownContent) {
            const htmlContent = marked.parse(blog.markdownContent);
            $('#blogContent').html(htmlContent);
        } else {
            // Try content endpoint first (may 404), then fallback to mdPath file
            fetch(`${API_BASE}/api/blogs/${encodeURIComponent(blog.id)}/content`)
                .then(resp => {
                    if (resp.ok) return resp.text();
                    // fallback to mdPath (served by API) — ensure absolute URL
                    return fetch(toAbsolute(mdPath)).then(r => r.ok ? r.text() : null);
                })
                .then(mdContent => {
                    if (mdContent) {
                        const htmlContent = marked.parse(mdContent);
                        $('#blogContent').html(htmlContent);
                    } else {
                        $('#blogContent').html(blog.description || 'No content available');
                    }
                })
                .catch(() => {
                    $('#blogContent').html(blog.description || 'No content available');
                });
        }
    } else {
        $('#blogContent').html(blog.description || 'No content available');
    }
}

function showError(message) {
    $('.blog-container').html(`
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error</h3>
                    <p>${message}</p>
                    <a href="blogs.html" class="btn btn-primary mt-3">
                        <i class="fas fa-newspaper mr-2"></i>Browse Blogs
                    </a>
                </div>
            `);
}