# PDF Viewer

A web-based PDF viewer with 3D page flip effects built with Three.js.

## Features

- 3D page flip animation
- Support for PDF files
- Responsive design
- Page thumbnails
- Book metadata display
- Mobile friendly touch controls

## Setup

1. Clone the repository
2. Place your PDF files in the `pdf/` directory
3. Update the `data/books.json` with your book metadata
4. Serve through a web server

## Directory Structure

```
pdf-viewer/
├── css/                # Stylesheets
├── js/                 # JavaScript files
├── images/            # Image assets
├── pdf/              # PDF files
└── data/             # JSON data files
```

## Usage

Add books by:

1. Adding PDF file to `pdf/` directory
2. Adding book cover image to `images/book2/` directory
3. Adding book metadata to `data/books.json`

## Credits

Built with:
- Three.js for 3D effects
- PDF.js for PDF rendering
- jQuery for DOM manipulation
