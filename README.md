# InkPact Digital Magazine & PDF Viewer

A web-based digital magazine and PDF viewer platform for youth-driven stories, featuring 3D page flip effects, blog publishing, contributor profiles, and responsive design.

## Features

- 3D page flip animation for PDFs (powered by Three.js)
- Digital magazine library with book metadata
- Blog system with Markdown support
- Contributor profiles for writers and graphic designers
- Responsive design for desktop and mobile
- Page thumbnails and book covers
- Mobile-friendly touch controls
- Search and filter for books and blogs
- Social media and contact integration

## Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/inkpact-digital-magazine.git
   ```
2. Place your PDF files in the `pdf/` directory
3. Add book cover images to `images/` or `thumbnails/books/`
4. Add blog Markdown files to `data/blogs/` and update `data/blogs.json`
5. Update `data/books.json` and `data/profiles.json` with your metadata
6. Serve the project through a web server (e.g. VS Code Live Server, nginx, Apache)

## Directory Structure

```
pdf-viewer/
├── code/                 # HTML pages and main app code
│   ├── index.html        # Home page
│   ├── blogs.html        # Blog listing
│   ├── blog-detail.html  # Blog detail (renders Markdown)
│   ├── profile.html      # Contributor profile page
│   ├── library.html      # Book library
│   └── ...
├── css/                  # Stylesheets
├── js/                   # JavaScript files
├── images/               # Image assets
├── pdf/                  # PDF files
├── data/                 # JSON data and Markdown blogs
│   ├── blogs.json        # Blog metadata
│   ├── books.json        # Book metadata
│   ├── profiles.json     # Contributor profiles
│   └── blogs/            # Blog Markdown files (e.g. 1.md, 2.md)
└── thumbnails/           # Book and blog thumbnails
```

## Usage

- **Add a book:**
  1. Place the PDF in `pdf/`
  2. Add a cover image to `images/` or `thumbnails/books/`
  3. Update `data/books.json` with metadata

- **Add a blog post:**
  1. Create a Markdown file in `data/blogs/` (e.g. `1.md`)
  2. Add metadata to `data/blogs.json` (set `mdPath` to the Markdown file)
  3. Add contributor info to `data/profiles.json` if needed

- **Add a contributor profile:**
  1. Add profile info to `data/profiles.json`
  2. Add avatar image to `images/`

## Technologies Used

- HTML, CSS, JavaScript
- Three.js (for 3D page flip)
- marked.js (for Markdown rendering)
- Bootstrap (for layout)
- Font Awesome (icons)

## Contributing

Pull requests and suggestions are welcome! Please open an issue or submit a PR for improvements.

## License

MIT License

---

For more information, visit [inkpactmm.org](https://inkpactmm.org) or contact the InkPact team.
