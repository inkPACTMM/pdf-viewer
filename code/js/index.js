  $(document).ready(function () {
      // `API_BASE` and `toAbsolute()` are provided by `code/js/config.js`
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

      // Add smooth scroll behavior for mobile menu
      $('.navbar-toggler').on('click', function () {
          setTimeout(() => {
              if ($('.navbar-collapse').hasClass('show')) {
                  $('body').addClass('menu-open');
              } else {
                  $('body').removeClass('menu-open');
              }
          }, 10);
      });

      // Intersection Observer for animations
      const observerOptions = {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  entry.target.style.animationPlayState = 'running';
              }
          });
      }, observerOptions);

      // Observe elements for animation
      $('.section-title, .book-card').each(function () {
          observer.observe(this);
      });

      // Load latest books with loading state
      function showLoadingState(container) {
          for (let i = 0; i < 4; i++) {
              const loadingCard = `
                        <div class="col-md-3">
                            <div class="book-card loading-shimmer" style="height: 300px;">
                            </div>
                        </div>
                    `;
              $(container).append(loadingCard);
          }
      }

      // Show loading states
      showLoadingState('#latestBlogs');
      showLoadingState('#latestBooks');

      // Load latest books (from API)
      (function loadLatestBooks() {
          fetch(`${API_BASE}/api/books`)
              .then(resp => {
                  if (!resp.ok) throw new Error('Failed to fetch books');
                  return resp.json();
              })
              .then(data => {
                  $('#latestBooks').empty();
                  const list = data.data || data.books || data;
                  const latestBooks = (list || [])
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .slice(0, 4);
                  renderBooks('#latestBooks', latestBooks);
              })
              .catch(() => {
                  $('#latestBooks').html(
                      '<div class="col-12 text-center"><p>Unable to load latest books</p></div>');
              });
      })();

      // Load latest blogs - NEW (from API)
      (function loadLatestBlogs() {
          fetch(`${API_BASE}/api/blogs`)
              .then(resp => {
                  if (!resp.ok) throw new Error('Failed to fetch blogs');
                  return resp.json();
              })
                  .then(data => {
                      $('#latestBlogs').empty();
                      // API may return { success:true, count:n, data:[...] } or { blogs:[...] } or an array
                      const list = data.data || data.blogs || data;
                      const latestBlogs = (list || [])
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .slice(0, 4);
                      renderBlogs('#latestBlogs', latestBlogs);
                  })
              .catch(() => {
                  $('#latestBlogs').html(
                      '<div class="col-12 text-center"><p>Unable to load latest blogs</p></div>');
              });
      })();

      function renderBooks(container, books) {
          books.forEach((book, index) => {
              const bookCard = `
                        <div class="col-lg-3 col-md-4 col-sm-6">
                            <div class="book-card" style="animation-delay: ${index * 0.1}s">
                                <a href="v-pdf.html?id=${book.id}">
                                    <div class="thumbnail-wrapper">
                                        <img src="${toAbsolute(book.thumbnail)}" class="thumbnail" alt="${book.title}" loading="lazy">
                                        <div class="book-tooltip">${book.title}</div>
                                    </div>
                                    <h5 class="book-title">${book.title}</h5>
                                    <p class="book-author">${book.author}</p>
                                </a>
                            </div>
                        </div>
                    `;
              $(container).append(bookCard);
          });

          // Re-observe new elements
          $(container).find('.book-card').each(function () {
              observer.observe(this);
          });

          // Enhanced tooltip positioning for edge cases
          $('.book-tooltip').each(function () {
              const $tooltip = $(this);
              const $card = $tooltip.closest('.book-card');

              // Adjust tooltip position if it would go off-screen
              $card.on('mouseenter', function () {
                  setTimeout(() => {
                      const tooltipRect = $tooltip[0].getBoundingClientRect();
                      const viewportWidth = window.innerWidth;

                      if (tooltipRect.left < 10) {
                          $tooltip.css({
                              'left': '10px',
                              'transform': 'translateX(0) translateY(-5px)'
                          });
                      } else if (tooltipRect.right > viewportWidth - 10) {
                          $tooltip.css({
                              'left': 'auto',
                              'right': '10px',
                              'transform': 'translateX(0) translateY(-5px)'
                          });
                      }
                  }, 50);
              });

              $card.on('mouseleave', function () {
                  $tooltip.css({
                      'left': '50%',
                      'right': 'auto',
                      'transform': 'translateX(-50%)'
                  });
              });
          });
      }

      // NEW: Render blogs function
      function renderBlogs(container, blogs) {
          blogs.forEach((blog, index) => {
              // Handle multiple writers, designers, and categories
              const writersText = Array.isArray(blog.writers) ? blog.writers.join(', ') : blog
                  .writers || 'Unknown';
              const categories = Array.isArray(blog.categories) ? blog.categories : (blog
                  .category ? [blog.category] : ['General']);
              const categoriesHTML = categories.slice(0, 3).map(cat =>
                  `<span class="blog-category-home">${cat}</span>`).join('');

              const blogCard = `
                        <div class="col-lg-3 col-md-6 col-sm-6">
                            <div class="blog-card-home" style="animation-delay: ${index * 0.1}s">
                                <a href="blog-detail.html?id=${blog.id}">
                                    <div class="blog-thumbnail-wrapper">
                                        <img src="${toAbsolute(blog.image)}" class="blog-thumbnail" alt="${blog.blogName}" loading="lazy">
                                        <div class="blog-categories-home">
                                            ${categoriesHTML}
                                        </div>
                                    </div>
                                    <div class="blog-content-home">
                                        <h5 class="blog-title-home">${blog.blogName}</h5>
                                        <div class="blog-meta-home">
                                            <span class="blog-writer_home">
                                                <i class="fas fa-pen mr-1"></i>
                                                ${writersText}
                                            </span>
                                            <span class="blog-date-home">
                                                <i class="fas fa-calendar mr-1"></i>
                                                ${new Date(blog.date).toLocaleDateString()}
                                            </span>
                                            <span class="blog-read-time-home">
                                                <i class="fas fa-clock mr-1"></i>
                                                ${blog.readTime}
                                            </span>
                                        </div>
                                        <p class="blog-description-home">${blog.description}</p>
                                        <span class="blog-read-more-home">
                                            Read Story <i class="fas fa-arrow-right ml-1"></i>
                                        </span>
                                    </div>
                                </a>
                            </div>
                        </div>
                    `;
              $(container).append(blogCard);
          });

          // Re-observe new elements
          $(container).find('.blog-card-home').each(function () {
              observer.observe(this);
          });
      }

      // Active page highlighting
      const currentPage = window.location.pathname.split("/").pop();
      $('.nav-item .nav-link').each(function () {
          const href = $(this).attr('href');
          if (href === currentPage || (currentPage === '' && href === 'index.html')) {
              $(this).parent().addClass('active');
          }
      });

      // Enhanced search form interaction
      $('#searchInput').on('focus', function () {
          $(this).closest('.input-group').addClass('focused');
      }).on('blur', function () {
          $(this).closest('.input-group').removeClass('focused');
      });
  });