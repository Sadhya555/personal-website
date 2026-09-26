# Portfolio site — Sannidhya Roy Sadhya

Plain HTML/CSS/JS, no build step, no framework, no dependencies beyond
Google Fonts (Inter + JetBrains Mono).

## Structure

```
/                       home
/about/index.html       about
/experience/index.html  experience
/projects/index.html    projects
/extracurriculars/index.html
/education/index.html
/awards/index.html
/skills/index.html
/contact/index.html
/assets/css/style.css   all styling
/assets/js/main.js      scroll-reveal + accordion (progressive enhancement)
/assets/img/profile.jpg your photo (add this — see assets/img/README.md)
/assets/Sannidhya_Roy_Sadhya_Resume.pdf   your resume (add this)
```

## Local preview

No build tool needed — serve the folder with any static file server, e.g.:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.
